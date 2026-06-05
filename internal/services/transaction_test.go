package services

import (
	"context"
	"database/sql"
	"testing"

	_ "github.com/mattn/go-sqlite3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/xusk947/mock-payment-provider/internal/models"
	"github.com/xusk947/mock-payment-provider/internal/repository"
	"github.com/xusk947/mock-payment-provider/pkg/database"
	db "github.com/xusk947/mock-payment-provider/sqlc"
)

func setupTestDB(t *testing.T) *database.DB {
	conn, err := sql.Open("sqlite3", ":memory:")
	require.NoError(t, err)

	// Force single connection to avoid SQLite in-memory database per connection issue
	conn.SetMaxOpenConns(1)
	conn.SetMaxIdleConns(1)

	schema := `
	CREATE TABLE merchants (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		api_key TEXT UNIQUE NOT NULL,
		email TEXT NOT NULL,
		active INTEGER DEFAULT 1,
		webhook_url TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	CREATE TABLE cards (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		card_number TEXT UNIQUE NOT NULL,
		cardholder_name TEXT NOT NULL,
		expiry_month INTEGER NOT NULL,
		expiry_year INTEGER NOT NULL,
		cvv TEXT NOT NULL,
		card_type TEXT NOT NULL,
		response_scenario TEXT DEFAULT 'success',
		require_3ds INTEGER DEFAULT 0,
		description TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	CREATE TABLE transactions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		amount DECIMAL(10, 2) NOT NULL,
		currency VARCHAR(3) NOT NULL DEFAULT 'USD',
		status VARCHAR(50) NOT NULL DEFAULT 'pending',
		payment_method VARCHAR(50) NOT NULL,
		metadata TEXT,
		merchant_id INTEGER,
		card_id INTEGER,
		transaction_type VARCHAR(50) DEFAULT 'charge',
		parent_transaction_id INTEGER,
		card_number_last4 VARCHAR(4),
		card_type VARCHAR(50),
		authorization_code VARCHAR(255),
		error_code VARCHAR(50),
		error_message TEXT,
		three_ds_required INTEGER DEFAULT 0,
		three_ds_authenticated INTEGER DEFAULT 0,
		three_ds_transaction_id VARCHAR(255),
		amount_refunded DECIMAL(10, 2) DEFAULT 0.00,
		amount_captured DECIMAL(10, 2) DEFAULT 0.00,
		expires_at DATETIME,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		public_id TEXT UNIQUE
	);
	CREATE TABLE webhooks (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		merchant_id INTEGER NOT NULL,
		url TEXT NOT NULL,
		event_types TEXT NOT NULL,
		secret TEXT,
		active INTEGER DEFAULT 1,
		retry_attempts INTEGER DEFAULT 3,
		timeout_seconds INTEGER DEFAULT 30,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	CREATE TABLE webhook_logs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		webhook_id INTEGER NOT NULL,
		transaction_id INTEGER,
		event_type TEXT NOT NULL,
		payload TEXT NOT NULL,
		response_code INTEGER,
		response_body TEXT,
		status TEXT NOT NULL,
		attempt_number INTEGER DEFAULT 1,
		delivered_at DATETIME,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	CREATE TABLE error_scenarios (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL UNIQUE,
		error_type TEXT NOT NULL,
		error_code TEXT NOT NULL,
		error_message TEXT NOT NULL,
		probability DECIMAL(5, 2) DEFAULT 100.00,
		active INTEGER DEFAULT 1,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	`
	_, err = conn.Exec(schema)
	require.NoError(t, err)

	queries := db.New(conn)
	return &database.DB{DB: conn, Queries: queries}
}

