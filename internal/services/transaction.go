package services

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/xusk947/mock-payment-provider/internal/models"
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
func (s *TransactionService) Charge(ctx context.Context, req *models.ChargeRequest) (*db.Transaction, error) {
	// Validate card
	err := s.cardService.ValidateCard(ctx, req.CardNumber, req.CardholderName, req.CVV, req.ExpiryMonth, req.ExpiryYear)
	if err != nil {
		return nil, fmt.Errorf("card validation failed: %w", err)
	}

	// Get merchant by API key
	merchant, err := s.merchantRepo.GetByAPIKey(ctx, req.APIKey)
	if err != nil {
		return nil, ErrInvalidAPIKey
	}

	// Check if 3D Secure is required
	cardResponseScenario, _ := s.cardService.GetTestCard(ctx, req.CardNumber)
	var card *db.Card
	if cardResponseScenario != models.ScenarioSuccess {
		card, _ = s.cardRepo.GetByCardNumber(ctx, req.CardNumber)
	}

	threeDSRequired := s.threeDSService.CheckRequired(ctx, card != nil && card.Require3ds.Valid && card.Require3ds.Bool)
	if threeDSRequired && !req.ThreeDSAuthenticated {
		// 3D Secure challenge required
		tx := &db.Transaction{
			Amount:          req.Amount,
			Currency:        req.Currency,
			Status:          string(models.StatusPending),
			TransactionType: sql.NullString{String: string(models.TypeCharge), Valid: true},
			PaymentMethod:   models.MethodCard,
			MerchantID:      sql.NullInt64{Int64: merchant.ID, Valid: true},
			ThreeDsRequired: sql.NullBool{Bool: true, Valid: true},
			CardNumberLast4: sql.NullString{String: last4(req.CardNumber), Valid: true},
			CardType:        sql.NullString{String: req.CardType, Valid: true},
			AmountCaptured:  sql.NullFloat64{Float64: req.Amount, Valid: true},
		}
		_ = s.txRepo.CreateFull(ctx, tx)
		return tx, ErrThreeDSRequired
	}

	// Create transaction
	tx := &db.Transaction{
		Amount:               req.Amount,
		Currency:             req.Currency,
		Status:               string(models.StatusPending),
		TransactionType:      sql.NullString{String: string(models.TypeCharge), Valid: true},
		PaymentMethod:        models.MethodCard,
		MerchantID:           sql.NullInt64{Int64: merchant.ID, Valid: true},
		CardNumberLast4:      sql.NullString{String: last4(req.CardNumber), Valid: true},
		CardType:             sql.NullString{String: req.CardType, Valid: true},
		AuthorizationCode:    sql.NullString{String: authCode(), Valid: true},
		ThreeDsRequired:      sql.NullBool{Bool: threeDSRequired, Valid: true},
		ThreeDsAuthenticated: sql.NullBool{Bool: req.ThreeDSAuthenticated, Valid: true},
		AmountCaptured:       sql.NullFloat64{Float64: req.Amount, Valid: true},
	}

	// Apply error scenario only for non-success cards
	if cardResponseScenario != models.ScenarioSuccess {
		scenario, err := s.errorService.GetActiveScenario(ctx)
		if err == nil && scenario != nil {
			scenario, err = s.errorService.ApplyScenario(ctx, scenario, cardResponseScenario)
			if err == nil && scenario != nil {
				tx.Status = string(models.StatusFailed)
				tx.ErrorCode = sql.NullString{String: scenario.ErrorCode, Valid: true}
				tx.ErrorMessage = sql.NullString{String: scenario.ErrorMessage, Valid: true}
			}
		}
	} else {
		tx.Status = string(models.StatusCompleted)
	}

	if err := s.txRepo.CreateFull(ctx, tx); err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	// Send webhook if transaction completed
	if tx.Status == string(models.StatusCompleted) {
		// #nosec G118 -- async webhook, intentionally uses background context
		go s.webhookService.SendWebhook(context.Background(), int(merchant.ID), "charge.completed", tx)
	} else if tx.Status == string(models.StatusFailed) {
		// #nosec G118 -- async webhook, intentionally uses background context
		go s.webhookService.SendWebhook(context.Background(), int(merchant.ID), "charge.failed", tx)
	}

	return tx, nil
}

