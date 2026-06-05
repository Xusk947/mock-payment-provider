package services

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/xusk947/mock-payment-provider/internal/repository"
	db "github.com/xusk947/mock-payment-provider/sqlc"
)

// WebhookService handles webhook delivery logic
type WebhookService struct {
	webhookRepo    *repository.WebhookRepository
	webhookLogRepo *repository.WebhookLogRepository
	client         *http.Client
}

// NewWebhookService creates a new webhook service
func NewWebhookService(webhookRepo *repository.WebhookRepository, webhookLogRepo *repository.WebhookLogRepository) *WebhookService {
	return &WebhookService{
		webhookRepo:    webhookRepo,
		webhookLogRepo: webhookLogRepo,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// SendWebhook sends a webhook notification
func (s *WebhookService) SendWebhook(ctx context.Context, merchantID int, eventType string, payload interface{}) error {
	webhooks, err := s.webhookRepo.GetByMerchant(ctx, int64(merchantID))
	if err != nil {
		return fmt.Errorf("failed to get webhooks: %w", err)
	}

	if len(webhooks) == 0 {
		return nil // No webhooks configured for this merchant
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal webhook payload: %w", err)
	}

	for _, webhook := range webhooks {
		if !s.shouldSendEvent(webhook.EventTypes, eventType) {
			continue
		}

		err := s.sendWebhookWithRetry(ctx, webhook, eventType, string(payloadBytes))
		if err != nil {
			return fmt.Errorf("failed to send webhook: %w", err)
		}
	}

	return nil
}

// shouldSendEvent checks if the webhook should be sent for this event type
func (s *WebhookService) shouldSendEvent(eventTypes string, eventType string) bool {
	var types []string
	if err := json.Unmarshal([]byte(eventTypes), &types); err != nil {
		return false
	}

	for _, t := range types {
		if t == eventType || t == "*" {
			return true
		}
	}

	return false
}

// sendWebhookWithRetry sends a webhook with retry logic
func (s *WebhookService) sendWebhookWithRetry(ctx context.Context, webhook db.Webhook, eventType string, payload string) error {
	retryAttempts := int(webhook.RetryAttempts.Int64)
	if retryAttempts == 0 {
		retryAttempts = 3 // default
	}

	// Create webhook log entry
	log := &db.WebhookLog{
		WebhookID:     webhook.ID,
		EventType:     eventType,
		Payload:       payload,
		Status:        "pending",
		AttemptNumber: sql.NullInt64{Int64: 1, Valid: true},
	}

	err := s.webhookLogRepo.Create(ctx, log)
	if err != nil {
		return fmt.Errorf("failed to create webhook log: %w", err)
	}

	// Send webhook with retries
	for attempt := 1; attempt <= retryAttempts; attempt++ {
		err := s.sendWebhookRequest(ctx, webhook, payload)

		now := time.Now()
		status := "success"
		var responseCode *int
		var responseBody *string

		if err != nil {
			status = "failed"
			code := 500
			responseCode = &code
			message := err.Error()
			responseBody = &message
		} else {
			code := 200
			responseCode = &code
		}

		// Update webhook log
		err = s.webhookLogRepo.UpdateStatus(ctx, int(log.ID), status, responseCode, responseBody, &now)
		if err != nil {
			return fmt.Errorf("failed to update webhook log: %w", err)
		}

		if status == "success" {
			return nil
		}

		// Wait before retry
		if attempt < retryAttempts {
			time.Sleep(5 * time.Second)
		}
	}

	return fmt.Errorf("failed to send webhook after %d attempts", retryAttempts)
}

// sendWebhookRequest sends a single webhook request
func (s *WebhookService) sendWebhookRequest(ctx context.Context, webhook db.Webhook, payload string) error {
	req, err := http.NewRequestWithContext(ctx, "POST", webhook.Url, bytes.NewBufferString(payload))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Webhook-Event", "transaction")

	// Add signature if secret is configured
	if webhook.Secret.Valid {
		signature := s.generateSignature(payload, webhook.Secret.String)
		req.Header.Set("X-Webhook-Signature", signature)
	}

	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("webhook returned status %d: %s", resp.StatusCode, string(body))
	}

	return nil
}

// generateSignature generates HMAC signature for webhook
func (s *WebhookService) generateSignature(payload string, secret string) string {
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(payload))
	return "sha256=" + hex.EncodeToString(h.Sum(nil))
}

// GetWebhookLogs retrieves webhook logs for a transaction
func (s *WebhookService) GetWebhookLogs(ctx context.Context, transactionID int) ([]db.WebhookLog, error) {
	return s.webhookLogRepo.GetByTransaction(ctx, sql.NullInt64{Int64: int64(transactionID), Valid: true})
}
