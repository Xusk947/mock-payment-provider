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

// UpdateFull updates all fields of an existing transaction
func (r *TransactionRepository) UpdateFull(ctx context.Context, tx *db.Transaction) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE transactions SET
			amount = ?,
			currency = ?,
			status = ?,
			payment_method = ?,
			metadata = ?,
			merchant_id = ?,
			card_id = ?,
			transaction_type = ?,
			parent_transaction_id = ?,
			card_number_last4 = ?,
			card_type = ?,
			authorization_code = ?,
			error_code = ?,
			error_message = ?,
			three_ds_required = ?,
			three_ds_authenticated = ?,
			three_ds_transaction_id = ?,
			amount_refunded = ?,
			amount_captured = ?,
			expires_at = ?,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = ?;
	`, tx.Amount, tx.Currency, tx.Status, tx.PaymentMethod, tx.Metadata,
		tx.MerchantID, tx.CardID, tx.TransactionType, tx.ParentTransactionID,
		tx.CardNumberLast4, tx.CardType, tx.AuthorizationCode, tx.ErrorCode,
		tx.ErrorMessage, tx.ThreeDsRequired, tx.ThreeDsAuthenticated,
		tx.ThreeDsTransactionID, tx.AmountRefunded, tx.AmountCaptured,
		tx.ExpiresAt, tx.ID,
	)
	return err
}

// UpdateRefundAmount increments the refunded amount of a transaction
func (r *TransactionRepository) UpdateRefundAmount(ctx context.Context, id int, amount float64) error {
	return r.queries.UpdateTransactionRefundAmount(ctx, db.UpdateTransactionRefundAmountParams{
		AmountRefunded: sql.NullFloat64{Float64: amount, Valid: true},
		ID:             int64(id),
	})
}

// GetRefundsByParentID retrieves refund transactions for a given parent transaction
func (r *TransactionRepository) GetRefundsByParentID(ctx context.Context, parentID int) ([]db.Transaction, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, amount, currency, status, payment_method, metadata, merchant_id, card_id,
		       transaction_type, parent_transaction_id, card_number_last4, card_type, authorization_code,
		       error_code, error_message, three_ds_required, three_ds_authenticated, three_ds_transaction_id,
		       amount_refunded, amount_captured, expires_at, created_at, updated_at
		FROM transactions
		WHERE parent_transaction_id = ? AND transaction_type = 'refund'
	`, parentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []db.Transaction
	for rows.Next() {
		var tx db.Transaction
		err := rows.Scan(
			&tx.ID, &tx.Amount, &tx.Currency, &tx.Status, &tx.PaymentMethod, &tx.Metadata, &tx.MerchantID, &tx.CardID,
			&tx.TransactionType, &tx.ParentTransactionID, &tx.CardNumberLast4, &tx.CardType, &tx.AuthorizationCode,
			&tx.ErrorCode, &tx.ErrorMessage, &tx.ThreeDsRequired, &tx.ThreeDsAuthenticated, &tx.ThreeDsTransactionID,
			&tx.AmountRefunded, &tx.AmountCaptured, &tx.ExpiresAt, &tx.CreatedAt, &tx.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, tx)
	}
	return transactions, rows.Err()
}

// ListByMerchant retrieves transactions for a specific merchant
func (r *TransactionRepository) ListByMerchant(ctx context.Context, merchantID, limit, offset int) ([]db.Transaction, error) {
	return r.queries.ListTransactionsByMerchant(ctx, db.ListTransactionsByMerchantParams{
		MerchantID: sql.NullInt64{Int64: int64(merchantID), Valid: true},
		Limit:      int64(limit),
		Offset:     int64(offset),
	})
}
