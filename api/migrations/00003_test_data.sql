-- +goose Up
-- Add test data for E2E testing

-- Insert test merchant (replace if exists)
INSERT OR REPLACE INTO merchants (id, name, email, api_key, webhook_url, active)
VALUES
(1, 'Test Merchant', 'test@example.com', 'test_api_key_12345', 'http://localhost:8080/webhook', true);

-- Insert test cards for different scenarios (replace if exists)
INSERT OR REPLACE INTO cards (id, card_number, cardholder_name, cvv, expiry_month, expiry_year, card_type, response_scenario, require_3ds)
VALUES
(1, '4111111111111111', 'John Doe', '123', 12, 2030, 'visa', 'success', false),
(2, '4000000000000002', 'Jane Smith', '123', 12, 2030, 'visa', 'decline', false),
(3, '5555555555554444', 'Bob Johnson', '456', 6, 2031, 'mastercard', '3ds_required', true),
(4, '378282246310005', 'Alice Williams', '1234', 8, 2032, 'amex', 'insufficient_funds', false),
(5, '6011111111111117', 'Charlie Brown', '789', 9, 2033, 'discover', 'success', false),
(6, '3566002020360505', 'Diana Prince', '1234', 3, 2034, 'jcb', 'success', false);

-- Insert error scenarios (replace if exists)
INSERT OR REPLACE INTO error_scenarios (id, name, error_type, error_code, error_message, probability, active)
VALUES
(1, 'decline', 'card_declined', 'DECLINED', 'Your card was declined', 100, true),
(2, 'insufficient_funds', 'insufficient_funds', 'INSUFFICIENT_FUNDS', 'Insufficient funds on your card', 100, true),
(3, '3ds_required', '3ds_required', '3DS_REQUIRED', '3D Secure authentication is required', 100, true),
(4, 'invalid_cvv', 'invalid_cvv', 'INVALID_CVV', 'Your CVV is invalid', 50, true),
(5, 'invalid_expiry', 'invalid_expiry', 'INVALID_EXPIRY', 'Your card has expired', 50, true),
(6, 'processing_error', 'processing_error', 'PROCESSING_ERROR', 'An error occurred while processing your payment', 25, true);

-- Insert test webhooks (replace if exists)
INSERT OR REPLACE INTO webhooks (id, merchant_id, url, event_types, secret, active, retry_attempts)
VALUES
(1, 1, 'http://localhost:8080/webhook', '["charge.completed","charge.failed","hold.created","capture.completed","refund.completed"]', 'test_secret_key', true, 3);

-- +goose Down
-- Remove test data
DELETE FROM webhooks WHERE merchant_id = 1;
DELETE FROM cards WHERE card_number IN ('4111111111111111', '4000000000000002', '5555555555554444', '378282246310005', '6011111111111117', '3566002020360505');
DELETE FROM error_scenarios WHERE name IN ('decline', 'insufficient_funds', '3ds_required', 'invalid_cvv', 'invalid_expiry', 'processing_error');
DELETE FROM merchants WHERE api_key = 'test_api_key_12345';