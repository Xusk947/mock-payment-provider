-- +goose Up
-- SQL in this section is executed when the migration is applied.

-- Merchants table for API key authentication
CREATE TABLE IF NOT EXISTS merchants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT 1,
    webhook_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_merchants_api_key ON merchants(api_key);
CREATE INDEX IF NOT EXISTS idx_merchants_active ON merchants(active);

-- Test cards table for simulation
CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_number VARCHAR(20) UNIQUE NOT NULL,
    cardholder_name VARCHAR(255) NOT NULL,
    expiry_month INTEGER NOT NULL,
    expiry_year INTEGER NOT NULL,
    cvv VARCHAR(4) NOT NULL,
    card_type VARCHAR(50) NOT NULL, -- visa, mastercard, amex
    response_scenario VARCHAR(100) DEFAULT 'success', -- success, decline, insufficient_funds, etc.
    require_3ds BOOLEAN DEFAULT 0,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cards_card_number ON cards(card_number);
CREATE INDEX IF NOT EXISTS idx_cards_scenario ON cards(response_scenario);

-- Webhooks table for webhook configuration and logs
CREATE TABLE IF NOT EXISTS webhooks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    event_types TEXT NOT NULL, -- JSON array of event types
    secret VARCHAR(255),
    active BOOLEAN DEFAULT 1,
    retry_attempts INTEGER DEFAULT 3,
    timeout_seconds INTEGER DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_webhooks_merchant_id ON webhooks(merchant_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(active);

-- Webhook logs table for tracking webhook delivery attempts
CREATE TABLE IF NOT EXISTS webhook_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    webhook_id INTEGER NOT NULL,
    transaction_id INTEGER,
    event_type VARCHAR(100) NOT NULL,
    payload TEXT NOT NULL,
    response_code INTEGER,
    response_body TEXT,
    status VARCHAR(50) NOT NULL, -- pending, success, failed
    attempt_number INTEGER DEFAULT 1,
    delivered_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_transaction_id ON webhook_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);

-- Error scenarios table for configuration of failure simulation
CREATE TABLE IF NOT EXISTS error_scenarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    error_type VARCHAR(100) NOT NULL, -- card_declined, insufficient_funds, processing_error, etc.
    error_code VARCHAR(50) NOT NULL,
    error_message TEXT NOT NULL,
    probability DECIMAL(5, 2) DEFAULT 100.00, -- 0.00 to 100.00
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_error_scenarios_active ON error_scenarios(active);

-- Since SQLite has limited ALTER TABLE support, we need to recreate the transactions table
-- First, copy existing data if any
CREATE TABLE IF NOT EXISTS transactions_backup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO transactions_backup SELECT id, amount, currency, status, payment_method, metadata, created_at, updated_at FROM transactions;

-- Drop old table
DROP TABLE transactions;

-- Create enhanced transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL,
    metadata TEXT,
    merchant_id INTEGER,
    card_id INTEGER,
    transaction_type VARCHAR(50) DEFAULT 'charge', -- charge, hold, capture, refund
    parent_transaction_id INTEGER, -- For capture/refund relationships
    card_number_last4 VARCHAR(4),
    card_type VARCHAR(50),
    authorization_code VARCHAR(255),
    error_code VARCHAR(50),
    error_message TEXT,
    three_ds_required BOOLEAN DEFAULT 0,
    three_ds_authenticated BOOLEAN DEFAULT 0,
    three_ds_transaction_id VARCHAR(255),
    amount_refunded DECIMAL(10, 2) DEFAULT 0.00,
    amount_captured DECIMAL(10, 2) DEFAULT 0.00,
    expires_at DATETIME, -- For holds
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE SET NULL,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);

-- Restore data from backup
INSERT INTO transactions (id, amount, currency, status, payment_method, metadata, created_at, updated_at)
SELECT id, amount, currency, status, payment_method, metadata, created_at, updated_at FROM transactions_backup;

-- Drop backup table
DROP TABLE transactions_backup;

