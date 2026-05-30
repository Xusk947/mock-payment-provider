-- name: GetTransaction :one
SELECT id, amount, currency, status, payment_method, metadata, merchant_id, card_id,
       transaction_type, parent_transaction_id, card_number_last4, card_type, authorization_code,
       error_code, error_message, three_ds_required, three_ds_authenticated, three_ds_transaction_id,
       amount_refunded, amount_captured, expires_at, created_at, updated_at
FROM transactions WHERE id = ?;

-- name: ListTransactions :many
SELECT id, amount, currency, status, payment_method, metadata, merchant_id, card_id,
       transaction_type, parent_transaction_id, card_number_last4, card_type, authorization_code,
       error_code, error_message, three_ds_required, three_ds_authenticated, three_ds_transaction_id,
       amount_refunded, amount_captured, expires_at, created_at, updated_at
FROM transactions ORDER BY created_at DESC LIMIT ? OFFSET ?;

-- name: ListTransactionsByMerchant :many
SELECT id, amount, currency, status, payment_method, metadata, merchant_id, card_id,
       transaction_type, parent_transaction_id, card_number_last4, card_type, authorization_code,
       error_code, error_message, three_ds_required, three_ds_authenticated, three_ds_transaction_id,
       amount_refunded, amount_captured, expires_at, created_at, updated_at
FROM transactions WHERE merchant_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?;

