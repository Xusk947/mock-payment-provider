package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/gofiber/fiber/v3"
	"github.com/xusk947/mock-payment-provider/internal/models"
	"github.com/xusk947/mock-payment-provider/internal/repository"
	db "github.com/xusk947/mock-payment-provider/sqlc"
)

// WebhookHandler handles HTTP requests for webhook management
type WebhookHandler struct {
	webhookRepo       *repository.WebhookRepository
	merchantRepo      *repository.MerchantRepository
	defaultWebhookURL string
}

// NewWebhookHandler creates a new webhook handler
func NewWebhookHandler(webhookRepo *repository.WebhookRepository, merchantRepo *repository.MerchantRepository, defaultWebhookURL string) *WebhookHandler {
	return &WebhookHandler{
		webhookRepo:       webhookRepo,
		merchantRepo:      merchantRepo,
		defaultWebhookURL: defaultWebhookURL,
	}
}

func (h *WebhookHandler) getMerchant(c fiber.Ctx) (*db.Merchant, error) {
	apiKey := c.Get("X-API-Key")
	if apiKey == "" {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "API key is required")
	}
	return h.merchantRepo.GetByAPIKey(c.Context(), apiKey)
}

// List handles GET /admin/webhooks
// @Summary List webhooks
// @Description Retrieve webhooks for the authenticated merchant
// @Tags webhooks
// @Produce json
// @Success 200 {array} models.Webhook
// @Failure 401 {object} models.ErrorResponse
// @Router /admin/webhooks [get]
func (h *WebhookHandler) List(c fiber.Ctx) error {
	merchant, err := h.getMerchant(c)
	if err != nil {
		return c.Status(401).JSON(models.ErrorResponse{Error: "Invalid API key"})
	}

	webhooks, err := h.webhookRepo.GetByMerchant(c.Context(), merchant.ID)
	if err != nil {
		return serverError(c, "Failed to retrieve webhooks")
	}

	result := models.MapWebhooks(webhooks)

	// Include default webhook if configured
	if h.defaultWebhookURL != "" {
		defaultWebhook := models.Webhook{
			ID:         -1,
			MerchantID: int(merchant.ID),
			URL:        h.defaultWebhookURL,
			EventTypes: "[\"*\"]",
			Active:     true,
			IsDefault:  true,
		}
		result = append([]models.Webhook{defaultWebhook}, result...)
	}

	return c.JSON(result)
}

// Create handles POST /admin/webhooks
// @Summary Create webhook
// @Description Register a new webhook endpoint
// @Tags webhooks
// @Accept json
// @Produce json
// @Param request body models.WebhookRequest true "Webhook Request"
// @Success 201 {object} models.Webhook
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Router /admin/webhooks [post]
func (h *WebhookHandler) Create(c fiber.Ctx) error {
	merchant, err := h.getMerchant(c)
	if err != nil {
		return c.Status(401).JSON(models.ErrorResponse{Error: "Invalid API key"})
	}

	var req models.WebhookRequest
	if err := bindJSON(c, &req); err != nil {
		return badRequest(c, err)
	}

	eventsJSON, err := json.Marshal(req.Events)
	if err != nil {
		return badRequest(c, fmt.Errorf("invalid events: %w", err))
	}

	webhook := &db.Webhook{
		MerchantID:     merchant.ID,
		Url:            req.URL,
		EventTypes:     string(eventsJSON),
		Active:         sql.NullBool{Bool: req.Active, Valid: true},
		RetryAttempts:  sql.NullInt64{Int64: 3, Valid: true},
		TimeoutSeconds: sql.NullInt64{Int64: 30, Valid: true},
	}

	if err := h.webhookRepo.Create(c.Context(), webhook); err != nil {
		return serverError(c, "Failed to create webhook")
	}

	return c.Status(201).JSON(models.MapWebhook(webhook))
}

// Update handles PUT /admin/webhooks/:id
// @Summary Update webhook
// @Description Update an existing webhook configuration
// @Tags webhooks
// @Accept json
// @Produce json
// @Param id path int true "Webhook ID"
// @Param request body models.WebhookRequest true "Webhook Request"
// @Success 200 {object} models.Webhook
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Router /admin/webhooks/{id} [put]
func (h *WebhookHandler) Update(c fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return badRequest(c, err)
	}

	webhook, err := h.webhookRepo.Get(c.Context(), id)
	if err != nil {
		return notFound(c, "Webhook not found")
	}

	var req models.WebhookRequest
	if err := bindJSON(c, &req); err != nil {
		return badRequest(c, err)
	}

	eventsJSON, err := json.Marshal(req.Events)
	if err != nil {
		return badRequest(c, fmt.Errorf("invalid events: %w", err))
	}

	webhook.Url = req.URL
	webhook.EventTypes = string(eventsJSON)
	webhook.Active = sql.NullBool{Bool: req.Active, Valid: true}

	if err := h.webhookRepo.Update(c.Context(), webhook); err != nil {
		return serverError(c, "Failed to update webhook")
	}

	return c.JSON(models.MapWebhook(webhook))
}

// Delete handles DELETE /admin/webhooks/:id
// @Summary Delete webhook
// @Description Remove a webhook configuration
// @Tags webhooks
// @Param id path int true "Webhook ID"
// @Success 204
// @Failure 400 {object} models.ErrorResponse
// @Router /admin/webhooks/{id} [delete]
func (h *WebhookHandler) Delete(c fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return badRequest(c, err)
	}

	if err := h.webhookRepo.Delete(c.Context(), id); err != nil {
		return serverError(c, "Failed to delete webhook")
	}

	return c.SendStatus(204)
}
