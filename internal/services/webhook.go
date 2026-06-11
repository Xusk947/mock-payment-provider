package services

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/xusk947/mock-payment-provider/internal/repository"
	db "github.com/xusk947/mock-payment-provider/sqlc"
)

// defaultRetryBackoff is the schedule of wait durations applied between webhook
// delivery attempts. After an attempt fails the service waits the next interval
// before retrying: 1m, 2m, 5m, 10m, 20m, 30m, 1h, 2h, 4h, 8h, 12h, 1d, 2d, 4d
// and finally 1 week. Once the schedule is exhausted the final interval is
// reused, so retries keep going up to roughly one week apart.
var defaultRetryBackoff = []time.Duration{
	1 * time.Minute,
	2 * time.Minute,
	5 * time.Minute,
	10 * time.Minute,
	20 * time.Minute,
	30 * time.Minute,
	1 * time.Hour,
	2 * time.Hour,
	4 * time.Hour,
	8 * time.Hour,
	12 * time.Hour,
	24 * time.Hour,
	48 * time.Hour,
	96 * time.Hour,
	7 * 24 * time.Hour,
}

// WebhookService handles webhook delivery logic
type WebhookService struct {
	webhookRepo       *repository.WebhookRepository
	webhookLogRepo    *repository.WebhookLogRepository
	defaultWebhookURL string
	client            *http.Client
	// retryBackoff is the wait schedule between delivery attempts. It is a field
	// so tests can shorten the intervals.
	retryBackoff []time.Duration
}

// NewWebhookService creates a new webhook service
func NewWebhookService(webhookRepo *repository.WebhookRepository, webhookLogRepo *repository.WebhookLogRepository, defaultWebhookURL string) *WebhookService {
	return &WebhookService{
		webhookRepo:       webhookRepo,
		webhookLogRepo:    webhookLogRepo,
		defaultWebhookURL: defaultWebhookURL,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
		retryBackoff: defaultRetryBackoff,
	}
}

// backoffForAttempt returns how long to wait after the given (1-based) attempt
// before making the next one. The last interval in the schedule is reused once
// the schedule is exhausted.
func (s *WebhookService) backoffForAttempt(attempt int) time.Duration {
	schedule := s.retryBackoff
	if len(schedule) == 0 {
		return 0
	}
	idx := attempt - 1
	if idx < 0 {
		idx = 0
	}
	if idx >= len(schedule) {
		idx = len(schedule) - 1
	}
	return schedule[idx]
}

// waitBeforeRetry sleeps for the given duration but returns early if the context
// is cancelled.
func (s *WebhookService) waitBeforeRetry(ctx context.Context, d time.Duration) error {
	if d <= 0 {
		return ctx.Err()
	}
	timer := time.NewTimer(d)
	defer timer.Stop()
	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-timer.C:
		return nil
	}
}

// SendWebhook sends a webhook notification.
//
// The default webhook (if configured) always receives every event, regardless
// of whether the merchant has a matching subscription and regardless of whether
// the merchant webhook deliveries succeed. Each delivery runs independently so a
// slow or failing endpoint (which may retry for up to a week) never blocks the
// others.
func (s *WebhookService) SendWebhook(ctx context.Context, merchantID int, eventType string, payload interface{}) error {
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal webhook payload: %w", err)
	}
	payloadStr := string(payloadBytes)

	var (
		wg   sync.WaitGroup
		mu   sync.Mutex
		errs []error
	)
	addErr := func(err error) {
		mu.Lock()
		errs = append(errs, err)
		mu.Unlock()
	}

	// Always deliver every event to the default webhook if configured, even when
	// no merchant webhook handles it.
	if s.defaultWebhookURL != "" {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if err := s.sendDefaultWebhook(ctx, eventType, payloadStr); err != nil {
				addErr(fmt.Errorf("failed to send default webhook: %w", err))
			}
		}()
	}

	webhooks, err := s.webhookRepo.GetByMerchant(ctx, int64(merchantID))
	if err != nil {
		addErr(fmt.Errorf("failed to get webhooks: %w", err))
	} else {
		for _, webhook := range webhooks {
			if !s.shouldSendEvent(webhook.EventTypes, eventType) {
				continue
			}
			wg.Add(1)
			go func(webhook db.Webhook) {
				defer wg.Done()
				if err := s.sendWebhookWithRetry(ctx, webhook, eventType, payloadStr); err != nil {
					addErr(fmt.Errorf("failed to send webhook: %w", err))
				}
			}(webhook)
		}
	}

	wg.Wait()
	return errors.Join(errs...)
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

	// Send webhook with retries, backing off according to the retry schedule.
	for attempt := 1; attempt <= retryAttempts; attempt++ {
		secret := ""
		if webhook.Secret.Valid {
			secret = webhook.Secret.String
		}
		err := s.sendWebhookRequest(ctx, webhook.Url, secret, payload)

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
			if err := s.waitBeforeRetry(ctx, s.backoffForAttempt(attempt)); err != nil {
				return fmt.Errorf("webhook retries interrupted after %d attempts: %w", attempt, err)
			}
		}
	}

	return fmt.Errorf("failed to send webhook after %d attempts", retryAttempts)
}

// sendDefaultWebhook sends the default webhook without DB logging. It retries on
// failure following the configured backoff schedule (1m, 2m, 5m ... up to 1
// week) so that transient outages of the default endpoint are tolerated.
func (s *WebhookService) sendDefaultWebhook(ctx context.Context, eventType string, payload string) error {
	retryAttempts := len(s.retryBackoff) + 1

	for attempt := 1; attempt <= retryAttempts; attempt++ {
		err := s.sendWebhookRequest(ctx, s.defaultWebhookURL, "", payload)
		if err == nil {
			return nil
		}
		if attempt < retryAttempts {
			if err := s.waitBeforeRetry(ctx, s.backoffForAttempt(attempt)); err != nil {
				return fmt.Errorf("default webhook retries interrupted after %d attempts: %w", attempt, err)
			}
		}
	}

	return fmt.Errorf("failed to send default webhook after %d attempts", retryAttempts)
}

// sendWebhookRequest sends a single webhook request
func (s *WebhookService) sendWebhookRequest(ctx context.Context, url string, secret string, payload string) error {
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBufferString(payload))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Webhook-Event", "transaction")

	// Add signature if secret is configured
	if secret != "" {
		signature := s.generateSignature(payload, secret)
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