-- name: CreateTransaction :one
INSERT INTO transactions (amount, currency, status, payment_method, metadata, merchant_id, card_id,
                         transaction_type, parent_transaction_id, card_number_last4, card_type, authorization_code,
                         error_code, error_message, three_ds_required, three_ds_authenticated, three_ds_transaction_id,
                         amount_refunded, amount_captured, expires_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
RETURNING id, amount, currency, status, payment_method, metadata, merchant_id, card_id,
          transaction_type, parent_transaction_id, card_number_last4, card_type, authorization_code,
          error_code, error_message, three_ds_required, three_ds_authenticated, three_ds_transaction_id,
          amount_refunded, amount_captured, expires_at, created_at, updated_at;

-- name: UpdateTransactionStatus :exec
UPDATE transactions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;

-- name: UpdateTransactionCaptureAmount :exec
UPDATE transactions SET amount_captured = ?, status = 'captured', updated_at = CURRENT_TIMESTAMP WHERE id = ?;

-- name: UpdateTransactionRefundAmount :exec
UPDATE transactions SET amount_refunded = amount_refunded + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;

-- name: DeleteTransaction :exec
DELETE FROM transactions WHERE id = ?;

-- name: GetMerchantByAPIKey :one
SELECT id, name, api_key, email, active, webhook_url, created_at, updated_at
FROM merchants WHERE api_key = ? AND active = 1;

-- name: GetMerchant :one
SELECT id, name, api_key, email, active, webhook_url, created_at, updated_at
FROM merchants WHERE id = ?;

-- name: ListMerchants :many
SELECT id, name, api_key, email, active, webhook_url, created_at, updated_at
FROM merchants ORDER BY created_at DESC LIMIT ? OFFSET ?;

-- name: CreateMerchant :one
INSERT INTO merchants (name, api_key, email, active, webhook_url)
VALUES (?, ?, ?, ?, ?)
RETURNING id, name, api_key, email, active, webhook_url, created_at, updated_at;

-- name: UpdateMerchant :exec
UPDATE merchants SET name = ?, email = ?, active = ?, webhook_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;

-- name: DeleteMerchant :exec
UPDATE merchants SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?;

-- name: GetCardByNumber :one
SELECT id, card_number, cardholder_name, expiry_month, expiry_year, cvv, card_type,
       response_scenario, require_3ds, description, created_at
FROM cards WHERE card_number = ?;

-- name: GetCard :one
SELECT id, card_number, cardholder_name, expiry_month, expiry_year, cvv, card_type,
       response_scenario, require_3ds, description, created_at
FROM cards WHERE id = ?;

-- name: ListCards :many
SELECT id, card_number, cardholder_name, expiry_month, expiry_year, cvv, card_type,
       response_scenario, require_3ds, description, created_at
FROM cards ORDER BY created_at DESC;

-- name: CreateCard :one
INSERT INTO cards (card_number, cardholder_name, expiry_month, expiry_year, cvv, card_type, response_scenario, require_3ds, description)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
RETURNING id, card_number, cardholder_name, expiry_month, expiry_year, cvv, card_type,
          response_scenario, require_3ds, description, created_at;

-- name: UpdateCard :exec
UPDATE cards SET cardholder_name = ?, expiry_month = ?, expiry_year = ?, cvv = ?, card_type = ?, response_scenario = ?, require_3ds = ?, description = ? WHERE id = ?;

-- name: DeleteCard :exec
DELETE FROM cards WHERE id = ?;

-- name: GetWebhook :one
SELECT id, merchant_id, url, event_types, secret, active, retry_attempts, timeout_seconds, created_at, updated_at
FROM webhooks WHERE id = ?;

-- name: GetWebhooksByMerchant :many
SELECT id, merchant_id, url, event_types, secret, active, retry_attempts, timeout_seconds, created_at, updated_at
FROM webhooks WHERE merchant_id = ? AND active = 1;

-- name: CreateWebhook :one
INSERT INTO webhooks (merchant_id, url, event_types, secret, active, retry_attempts, timeout_seconds)
VALUES (?, ?, ?, ?, ?, ?, ?)
RETURNING id, merchant_id, url, event_types, secret, active, retry_attempts, timeout_seconds, created_at, updated_at;

-- name: UpdateWebhook :exec
UPDATE webhooks SET url = ?, event_types = ?, secret = ?, active = ?, retry_attempts = ?, timeout_seconds = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;

-- name: DeleteWebhook :exec
DELETE FROM webhooks WHERE id = ?;

-- name: CreateWebhookLog :one
INSERT INTO webhook_logs (webhook_id, transaction_id, event_type, payload, status, attempt_number)
VALUES (?, ?, ?, ?, ?, ?)
RETURNING id, webhook_id, transaction_id, event_type, payload, response_code, response_body, status, attempt_number, delivered_at, created_at;

-- name: UpdateWebhookLogStatus :exec
UPDATE webhook_logs SET status = ?, response_code = ?, response_body = ?, delivered_at = ? WHERE id = ?;

-- name: GetWebhookLogsByTransaction :many
SELECT id, webhook_id, transaction_id, event_type, payload, response_code, response_body, status, attempt_number, delivered_at, created_at
FROM webhook_logs WHERE transaction_id = ? ORDER BY created_at DESC;

-- name: GetErrorScenario :one
SELECT id, name, error_type, error_code, error_message, probability, active, created_at, updated_at
FROM error_scenarios WHERE id = ?;

-- name: GetErrorScenarioByName :one
SELECT id, name, error_type, error_code, error_message, probability, active, created_at, updated_at
FROM error_scenarios WHERE name = ? AND active = 1;

-- name: ListErrorScenarios :many
SELECT id, name, error_type, error_code, error_message, probability, active, created_at, updated_at
FROM error_scenarios ORDER BY created_at DESC;

-- name: ListActiveErrorScenarios :many
SELECT id, name, error_type, error_code, error_message, probability, active, created_at, updated_at
FROM error_scenarios WHERE active = 1 ORDER BY created_at DESC;

-- name: CreateErrorScenario :one
INSERT INTO error_scenarios (name, error_type, error_code, error_message, probability, active)
VALUES (?, ?, ?, ?, ?, ?)
RETURNING id, name, error_type, error_code, error_message, probability, active, created_at, updated_at;

-- name: UpdateErrorScenario :exec
UPDATE error_scenarios SET error_type = ?, error_code = ?, error_message = ?, probability = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;

-- name: DeleteErrorScenario :exec
UPDATE error_scenarios SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?;

-- Test data queries for E2E tests
-- name: GetCardByCardNumber :one
SELECT id, card_number, cardholder_name, expiry_month, expiry_year, cvv, card_type,
       response_scenario, require_3ds, description, created_at
FROM cards WHERE card_number = ?;