// CreateInvoice creates a pending charge transaction (invoice) without card details
func (s *TransactionService) CreateInvoice(ctx context.Context, apiKey string, amount float64, currency, metadata string) (*db.Transaction, error) {
	merchant, err := s.merchantRepo.GetByAPIKey(ctx, apiKey)
	if err != nil {
		return nil, ErrInvalidAPIKey
	}

	tx := &db.Transaction{
		Amount:          amount,
		Currency:        currency,
		Status:          string(models.StatusPending),
		TransactionType: sql.NullString{String: string(models.TypeCharge), Valid: true},
		PaymentMethod:   models.MethodCard,
		MerchantID:      sql.NullInt64{Int64: merchant.ID, Valid: true},
		AmountCaptured:  sql.NullFloat64{Float64: 0, Valid: true},
	}
	if metadata != "" {
		tx.Metadata = sql.NullString{String: metadata, Valid: true}
	}

	if err := s.txRepo.CreateFull(ctx, tx); err != nil {
		return nil, fmt.Errorf("failed to create invoice: %w", err)
	}

	return tx, nil
}

// PayInvoice processes payment for an existing pending invoice using card details
func (s *TransactionService) PayInvoice(ctx context.Context, id int, req *models.ChargeRequest) (*db.Transaction, error) {
	// Get existing invoice
	tx, err := s.txRepo.Get(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("invoice not found: %w", err)
	}
	if tx.TransactionType.String != "charge" || tx.Status != "pending" {
		return nil, fmt.Errorf("invalid invoice state")
	}

	// Validate card
	if err := s.cardService.ValidateCard(ctx, req.CardNumber, req.CardholderName, req.CVV, req.ExpiryMonth, req.ExpiryYear); err != nil {
		return nil, fmt.Errorf("%w: %v", ErrCardValidationFailed, err)
	}

	// Check if 3D Secure is required
	cardResponseScenario, _ := s.cardService.GetTestCard(ctx, req.CardNumber)
	var card *db.Card
	if cardResponseScenario != models.ScenarioSuccess {
		card, _ = s.cardRepo.GetByCardNumber(ctx, req.CardNumber)
	}

	threeDSRequired := s.threeDSService.CheckRequired(ctx, card != nil && card.Require3ds.Valid && card.Require3ds.Bool)
	if threeDSRequired && !req.ThreeDSAuthenticated {
		// Update invoice for 3DS
		tx.ThreeDsRequired = sql.NullBool{Bool: true, Valid: true}
		tx.CardNumberLast4 = sql.NullString{String: last4(req.CardNumber), Valid: true}
		tx.CardType = sql.NullString{String: req.CardType, Valid: true}
		_ = s.txRepo.UpdateStatus(ctx, id, string(models.StatusPending))
		return tx, ErrThreeDSRequired
	}

	// Update invoice with card details and process
	tx.CardNumberLast4 = sql.NullString{String: last4(req.CardNumber), Valid: true}
	tx.CardType = sql.NullString{String: req.CardType, Valid: true}
	tx.AuthorizationCode = sql.NullString{String: authCode(), Valid: true}
	tx.ThreeDsRequired = sql.NullBool{Bool: threeDSRequired, Valid: true}
	tx.ThreeDsAuthenticated = sql.NullBool{Bool: req.ThreeDSAuthenticated, Valid: true}

	// Apply error scenario
	if req.Scenario == models.ScenarioSuccess {
		// Explicit success requested
		tx.Status = string(models.StatusCompleted)
	} else if req.Scenario != "" {
		// Explicit scenario requested
		scenario, err := s.errorService.GetScenarioByName(ctx, req.Scenario)
		if err == nil && scenario != nil {
			tx.Status = string(models.StatusFailed)
			tx.ErrorCode = sql.NullString{String: scenario.ErrorCode, Valid: true}
			tx.ErrorMessage = sql.NullString{String: scenario.ErrorMessage, Valid: true}
		} else {
			// Unknown scenario, default to completed
			tx.Status = string(models.StatusCompleted)
		}
	} else {
		// Use random error scenario logic
		scenario, err := s.errorService.GetActiveScenario(ctx)
		if err == nil && scenario != nil {
			scenario, err = s.errorService.ApplyScenario(ctx, scenario, cardResponseScenario)
			if err == nil && scenario != nil {
				tx.Status = string(models.StatusFailed)
				tx.ErrorCode = sql.NullString{String: scenario.ErrorCode, Valid: true}
				tx.ErrorMessage = sql.NullString{String: scenario.ErrorMessage, Valid: true}
			}
		} else {
			tx.Status = string(models.StatusCompleted)
		}
	}

	if err := s.txRepo.UpdateFull(ctx, tx); err != nil {
		return nil, fmt.Errorf("failed to update invoice: %w", err)
	}

	if tx.MerchantID.Valid {
		if tx.Status == "completed" {
			// #nosec G118 -- async webhook, intentionally uses background context
			go s.webhookService.SendWebhook(context.Background(), int(tx.MerchantID.Int64), "charge.completed", tx)
		} else if tx.Status == "failed" {
			// #nosec G118 -- async webhook, intentionally uses background context
			go s.webhookService.SendWebhook(context.Background(), int(tx.MerchantID.Int64), "charge.failed", tx)
		}
	}

	return tx, nil
}

