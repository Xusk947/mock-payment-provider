package services

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/xusk947/mock-payment-provider/internal/repository"
	db "github.com/xusk947/mock-payment-provider/sqlc"
)

// TransactionService handles business logic for transactions
type TransactionService struct {
	txRepo         *repository.TransactionRepository
	merchantRepo   *repository.MerchantRepository
	cardRepo       *repository.CardRepository
	cardService    *CardValidationService
	threeDSService *ThreeDSService
	errorService   *ErrorScenarioService
	webhookService *WebhookService
}

// NewTransactionService creates a new transaction service
func NewTransactionService(
	txRepo *repository.TransactionRepository,
	merchantRepo *repository.MerchantRepository,
	cardRepo *repository.CardRepository,
	cardService *CardValidationService,
	threeDSService *ThreeDSService,
	errorService *ErrorScenarioService,
	webhookService *WebhookService,
) *TransactionService {
	return &TransactionService{
		txRepo:         txRepo,
		merchantRepo:   merchantRepo,
		cardRepo:       cardRepo,
		cardService:    cardService,
		threeDSService: threeDSService,
		errorService:   errorService,
		webhookService: webhookService,
	}
}

// Get retrieves a transaction by ID
func (s *TransactionService) Get(ctx context.Context, id int) (*db.Transaction, error) {
	return s.txRepo.Get(ctx, id)
}

// List retrieves all transactions with pagination
func (s *TransactionService) List(ctx context.Context, limit, offset int) ([]db.Transaction, error) {
	return s.txRepo.List(ctx, limit, offset)
}

// Charge creates a new charge transaction
func (s *TransactionService) Charge(ctx context.Context, req *ChargeRequest) (*db.Transaction, error) {
	// Validate card
	err := s.cardService.ValidateCard(ctx, req.CardNumber, req.CardholderName, req.CVV, req.ExpiryMonth, req.ExpiryYear)
	if err != nil {
		return nil, fmt.Errorf("card validation failed: %w", err)
	}

	// Get merchant by API key
	merchant, err := s.merchantRepo.GetByAPIKey(ctx, req.APIKey)
	if err != nil {
		return nil, fmt.Errorf("invalid API key")
	}

	// Check if 3D Secure is required
	cardResponseScenario, _ := s.cardService.GetTestCard(ctx, req.CardNumber)
	var card *db.Card
	if cardResponseScenario != "success" {
		card, _ = s.cardRepo.GetByCardNumber(ctx, req.CardNumber)
	}

	threeDSRequired := s.threeDSService.CheckRequired(ctx, card != nil && card.Require3ds.Valid && card.Require3ds.Bool)
	if threeDSRequired && !req.ThreeDSAuthenticated {
		// 3D Secure challenge required
		tx := &db.Transaction{
			Amount:          req.Amount,
			Currency:        req.Currency,
			Status:          "pending",
			TransactionType: sql.NullString{String: "charge", Valid: true},
			PaymentMethod:   "card",
			MerchantID:      sql.NullInt64{Int64: merchant.ID, Valid: true},
			ThreeDsRequired: sql.NullBool{Bool: true, Valid: true},
			CardNumberLast4: sql.NullString{String: getLast4(req.CardNumber), Valid: true},
			CardType:        sql.NullString{String: req.CardType, Valid: true},
			AmountCaptured:  sql.NullFloat64{Float64: req.Amount, Valid: true},
		}
		err = s.txRepo.CreateFull(ctx, tx)
		return tx, fmt.Errorf("3D Secure required")
	}

	// Create transaction
	tx := &db.Transaction{
		Amount:               req.Amount,
		Currency:             req.Currency,
		Status:               "pending",
		TransactionType:      sql.NullString{String: "charge", Valid: true},
		PaymentMethod:        "card",
		MerchantID:           sql.NullInt64{Int64: merchant.ID, Valid: true},
		CardNumberLast4:      sql.NullString{String: getLast4(req.CardNumber), Valid: true},
		CardType:             sql.NullString{String: req.CardType, Valid: true},
		AuthorizationCode:    sql.NullString{String: getAuthCode(), Valid: true},
		ThreeDsRequired:      sql.NullBool{Bool: threeDSRequired, Valid: true},
		ThreeDsAuthenticated: sql.NullBool{Bool: req.ThreeDSAuthenticated, Valid: true},
		AmountCaptured:       sql.NullFloat64{Float64: req.Amount, Valid: true},
	}

	// Apply error scenario
	scenario, err := s.errorService.GetActiveScenario(ctx)
	if err == nil && scenario != nil {
		scenario, err = s.errorService.ApplyScenario(ctx, scenario, cardResponseScenario)
		if err == nil && scenario != nil {
			tx.Status = "failed"
			tx.ErrorCode = sql.NullString{String: scenario.ErrorCode, Valid: true}
			tx.ErrorMessage = sql.NullString{String: scenario.ErrorMessage, Valid: true}
		}
	} else {
		tx.Status = "completed"
	}

	err = s.txRepo.CreateFull(ctx, tx)
	if err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	// Send webhook if transaction completed
	if tx.Status == "completed" {
		go s.webhookService.SendWebhook(context.Background(), int(merchant.ID), "charge.completed", tx)
	} else if tx.Status == "failed" {
		go s.webhookService.SendWebhook(context.Background(), int(merchant.ID), "charge.failed", tx)
	}

	return tx, nil
}

