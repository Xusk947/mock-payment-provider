package repository

import (
	"context"
	"database/sql"
	"time"

	"github.com/xusk947/mock-payment-provider/pkg/database"
	db "github.com/xusk947/mock-payment-provider/sqlc"
)

// WebhookRepository handles database operations for webhooks using sqlc
type WebhookRepository struct {
	db      *database.DB
	queries *db.Queries
}

// NewWebhookRepository creates a new webhook repository
func NewWebhookRepository(database *database.DB, queries *db.Queries) *WebhookRepository {
	return &WebhookRepository{db: database, queries: queries}
}

// Get retrieves a webhook by ID
func (r *WebhookRepository) Get(ctx context.Context, id int) (*db.Webhook, error) {
	webhook, err := r.queries.GetWebhook(ctx, int64(id))
	if err != nil {
		return nil, err
	}
	return &webhook, nil
}

// GetByMerchant retrieves all webhooks for a merchant
func (r *WebhookRepository) GetByMerchant(ctx context.Context, merchantID int64) ([]db.Webhook, error) {
	return r.queries.GetWebhooksByMerchant(ctx, merchantID)
}

// Create creates a new webhook
func (r *WebhookRepository) Create(ctx context.Context, webhook *db.Webhook) error {
	result, err := r.queries.CreateWebhook(ctx, db.CreateWebhookParams{
		MerchantID:     webhook.MerchantID,
		Url:            webhook.Url,
		EventTypes:     webhook.EventTypes,
		Secret:         webhook.Secret,
		Active:         webhook.Active,
		RetryAttempts:  webhook.RetryAttempts,
		TimeoutSeconds: webhook.TimeoutSeconds,
	})
	if err != nil {
		return err
	}
	*webhook = result
	return nil
}

// Update updates a webhook
func (r *WebhookRepository) Update(ctx context.Context, webhook *db.Webhook) error {
	return r.queries.UpdateWebhook(ctx, db.UpdateWebhookParams{
		Url:            webhook.Url,
		EventTypes:     webhook.EventTypes,
		Secret:         webhook.Secret,
		Active:         webhook.Active,
		RetryAttempts:  webhook.RetryAttempts,
		TimeoutSeconds: webhook.TimeoutSeconds,
		ID:             webhook.ID,
	})
}

// Delete deletes a webhook
func (r *WebhookRepository) Delete(ctx context.Context, id int) error {
	return r.queries.DeleteWebhook(ctx, int64(id))
}

// WebhookLogRepository handles database operations for webhook logs using sqlc
type WebhookLogRepository struct {
	db      *database.DB
	queries *db.Queries
}

// NewWebhookLogRepository creates a new webhook log repository
func NewWebhookLogRepository(database *database.DB, queries *db.Queries) *WebhookLogRepository {
	return &WebhookLogRepository{db: database, queries: queries}
}

// Create creates a new webhook log entry
func (r *WebhookLogRepository) Create(ctx context.Context, log *db.WebhookLog) error {
	result, err := r.queries.CreateWebhookLog(ctx, db.CreateWebhookLogParams{
		WebhookID:     log.WebhookID,
		TransactionID: log.TransactionID,
		EventType:     log.EventType,
		Payload:       log.Payload,
		Status:        log.Status,
		AttemptNumber: log.AttemptNumber,
	})
	if err != nil {
		return err
	}
	*log = result
	return nil
}

// UpdateStatus updates the status of a webhook log
func (r *WebhookLogRepository) UpdateStatus(ctx context.Context, id int, status string, responseCode *int, responseBody *string, deliveredAt *time.Time) error {
	var rc sql.NullInt64
	if responseCode != nil {
		rc = sql.NullInt64{Int64: int64(*responseCode), Valid: true}
	}
	var rb sql.NullString
	if responseBody != nil {
		rb = sql.NullString{String: *responseBody, Valid: true}
	}
	var da sql.NullTime
	if deliveredAt != nil {
		da = sql.NullTime{Time: *deliveredAt, Valid: true}
	}

	return r.queries.UpdateWebhookLogStatus(ctx, db.UpdateWebhookLogStatusParams{
		Status:       status,
		ResponseCode: rc,
		ResponseBody: rb,
		DeliveredAt:  da,
		ID:           int64(id),
	})
}

// GetByTransaction retrieves all webhook logs for a transaction
func (r *WebhookLogRepository) GetByTransaction(ctx context.Context, transactionID sql.NullInt64) ([]db.WebhookLog, error) {
	return r.queries.GetWebhookLogsByTransaction(ctx, transactionID)
}