// Hold creates a hold transaction
func (s *TransactionService) Hold(ctx context.Context, req *models.ChargeRequest) (*db.Transaction, error) {
	// Validate card
	err := s.cardService.ValidateCard(ctx, req.CardNumber, req.CardholderName, req.CVV, req.ExpiryMonth, req.ExpiryYear)
	if err != nil {
		return nil, fmt.Errorf("card validation failed: %w", err)
	}

	// Get merchant by API key
	merchant, err := s.merchantRepo.GetByAPIKey(ctx, req.APIKey)
	if err != nil {
		return nil, ErrInvalidAPIKey
	}

	// Create hold transaction
	expiresAt := time.Now().Add(7 * 24 * time.Hour) // 7 days hold
	tx := &db.Transaction{
		Amount:            req.Amount,
		Currency:          req.Currency,
		Status:            string(models.StatusAuthorized),
		TransactionType:   sql.NullString{String: string(models.TypeHold), Valid: true},
		PaymentMethod:     models.MethodCard,
		MerchantID:        sql.NullInt64{Int64: merchant.ID, Valid: true},
		CardNumberLast4:   sql.NullString{String: last4(req.CardNumber), Valid: true},
		CardType:          sql.NullString{String: req.CardType, Valid: true},
		AuthorizationCode: sql.NullString{String: authCode(), Valid: true},
		AmountCaptured:    sql.NullFloat64{Float64: 0, Valid: true},
		ExpiresAt:         sql.NullTime{Time: expiresAt, Valid: true},
	}

	if err := s.txRepo.CreateFull(ctx, tx); err != nil {
		return nil, fmt.Errorf("failed to create hold: %w", err)
	}

	// #nosec G118 -- async webhook, intentionally uses background context
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

	if hold.TransactionType.String != string(models.TypeHold) {
		return nil, ErrNotAHold
	}

	if hold.Status != string(models.StatusAuthorized) {
		return nil, ErrHoldCannotBeCaptured
	}

	// Validate merchant
	_, err = s.merchantRepo.GetByAPIKey(ctx, apiKey)
	if err != nil {
		return nil, ErrInvalidAPIKey
	}

	tx := s.newCaptureFromHold(hold, amount)

	if err := s.txRepo.CreateFull(ctx, tx); err != nil {
		return nil, fmt.Errorf("failed to create capture: %w", err)
	}
	if err := s.txRepo.UpdateStatus(ctx, holdID, string(models.StatusCaptured)); err != nil {
		return nil, fmt.Errorf("failed to update hold status: %w", err)
	}

	if hold.MerchantID.Valid {
		// #nosec G118 -- async webhook, intentionally uses background context
		go s.webhookService.SendWebhook(context.Background(), int(hold.MerchantID.Int64), "capture.completed", tx)
	}

	return tx, nil
}