// Hold creates a hold transaction
func (s *TransactionService) Hold(ctx context.Context, req *ChargeRequest) (*db.Transaction, error) {
	// Validate card
	err := s.cardService.ValidateCard(ctx, req.CardNumber, req.CardholderName, req.CVV, req.ExpiryMonth, req.ExpiryYear)
	if err != nil {
		return nil, fmt.Errorf("card validation failed: %w", err)
	}

	// Get merchant by API key
	merchant, err := s.merchantRepo.GetByAPIKey(ctx, req.APIKey)
	if err != nil {
		return nil, fmt.Errorf("invalid API key")
	}

	// Create hold transaction
	expiresAt := time.Now().Add(7 * 24 * time.Hour) // 7 days hold
	tx := &db.Transaction{
		Amount:            req.Amount,
		Currency:          req.Currency,
		Status:            "authorized",
		TransactionType:   sql.NullString{String: "hold", Valid: true},
		PaymentMethod:     "card",
		MerchantID:        sql.NullInt64{Int64: merchant.ID, Valid: true},
		CardNumberLast4:   sql.NullString{String: getLast4(req.CardNumber), Valid: true},
		CardType:          sql.NullString{String: req.CardType, Valid: true},
		AuthorizationCode: sql.NullString{String: getAuthCode(), Valid: true},
		AmountCaptured:    sql.NullFloat64{Float64: 0, Valid: true},
		ExpiresAt:         sql.NullTime{Time: expiresAt, Valid: true},
	}

	err = s.txRepo.CreateFull(ctx, tx)
	if err != nil {
		return nil, fmt.Errorf("failed to create hold: %w", err)
	}

	go s.webhookService.SendWebhook(context.Background(), int(merchant.ID), "hold.created", tx)

	return tx, nil
}