-- Add indexes for new transaction columns
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_card_id ON transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_parent_transaction_id ON transactions(parent_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_authorization_code ON transactions(authorization_code);

-- Insert default error scenarios
INSERT INTO error_scenarios (name, error_type, error_code, error_message, probability, active) VALUES
('card_declined', 'card_declined', 'DECLINED', 'Card was declined', 100.00, 1),
('insufficient_funds', 'insufficient_funds', 'INSUFFICIENT_FUNDS', 'Insufficient funds in account', 100.00, 1),
('processing_error', 'processing_error', 'PROCESSING_ERROR', 'Error processing transaction', 100.00, 1),
('invalid_card', 'invalid_card', 'INVALID_CARD', 'Invalid card number', 100.00, 1),
('expired_card', 'expired_card', 'EXPIRED_CARD', 'Card has expired', 100.00, 1),
('cvv_mismatch', 'cvv_mismatch', 'CVV_MISMATCH', 'CVV does not match', 100.00, 1);

-- Insert test merchant
INSERT INTO merchants (name, api_key, email, active, webhook_url) VALUES
('Test Merchant', 'test_api_key_12345', 'test@example.com', 1, 'http://localhost:8080/webhook');

-- Insert test cards
INSERT INTO cards (card_number, cardholder_name, expiry_month, expiry_year, cvv, card_type, response_scenario, require_3ds, description) VALUES
('4111111111111111', 'John Doe', 12, 2025, '123', 'visa', 'success', 0, 'Test Visa card - always succeeds'),
('4000000000000002', 'Jane Smith', 12, 2025, '123', 'visa', 'card_declined', 0, 'Test Visa card - always declined'),
('5555555555554444', 'Bob Johnson', 6, 2026, '456', 'mastercard', 'success', 1, 'Test Mastercard with 3DS'),
('378282246310005', 'Alice Williams', 8, 2024, '1234', 'amex', 'insufficient_funds', 0, 'Test Amex - insufficient funds');

-- +goose Down
-- SQL in this section is executed when the migration is rolled back.

DROP INDEX IF EXISTS idx_transactions_parent_transaction_id;
DROP INDEX IF EXISTS idx_transactions_authorization_code;
DROP INDEX IF EXISTS idx_transactions_transaction_type;
DROP INDEX IF EXISTS idx_transactions_card_id;
DROP INDEX IF EXISTS idx_transactions_merchant_id;
DROP INDEX IF EXISTS idx_transactions_status;
DROP INDEX IF NOT EXISTS idx_transactions_created_at;

-- Since we recreated the table, we need to recreate the original simple version
CREATE TABLE IF NOT EXISTS transactions_backup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy existing data to backup
INSERT INTO transactions_backup (id, amount, currency, status, payment_method, metadata, created_at, updated_at)
SELECT id, amount, currency, status, payment_method, metadata, created_at, updated_at FROM transactions;

-- Drop enhanced table
DROP TABLE transactions;

-- Recreate original simple table
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Restore data
INSERT INTO transactions (id, amount, currency, status, payment_method, metadata, created_at, updated_at)
SELECT id, amount, currency, status, payment_method, metadata, created_at, updated_at FROM transactions_backup;

DROP TABLE transactions_backup;

CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

DELETE FROM cards WHERE card_number IN ('4111111111111111', '4000000000000002', '5555555555554444', '378282246310005');
DELETE FROM merchants WHERE api_key = 'test_api_key_12345';
DELETE FROM error_scenarios WHERE name IN ('card_declined', 'insufficient_funds', 'processing_error', 'invalid_card', 'expired_card', 'cvv_mismatch');

DROP INDEX IF EXISTS idx_error_scenarios_active;
DROP TABLE IF EXISTS error_scenarios;

DROP INDEX IF EXISTS idx_webhook_logs_transaction_id;
DROP INDEX IF EXISTS idx_webhook_logs_webhook_id;
DROP INDEX IF EXISTS idx_webhook_logs_status;
DROP TABLE IF EXISTS webhook_logs;

DROP INDEX IF EXISTS idx_webhooks_active;
DROP INDEX IF EXISTS idx_webhooks_merchant_id;
DROP TABLE IF EXISTS webhooks;

DROP INDEX IF EXISTS idx_cards_scenario;
DROP INDEX IF EXISTS idx_cards_card_number;
DROP TABLE IF EXISTS cards;

DROP INDEX IF EXISTS idx_merchants_active;
DROP INDEX IF EXISTS idx_merchants_api_key;
DROP TABLE IF EXISTS merchants;