func newTestTransactionService(t *testing.T) (*TransactionService, *database.DB) {
	dbConn := setupTestDB(t)
	ctx := context.Background()

	// Insert test merchant
	_, err := dbConn.ExecContext(ctx, "INSERT INTO merchants (name, api_key, email, active) VALUES ('Test Merchant', 'test_key', 'test@test.com', 1)")
	require.NoError(t, err)

	// Insert test cards
	_, err = dbConn.ExecContext(ctx,
		"INSERT INTO cards (card_number, cardholder_name, expiry_month, expiry_year, cvv, card_type, response_scenario, require_3ds) VALUES "+
			"('4111111111111111', 'John Doe', 12, 2027, '123', 'visa', 'success', 0), "+
			"('4000000000000002', 'Jane Smith', 12, 2027, '123', 'visa', 'card_declined', 0)")
	require.NoError(t, err)

	// Insert error scenarios
	_, err = dbConn.ExecContext(ctx,
		"INSERT INTO error_scenarios (name, error_type, error_code, error_message, probability, active) VALUES "+
			"('card_declined', 'card_declined', 'DECLINED', 'Card declined', 100, 1), "+
			"('insufficient_funds', 'insufficient_funds', 'INSUFFICIENT_FUNDS', 'No funds', 100, 1)")
	require.NoError(t, err)

	// Insert webhook
	_, err = dbConn.ExecContext(ctx,
		"INSERT INTO webhooks (merchant_id, url, event_types, active) VALUES (1, 'http://localhost/webhook', '[\"*\"]', 1)")
	require.NoError(t, err)

	txRepo := repository.NewTransactionRepository(dbConn, dbConn.Queries)
	merchantRepo := repository.NewMerchantRepository(dbConn, dbConn.Queries)
	cardRepo := repository.NewCardRepository(dbConn, dbConn.Queries)
	webhookRepo := repository.NewWebhookRepository(dbConn, dbConn.Queries)
	webhookLogRepo := repository.NewWebhookLogRepository(dbConn, dbConn.Queries)
	cardService := NewCardValidationService(cardRepo)
	threeDSService := NewThreeDSService(false)
	errorRepo := repository.NewErrorScenarioRepository(dbConn, dbConn.Queries)
	errorService := NewErrorScenarioService(errorRepo)
	webhookService := NewWebhookService(webhookRepo, webhookLogRepo)

	svc := NewTransactionService(txRepo, merchantRepo, cardRepo, cardService, threeDSService, errorService, webhookService)
	return svc, dbConn
}

func TestDoubleRefundIsBlocked(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	// Create a completed transaction
	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id, amount_captured) VALUES (100, 'USD', 'completed', 'card', 'charge', 1, 100)")
	require.NoError(t, err)

	// First refund should succeed
	refund1, err := svc.RefundByID(ctx, 1, 100)
	require.NoError(t, err)
	assert.Equal(t, "refunded", refund1.Status)
	assert.Equal(t, 100.0, refund1.Amount)

	// Second refund should fail
	_, err = svc.RefundByID(ctx, 1, 100)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "already fully refunded")

	// Partial refund should also fail since fully refunded
	_, err = svc.RefundByID(ctx, 1, 1)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "already fully refunded")
}

func TestPartialRefundThenFullRefund(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	// Create a completed transaction of 100
	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id, amount_captured) VALUES (100, 'USD', 'completed', 'card', 'charge', 1, 100)")
	require.NoError(t, err)

	// Partial refund of 30
	refund1, err := svc.RefundByID(ctx, 1, 30)
	require.NoError(t, err)
	assert.Equal(t, 30.0, refund1.Amount)

	// Another partial refund of 50 (total 80)
	refund2, err := svc.RefundByID(ctx, 1, 50)
	require.NoError(t, err)
	assert.Equal(t, 50.0, refund2.Amount)

	// Final refund of 20 (total 100)
	refund3, err := svc.RefundByID(ctx, 1, 20)
	require.NoError(t, err)
	assert.Equal(t, 20.0, refund3.Amount)

	// Any more should fail
	_, err = svc.RefundByID(ctx, 1, 1)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "already fully refunded")
}

