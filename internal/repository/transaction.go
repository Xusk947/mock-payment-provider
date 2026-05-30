package repository

import (
	"context"
	"database/sql"

	"github.com/xusk947/mock-payment-provider/pkg/database"
	db "github.com/xusk947/mock-payment-provider/sqlc"
)

// TransactionRepository handles database operations for transactions using sqlc
type TransactionRepository struct {
	db      *database.DB
	queries *db.Queries
}

// NewTransactionRepository creates a new transaction repository
func NewTransactionRepository(database *database.DB, queries *db.Queries) *TransactionRepository {
	return &TransactionRepository{db: database, queries: queries}
}

// Get retrieves a transaction by ID
func (r *TransactionRepository) Get(ctx context.Context, id int) (*db.Transaction, error) {
	tx, err := r.queries.GetTransaction(ctx, int64(id))
	if err != nil {
		return nil, err
	}
	return &tx, nil
}

// List retrieves all transactions with pagination
func (r *TransactionRepository) List(ctx context.Context, limit, offset int) ([]db.Transaction, error) {
	return r.queries.ListTransactions(ctx, db.ListTransactionsParams{
		Limit:  int64(limit),
		Offset: int64(offset),
	})
}

// Create creates a new transaction
func (r *TransactionRepository) Create(ctx context.Context, amount float64, currency, paymentMethod, metadata string) (*db.Transaction, error) {
	var metadataNull sql.NullString
	if metadata != "" {
		metadataNull = sql.NullString{String: metadata, Valid: true}
	}

	tx, err := r.queries.CreateTransaction(ctx, db.CreateTransactionParams{
		Amount:        amount,
		Currency:      currency,
		Status:        "pending",
		PaymentMethod: paymentMethod,
		Metadata:      metadataNull,
	})
	if err != nil {
		return nil, err
	}
	return &tx, nil
}

// UpdateStatus updates the status of a transaction
func (r *TransactionRepository) UpdateStatus(ctx context.Context, id int, status string) error {
	return r.queries.UpdateTransactionStatus(ctx, db.UpdateTransactionStatusParams{
		Status: status,
		ID:     int64(id),
	})
}

// CreateFull creates a new transaction with all fields
func (r *TransactionRepository) CreateFull(ctx context.Context, tx *db.Transaction) error {
	result, err := r.queries.CreateTransaction(ctx, db.CreateTransactionParams{
		Amount:               tx.Amount,
		Currency:             tx.Currency,
		Status:               tx.Status,
		PaymentMethod:        tx.PaymentMethod,
		Metadata:             tx.Metadata,
		MerchantID:           tx.MerchantID,
		CardID:               tx.CardID,
		TransactionType:      tx.TransactionType,
		ParentTransactionID:  tx.ParentTransactionID,
		CardNumberLast4:      tx.CardNumberLast4,
		CardType:             tx.CardType,
		AuthorizationCode:    tx.AuthorizationCode,
		ErrorCode:            tx.ErrorCode,
		ErrorMessage:         tx.ErrorMessage,
		ThreeDsRequired:      tx.ThreeDsRequired,
		ThreeDsAuthenticated: tx.ThreeDsAuthenticated,
		ThreeDsTransactionID: tx.ThreeDsTransactionID,
		AmountRefunded:       tx.AmountRefunded,
		AmountCaptured:       tx.AmountCaptured,
		ExpiresAt:            tx.ExpiresAt,
	})
	if err != nil {
		return err
	}
	*tx = result
	return nil
}

// ListByMerchant retrieves transactions for a specific merchant
func (r *TransactionRepository) ListByMerchant(ctx context.Context, merchantID, limit, offset int) ([]db.Transaction, error) {
	return r.queries.ListTransactionsByMerchant(ctx, db.ListTransactionsByMerchantParams{
		MerchantID: sql.NullInt64{Int64: int64(merchantID), Valid: true},
		Limit:      int64(limit),
		Offset:     int64(offset),
	})
}