// Refund creates a refund transaction
func (s *TransactionService) Refund(ctx context.Context, transactionID int, amount float64, apiKey string) (*db.Transaction, error) {
	if amount <= 0 {
		return nil, ErrRefundAmountMustBePositive
	}

	// Get original transaction
	originalTx, err := s.txRepo.Get(ctx, transactionID)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrTransactionNotFound, err)
	}

	if originalTx.TransactionType.String == string(models.TypeRefund) {
		return nil, ErrCannotRefundRefund
	}

	if originalTx.Status != string(models.StatusCompleted) && originalTx.Status != string(models.StatusCaptured) {
		return nil, ErrTransactionCannotBeRefunded
	}

	refundedSoFar := 0.0
	if originalTx.AmountRefunded.Valid {
		refundedSoFar = originalTx.AmountRefunded.Float64
	}
	if refundedSoFar >= originalTx.Amount {
		return nil, ErrAlreadyFullyRefunded
	}
	if refundedSoFar+amount > originalTx.Amount {
		return nil, ErrRefundExceedsAmount
	}

	// Check for duplicate refund (same amount for same parent)
	existingRefunds, err := s.txRepo.GetRefundsByParentID(ctx, transactionID)
	if err == nil {
		for _, r := range existingRefunds {
			if r.Amount == amount {
				return nil, ErrDuplicateRefund
			}
		}
	}

	// Validate merchant
	_, err = s.merchantRepo.GetByAPIKey(ctx, apiKey)
	if err != nil {
		return nil, ErrInvalidAPIKey
	}

	tx := s.newRefundFromOriginal(originalTx, amount, transactionID)

	if err := s.txRepo.CreateFull(ctx, tx); err != nil {
		return nil, fmt.Errorf("failed to create refund: %w", err)
	}

	if err := s.txRepo.UpdateRefundAmount(ctx, transactionID, amount); err != nil {
		return nil, fmt.Errorf("failed to update original transaction refund amount: %w", err)
	}

	if originalTx.MerchantID.Valid {
		// #nosec G118 -- async webhook, intentionally uses background context
		go s.webhookService.SendWebhook(context.Background(), int(originalTx.MerchantID.Int64), "refund.completed", tx)
	}

	return tx, nil
}

// Confirm marks a pending transaction as completed
func (s *TransactionService) Confirm(ctx context.Context, id int) (*db.Transaction, error) {
	tx, err := s.txRepo.Get(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrTransactionNotFound, err)
	}
	if tx.Status != string(models.StatusPending) {
		return nil, ErrTransactionNotPending
	}
	if err := s.txRepo.UpdateStatus(ctx, id, string(models.StatusCompleted)); err != nil {
		return nil, fmt.Errorf("failed to confirm transaction: %w", err)
	}
	tx.Status = string(models.StatusCompleted)
	return tx, nil
}

// Reject marks a pending or authorized transaction as failed
func (s *TransactionService) Reject(ctx context.Context, id int) (*db.Transaction, error) {
	tx, err := s.txRepo.Get(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrTransactionNotFound, err)
	}
	if tx.Status != string(models.StatusPending) && tx.Status != string(models.StatusAuthorized) {
		return nil, ErrTransactionCannotBeRejected
	}
	if err := s.txRepo.UpdateStatus(ctx, id, string(models.StatusFailed)); err != nil {
		return nil, fmt.Errorf("failed to reject transaction: %w", err)
	}
	tx.Status = string(models.StatusFailed)
	return tx, nil
}

// CaptureByID captures a hold transaction by its ID (admin endpoint, no API key check).
func (s *TransactionService) CaptureByID(ctx context.Context, holdID int, amount float64) (*db.Transaction, error) {
	hold, err := s.txRepo.Get(ctx, holdID)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrHoldNotFound, err)
	}
	if hold.TransactionType.String != string(models.TypeHold) {
		return nil, ErrNotAHold
	}
	if hold.Status != string(models.StatusAuthorized) {
		return nil, ErrHoldCannotBeCaptured
	}

	tx := s.newCaptureFromHold(hold, amount)

	if err := s.txRepo.CreateFull(ctx, tx); err != nil {
		return nil, fmt.Errorf("failed to create capture: %w", err)
	}
	if err := s.txRepo.UpdateStatus(ctx, holdID, string(models.StatusCaptured)); err != nil {
		return nil, fmt.Errorf("failed to update hold status: %w", err)
	}
	return tx, nil
}