func TestRefundExceedingOriginalAmount(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	// Create a completed transaction of 50
	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id, amount_captured) VALUES (50, 'USD', 'completed', 'card', 'charge', 1, 50)")
	require.NoError(t, err)

	// Try to refund 60 — should fail
	_, err = svc.RefundByID(ctx, 1, 60)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "exceeds remaining refundable amount")
}

func TestRefundPendingTransactionFails(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	// Create a pending transaction
	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id) VALUES (50, 'USD', 'pending', 'card', 'charge', 1)")
	require.NoError(t, err)

	_, err = svc.RefundByID(ctx, 1, 50)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "cannot be refunded")
}

func TestRefundRefundTransactionFails(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	// Create a refund transaction
	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id) VALUES (50, 'USD', 'refunded', 'card', 'refund', 1)")
	require.NoError(t, err)

	_, err = svc.RefundByID(ctx, 1, 50)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "cannot refund a refund")
}

func TestCreateInvoice(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	invoice, err := svc.CreateInvoice(ctx, "test_key", 150, "USD", "Test order")
	require.NoError(t, err)
	assert.Equal(t, 150.0, invoice.Amount)
	assert.Equal(t, "USD", invoice.Currency)
	assert.Equal(t, "pending", invoice.Status)
	assert.Equal(t, "charge", invoice.TransactionType.String)
}

func TestPayInvoiceWithScenario(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	// Create invoice
	invoice, err := svc.CreateInvoice(ctx, "test_key", 200, "EUR", "")
	require.NoError(t, err)

	// Pay with success scenario
	completed, err := svc.PayInvoice(ctx, int(invoice.ID), &models.ChargeRequest{
		CardNumber:     "4111111111111111",
		CardholderName: "John Doe",
		CVV:            "123",
		ExpiryMonth:    12,
		ExpiryYear:     2027,
		CardType:       "visa",
		Scenario:       "success",
	})
	require.NoError(t, err)
	assert.Equal(t, "completed", completed.Status)
	assert.False(t, completed.ErrorCode.Valid)

	// Create another invoice
	invoice2, err := svc.CreateInvoice(ctx, "test_key", 200, "EUR", "")
	require.NoError(t, err)

	// Pay with decline scenario
	failed, err := svc.PayInvoice(ctx, int(invoice2.ID), &models.ChargeRequest{
		CardNumber:     "4111111111111111",
		CardholderName: "John Doe",
		CVV:            "123",
		ExpiryMonth:    12,
		ExpiryYear:     2027,
		CardType:       "visa",
		Scenario:       "card_declined",
	})
	require.NoError(t, err)
	assert.Equal(t, "failed", failed.Status)
	assert.Equal(t, "DECLINED", failed.ErrorCode.String)
}

func TestChargeWithInvalidCard(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	_, err := svc.Charge(ctx, &models.ChargeRequest{
		APIKey:         "test_key",
		Amount:         100,
		Currency:       "USD",
		CardNumber:     "1234",
		CardholderName: "Test",
		CVV:            "123",
		ExpiryMonth:    12,
		ExpiryYear:     2027,
		CardType:       "visa",
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "card validation failed")
}

func TestRefundBlocksPendingTransaction(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	// Create a pending transaction
	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id, amount_captured) VALUES (50, 'USD', 'pending', 'card', 'charge', 1, 50)")
	require.NoError(t, err)

	_, err = svc.Refund(ctx, 1, 50, "test_key")
	require.Error(t, err)
	assert.Contains(t, err.Error(), "cannot be refunded")
}

func TestRefundBlocksDuplicateAmount(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	// Create a completed transaction
	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id, amount_captured) VALUES (100, 'USD', 'completed', 'card', 'charge', 1, 100)")
	require.NoError(t, err)

	// First refund succeeds
	_, err = svc.Refund(ctx, 1, 30, "test_key")
	require.NoError(t, err)

	// Second refund with same amount fails as duplicate
	_, err = svc.Refund(ctx, 1, 30, "test_key")
	require.Error(t, err)
	assert.Contains(t, err.Error(), "duplicate refund")
}

