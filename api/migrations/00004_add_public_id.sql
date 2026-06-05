-- +goose Up
ALTER TABLE transactions ADD COLUMN public_id TEXT UNIQUE;
CREATE INDEX idx_transactions_public_id ON transactions(public_id);

-- +goose Down
DROP INDEX IF EXISTS idx_transactions_public_id;
ALTER TABLE transactions DROP COLUMN public_id;