// RefundByID refunds a transaction by its ID (admin endpoint, no API key check).
func (s *TransactionService) RefundByID(ctx context.Context, transactionID int, amount float64) (*db.Transaction, error) {
	if amount <= 0 {
		return nil, ErrRefundAmountMustBePositive
	}

	originalTx, err := s.txRepo.Get(ctx, transactionID)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrTransactionNotFound, err)
	}
	if originalTx.TransactionType.String == string(models.TypeRefund) {
		return nil, ErrCannotRefundRefund
	}
	if originalTx.Status != string(models.StatusCompleted) && originalTx.Status != string(models.StatusCaptured) {
		return nil, ErrTransactionCannotBeRefunded
	}
	refundedSoFar := 0.0
	if originalTx.AmountRefunded.Valid {
		refundedSoFar = originalTx.AmountRefunded.Float64
	}
	if refundedSoFar >= originalTx.Amount {
		return nil, ErrAlreadyFullyRefunded
	}
	if refundedSoFar+amount > originalTx.Amount {
		return nil, ErrRefundExceedsAmount
	}

	// Check for duplicate refund (same amount for same parent)
	existingRefunds, err := s.txRepo.GetRefundsByParentID(ctx, transactionID)
	if err == nil {
		for _, r := range existingRefunds {
			if r.Amount == amount {
				return nil, ErrDuplicateRefund
			}
		}
	}

	tx := s.newRefundFromOriginal(originalTx, amount, transactionID)

	if err := s.txRepo.CreateFull(ctx, tx); err != nil {
		return nil, fmt.Errorf("failed to create refund: %w", err)
	}

	if err := s.txRepo.UpdateRefundAmount(ctx, transactionID, amount); err != nil {
		return nil, fmt.Errorf("failed to update original transaction refund amount: %w", err)
	}

	if originalTx.MerchantID.Valid {
		// #nosec G118 -- async webhook, intentionally uses background context
		go s.webhookService.SendWebhook(context.Background(), int(originalTx.MerchantID.Int64), "refund.completed", tx)
	}

	return tx, nil
}

// newCaptureFromHold creates a capture transaction from an existing hold.
func (s *TransactionService) newCaptureFromHold(hold *db.Transaction, amount float64) *db.Transaction {
	return &db.Transaction{
		Amount:              amount,
		Currency:            hold.Currency,
		Status:              string(models.StatusCaptured),
		TransactionType:     sql.NullString{String: string(models.TypeCapture), Valid: true},
		PaymentMethod:       hold.PaymentMethod,
		MerchantID:          hold.MerchantID,
		ParentTransactionID: sql.NullInt64{Int64: hold.ID, Valid: true},
		CardNumberLast4:     hold.CardNumberLast4,
		CardType:            hold.CardType,
		AuthorizationCode:   hold.AuthorizationCode,
		AmountCaptured:      sql.NullFloat64{Float64: amount, Valid: true},
	}
}

// newRefundFromOriginal creates a refund transaction from an original transaction.
func (s *TransactionService) newRefundFromOriginal(originalTx *db.Transaction, amount float64, transactionID int) *db.Transaction {
	return &db.Transaction{
		Amount:              amount,
		Currency:            originalTx.Currency,
		Status:              string(models.StatusRefunded),
		TransactionType:     sql.NullString{String: string(models.TypeRefund), Valid: true},
		PaymentMethod:       originalTx.PaymentMethod,
		MerchantID:          originalTx.MerchantID,
		ParentTransactionID: sql.NullInt64{Int64: int64(transactionID), Valid: true},
		CardNumberLast4:     originalTx.CardNumberLast4,
		CardType:            originalTx.CardType,
		AuthorizationCode:   sql.NullString{String: authCode(), Valid: true},
		AmountRefunded:      sql.NullFloat64{Float64: amount, Valid: true},
	}
}