func TestRefundBlocksZeroAndNegativeAmount(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id, amount_captured) VALUES (100, 'USD', 'completed', 'card', 'charge', 1, 100)")
	require.NoError(t, err)

	_, err = svc.Refund(ctx, 1, 0, "test_key")
	require.Error(t, err)
	assert.Contains(t, err.Error(), "must be greater than zero")

	_, err = svc.Refund(ctx, 1, -10, "test_key")
	require.Error(t, err)
	assert.Contains(t, err.Error(), "must be greater than zero")
}

func TestRefundByIDBlocksDuplicateAmount(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id, amount_captured) VALUES (100, 'USD', 'completed', 'card', 'charge', 1, 100)")
	require.NoError(t, err)

	_, err = svc.RefundByID(ctx, 1, 25)
	require.NoError(t, err)

	_, err = svc.RefundByID(ctx, 1, 25)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "duplicate refund")
}

func TestRefundByIDBlocksZeroAndNegativeAmount(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id, amount_captured) VALUES (100, 'USD', 'completed', 'card', 'charge', 1, 100)")
	require.NoError(t, err)

	_, err = svc.RefundByID(ctx, 1, 0)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "must be greater than zero")

	_, err = svc.RefundByID(ctx, 1, -5)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "must be greater than zero")
}

func TestHoldSuccess(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	tx, err := svc.Hold(ctx, &models.ChargeRequest{
		APIKey:         "test_key",
		Amount:         200,
		Currency:       "USD",
		CardNumber:     "4111111111111111",
		CardholderName: "John Doe",
		CVV:            "123",
		ExpiryMonth:    12,
		ExpiryYear:     2027,
		CardType:       "visa",
	})
	require.NoError(t, err)
	assert.Equal(t, "authorized", tx.Status)
	assert.Equal(t, "hold", tx.TransactionType.String)
	assert.Equal(t, 200.0, tx.Amount)
	assert.True(t, tx.ExpiresAt.Valid)
}

func TestHoldWithInvalidCardFails(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	_, err := svc.Hold(ctx, &models.ChargeRequest{
		APIKey:         "test_key",
		Amount:         200,
		Currency:       "USD",
		CardNumber:     "1234",
		CardholderName: "John Doe",
		CVV:            "123",
		ExpiryMonth:    12,
		ExpiryYear:     2027,
		CardType:       "visa",
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "card validation failed")
}

func TestCaptureSuccess(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	// Create a hold
	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id, authorization_code, amount_captured) VALUES (100, 'USD', 'authorized', 'card', 'hold', 1, 'AUTH001', 0)")
	require.NoError(t, err)

	capture, err := svc.Capture(ctx, 1, 100, "test_key")
	require.NoError(t, err)
	assert.Equal(t, "captured", capture.Status)
	assert.Equal(t, "capture", capture.TransactionType.String)
	assert.Equal(t, 100.0, capture.Amount)
	assert.Equal(t, int64(1), capture.ParentTransactionID.Int64)
}

func TestCaptureNonHoldFails(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id) VALUES (100, 'USD', 'completed', 'card', 'charge', 1)")
	require.NoError(t, err)

	_, err = svc.Capture(ctx, 1, 100, "test_key")
	require.Error(t, err)
	assert.Contains(t, err.Error(), "not a hold")
}

func TestCaptureAlreadyCapturedFails(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id) VALUES (100, 'USD', 'captured', 'card', 'hold', 1)")
	require.NoError(t, err)

	_, err = svc.Capture(ctx, 1, 100, "test_key")
	require.Error(t, err)
	assert.Contains(t, err.Error(), "hold cannot be captured")
}

