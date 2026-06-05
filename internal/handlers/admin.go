package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v3"
	"github.com/xusk947/mock-payment-provider/internal/models"
	"github.com/xusk947/mock-payment-provider/internal/repository"
)

// AdminHandler handles HTTP requests for admin operations
type AdminHandler struct {
	merchantRepo *repository.MerchantRepository
	cardRepo     *repository.CardRepository
	errorRepo    *repository.ErrorScenarioRepository
	webhookRepo  *repository.WebhookRepository
	txRepo       *repository.TransactionRepository
}

// NewAdminHandler creates a new admin handler
func NewAdminHandler(
	merchantRepo *repository.MerchantRepository,
	cardRepo *repository.CardRepository,
	errorRepo *repository.ErrorScenarioRepository,
	webhookRepo *repository.WebhookRepository,
	txRepo *repository.TransactionRepository,
) *AdminHandler {
	return &AdminHandler{
		merchantRepo: merchantRepo,
		cardRepo:     cardRepo,
		errorRepo:    errorRepo,
		webhookRepo:  webhookRepo,
		txRepo:       txRepo,
	}
}

// ListMerchants handles GET /admin/merchants
// @Summary List merchants
// @Description Retrieve paginated list of merchants
// @Tags admin
// @Produce json
// @Param limit query int false "Limit"
// @Param offset query int false "Offset"
// @Success 200 {array} models.Merchant
// @Failure 500 {object} models.ErrorResponse
// @Router /admin/merchants [get]
func (h *AdminHandler) ListMerchants(c fiber.Ctx) error {
	limit, _ := strconv.Atoi(c.Query("limit", "50"))
	offset, _ := strconv.Atoi(c.Query("offset", "0"))

	merchants, err := h.merchantRepo.List(c.Context(), limit, offset)
	if err != nil {
		return serverError(c, "Failed to retrieve merchants")
	}

	return c.JSON(models.MapMerchants(merchants))
}

// GetMerchant handles GET /admin/merchants/:id
// @Summary Get merchant by ID
// @Description Retrieve a single merchant details
// @Tags admin
// @Produce json
// @Param id path int true "Merchant ID"
// @Success 200 {object} models.Merchant
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Router /admin/merchants/{id} [get]
func (h *AdminHandler) GetMerchant(c fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return badRequest(c, err)
	}

	merchant, err := h.merchantRepo.Get(c.Context(), id)
	if err != nil {
		return notFound(c, "Merchant not found")
	}

	return c.JSON(models.MapMerchant(merchant))
}

// ListCards handles GET /admin/cards
// @Summary List cards
// @Description Retrieve all test cards
// @Tags admin
// @Produce json
// @Success 200 {array} models.Card
// @Failure 500 {object} models.ErrorResponse
// @Router /admin/cards [get]
func (h *AdminHandler) ListCards(c fiber.Ctx) error {
	cards, err := h.cardRepo.List(c.Context())
	if err != nil {
		return serverError(c, "Failed to retrieve cards")
	}

	return c.JSON(models.MapCards(cards))
}

// GetCard handles GET /admin/cards/:id
// @Summary Get card by ID
// @Description Retrieve a single test card
// @Tags admin
// @Produce json
// @Param id path int true "Card ID"
// @Success 200 {object} models.Card
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Router /admin/cards/{id} [get]
func (h *AdminHandler) GetCard(c fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return badRequest(c, err)
	}

	card, err := h.cardRepo.Get(c.Context(), id)
	if err != nil {
		return notFound(c, "Card not found")
	}

	return c.JSON(models.MapCard(card))
}

// ListErrorScenarios handles GET /admin/error-scenarios
// @Summary List error scenarios
// @Description Retrieve active error scenarios
// @Tags admin
// @Produce json
// @Success 200 {array} models.ErrorScenario
// @Failure 500 {object} models.ErrorResponse
// @Router /admin/error-scenarios [get]
func (h *AdminHandler) ListErrorScenarios(c fiber.Ctx) error {
	scenarios, err := h.errorRepo.ListActive(c.Context())
	if err != nil {
		return serverError(c, "Failed to retrieve error scenarios")
	}

	return c.JSON(models.MapErrorScenarios(scenarios))
}

// GetErrorScenario handles GET /admin/error-scenarios/:id
// @Summary Get error scenario by ID
// @Description Retrieve a single error scenario
// @Tags admin
// @Produce json
// @Param id path int true "Scenario ID"
// @Success 200 {object} models.ErrorScenario
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Router /admin/error-scenarios/{id} [get]
func (h *AdminHandler) GetErrorScenario(c fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return badRequest(c, err)
	}

	scenario, err := h.errorRepo.Get(c.Context(), id)
	if err != nil {
		return notFound(c, "Error scenario not found")
	}

	return c.JSON(models.MapErrorScenario(scenario))
}

// GetMerchantWebhooks handles GET /admin/merchants/:id/webhooks
// @Summary Get merchant webhooks
// @Description Retrieve webhooks for a merchant
// @Tags admin
// @Produce json
// @Param id path int true "Merchant ID"
// @Success 200 {array} models.Webhook
// @Failure 400 {object} models.ErrorResponse
// @Router /admin/merchants/{id}/webhooks [get]
func (h *AdminHandler) GetMerchantWebhooks(c fiber.Ctx) error {
	merchantID, err := parseID(c, "id")
	if err != nil {
		return badRequest(c, err)
	}

	webhooks, err := h.webhookRepo.GetByMerchant(c.Context(), int64(merchantID))
	if err != nil {
		return serverError(c, "Failed to retrieve webhooks")
	}

	return c.JSON(models.MapWebhooks(webhooks))
}

// Dashboard handles GET /admin/dashboard
// @Summary Admin dashboard statistics
// @Description Retrieve dashboard statistics for admin panel
// @Tags admin
// @Produce json
// @Success 200 {object} models.DashboardResponse
// @Router /admin/dashboard [get]
func (h *AdminHandler) Dashboard(c fiber.Ctx) error {
	dashboard := fiber.Map{
		"total_transactions":      0,
		"successful_transactions": 0,
		"total_amount":            0.0,
		"failed_transactions":     0,
		"total_merchants":         0,
		"total_cards":             0,
		"active_scenarios":        0,
	}

	if merchants, err := h.merchantRepo.List(c.Context(), 1000, 0); err == nil {
		dashboard["total_merchants"] = len(merchants)
	}

	if cards, err := h.cardRepo.List(c.Context()); err == nil {
		dashboard["total_cards"] = len(cards)
	}

	if scenarios, err := h.errorRepo.ListActive(c.Context()); err == nil {
		dashboard["active_scenarios"] = len(scenarios)
	}

	if transactions, err := h.txRepo.List(c.Context(), 10000, 0); err == nil {
		total := len(transactions)
		successful := 0
		failed := 0
		var totalAmount float64
		for _, tx := range transactions {
			if tx.Status == string(models.StatusCompleted) || tx.Status == string(models.StatusCaptured) {
				successful++
				totalAmount += tx.Amount
			}
			if tx.Status == string(models.StatusFailed) {
				failed++
			}
		}
		dashboard["total_transactions"] = total
		dashboard["successful_transactions"] = successful
		dashboard["total_amount"] = totalAmount
		dashboard["failed_transactions"] = failed
	}

	return c.JSON(dashboard)
}