// Capture captures a hold transaction
func (s *TransactionService) Capture(ctx context.Context, holdID int, amount float64, apiKey string) (*db.Transaction, error) {
	// Get hold transaction
	hold, err := s.txRepo.Get(ctx, holdID)
	if err != nil {
		return nil, fmt.Errorf("hold not found: %w", err)
	}

	if hold.TransactionType.String != "hold" {
		return nil, fmt.Errorf("transaction is not a hold")
	}

	if hold.Status != "authorized" {
		return nil, fmt.Errorf("hold cannot be captured")
	}

	// Validate merchant
	_, err = s.merchantRepo.GetByAPIKey(ctx, apiKey)
	if err != nil {
		return nil, fmt.Errorf("invalid API key")
	}

	// Create capture transaction
	tx := &db.Transaction{
		Amount:              amount,
		Currency:            hold.Currency,
		Status:              "captured",
		TransactionType:     sql.NullString{String: "capture", Valid: true},
		PaymentMethod:       hold.PaymentMethod,
		MerchantID:          hold.MerchantID,
		ParentTransactionID: sql.NullInt64{Int64: int64(holdID), Valid: true},
		CardNumberLast4:     hold.CardNumberLast4,
		CardType:            hold.CardType,
		AuthorizationCode:   hold.AuthorizationCode,
		AmountCaptured:      sql.NullFloat64{Float64: amount, Valid: true},
	}

	err = s.txRepo.CreateFull(ctx, tx)
	if err != nil {
		return nil, fmt.Errorf("failed to create capture: %w", err)
	}

	// Update hold to captured
	err = s.txRepo.UpdateStatus(ctx, holdID, "captured")
	if err != nil {
		return nil, fmt.Errorf("failed to update hold status: %w", err)
	}

	if hold.MerchantID.Valid {
		go s.webhookService.SendWebhook(context.Background(), int(hold.MerchantID.Int64), "capture.completed", tx)
	}

	return tx, nil
}

// Refund creates a refund transaction
func (s *TransactionService) Refund(ctx context.Context, transactionID int, amount float64, apiKey string) (*db.Transaction, error) {
	// Get original transaction
	originalTx, err := s.txRepo.Get(ctx, transactionID)
	if err != nil {
		return nil, fmt.Errorf("transaction not found: %w", err)
	}

	if originalTx.TransactionType.String == "refund" {
		return nil, fmt.Errorf("cannot refund a refund")
	}

	if originalTx.Status != "completed" && originalTx.Status != "captured" {
		return nil, fmt.Errorf("transaction cannot be refunded")
	}

	// Validate merchant
	_, err = s.merchantRepo.GetByAPIKey(ctx, apiKey)
	if err != nil {
		return nil, fmt.Errorf("invalid API key")
	}

	// Create refund transaction
	tx := &db.Transaction{
		Amount:              amount,
		Currency:            originalTx.Currency,
		Status:              "refunded",
		TransactionType:     sql.NullString{String: "refund", Valid: true},
		PaymentMethod:       originalTx.PaymentMethod,
		MerchantID:          originalTx.MerchantID,
		ParentTransactionID: sql.NullInt64{Int64: int64(transactionID), Valid: true},
		CardNumberLast4:     originalTx.CardNumberLast4,
		CardType:            originalTx.CardType,
		AuthorizationCode:   sql.NullString{String: getAuthCode(), Valid: true},
		AmountRefunded:      sql.NullFloat64{Float64: amount, Valid: true},
	}

	err = s.txRepo.CreateFull(ctx, tx)
	if err != nil {
		return nil, fmt.Errorf("failed to create refund: %w", err)
	}

	// Update original transaction refund amount
	if originalTx.MerchantID.Valid {
		go s.webhookService.SendWebhook(context.Background(), int(originalTx.MerchantID.Int64), "refund.completed", tx)
	}

	return tx, nil
}

// ChargeRequest represents a charge/hold request
type ChargeRequest struct {
	APIKey               string  `json:"api_key"`
	Amount               float64 `json:"amount"`
	Currency             string  `json:"currency"`
	CardNumber           string  `json:"card_number"`
	CardholderName       string  `json:"cardholder_name"`
	CVV                  string  `json:"cvv"`
	ExpiryMonth          int     `json:"expiry_month"`
	ExpiryYear           int     `json:"expiry_year"`
	CardType             string  `json:"card_type"`
	ThreeDSAuthenticated bool    `json:"three_ds_authenticated"`
}

// getLast4 gets the last 4 digits of a card number
func getLast4(cardNumber string) string {
	if len(cardNumber) < 4 {
		return cardNumber
	}
	return cardNumber[len(cardNumber)-4:]
}

// getAuthCode generates a random authorization code
func getAuthCode() string {
	return strings.ToUpper(uuid.New().String()[:8])
}