func TestCaptureWithInvalidAPIKeyFails(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id, authorization_code, amount_captured) VALUES (100, 'USD', 'authorized', 'card', 'hold', 1, 'AUTH001', 0)")
	require.NoError(t, err)

	_, err = svc.Capture(ctx, 1, 100, "bad_key")
	require.Error(t, err)
	assert.Contains(t, err.Error(), "invalid API key")
}

func TestCaptureByIDSuccess(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id, authorization_code, amount_captured) VALUES (100, 'USD', 'authorized', 'card', 'hold', 1, 'AUTH001', 0)")
	require.NoError(t, err)

	capture, err := svc.CaptureByID(ctx, 1, 100)
	require.NoError(t, err)
	assert.Equal(t, "captured", capture.Status)
	assert.Equal(t, "capture", capture.TransactionType.String)
}

func TestConfirmPendingTransaction(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id) VALUES (100, 'USD', 'pending', 'card', 'charge', 1)")
	require.NoError(t, err)

	confirmed, err := svc.Confirm(ctx, 1)
	require.NoError(t, err)
	assert.Equal(t, "completed", confirmed.Status)
}

func TestConfirmNonPendingFails(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id) VALUES (100, 'USD', 'completed', 'card', 'charge', 1)")
	require.NoError(t, err)

	_, err = svc.Confirm(ctx, 1)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "not pending")
}

func TestRejectPendingTransaction(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id) VALUES (100, 'USD', 'pending', 'card', 'charge', 1)")
	require.NoError(t, err)

	rejected, err := svc.Reject(ctx, 1)
	require.NoError(t, err)
	assert.Equal(t, "failed", rejected.Status)
}

func TestRejectAuthorizedTransaction(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id) VALUES (100, 'USD', 'authorized', 'card', 'hold', 1)")
	require.NoError(t, err)

	rejected, err := svc.Reject(ctx, 1)
	require.NoError(t, err)
	assert.Equal(t, "failed", rejected.Status)
}

func TestRejectCompletedTransactionFails(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id) VALUES (100, 'USD', 'completed', 'card', 'charge', 1)")
	require.NoError(t, err)

	_, err = svc.Reject(ctx, 1)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "cannot be rejected")
}

func TestChargeWithInvalidAPIKeyFails(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	_, err := svc.Charge(ctx, &models.ChargeRequest{
		APIKey:         "bad_key",
		Amount:         100,
		Currency:       "USD",
		CardNumber:     "4111111111111111",
		CardholderName: "John Doe",
		CVV:            "123",
		ExpiryMonth:    12,
		ExpiryYear:     2027,
		CardType:       "visa",
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "invalid API key")
}

func TestCreateInvoiceWithInvalidAPIKeyFails(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	_, err := svc.CreateInvoice(ctx, "bad_key", 150, "USD", "")
	require.Error(t, err)
	assert.Contains(t, err.Error(), "invalid API key")
}

func TestPayInvoiceWithInvalidIDFails(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	_, err := svc.PayInvoice(ctx, 999, &models.ChargeRequest{
		CardNumber:     "4111111111111111",
		CardholderName: "John Doe",
		CVV:            "123",
		ExpiryMonth:    12,
		ExpiryYear:     2027,
		CardType:       "visa",
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "invoice not found")
}

func TestPayInvoiceWithNonPendingStatusFails(t *testing.T) {
	svc, db := newTestTransactionService(t)
	defer db.Close()
	ctx := context.Background()

	// Insert completed transaction instead of pending invoice
	_, err := db.ExecContext(ctx,
		"INSERT INTO transactions (amount, currency, status, payment_method, transaction_type, merchant_id) VALUES (100, 'USD', 'completed', 'card', 'charge', 1)")
	require.NoError(t, err)

	_, err = svc.PayInvoice(ctx, 1, &models.ChargeRequest{
		CardNumber:     "4111111111111111",
		CardholderName: "John Doe",
		CVV:            "123",
		ExpiryMonth:    12,
		ExpiryYear:     2027,
		CardType:       "visa",
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "invalid invoice state")
}
