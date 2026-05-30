package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v3"
	"github.com/xusk947/mock-payment-provider/internal/repository"
)

// AdminHandler handles HTTP requests for admin operations
type AdminHandler struct {
	merchantRepo *repository.MerchantRepository
	cardRepo     *repository.CardRepository
	errorRepo    *repository.ErrorScenarioRepository
	webhookRepo  *repository.WebhookRepository
}

// NewAdminHandler creates a new admin handler
func NewAdminHandler(
	merchantRepo *repository.MerchantRepository,
	cardRepo *repository.CardRepository,
	errorRepo *repository.ErrorScenarioRepository,
	webhookRepo *repository.WebhookRepository,
) *AdminHandler {
	return &AdminHandler{
		merchantRepo: merchantRepo,
		cardRepo:     cardRepo,
		errorRepo:    errorRepo,
		webhookRepo:  webhookRepo,
	}
}

// ListMerchants handles GET /admin/merchants
func (h *AdminHandler) ListMerchants(c fiber.Ctx) error {
	limit, _ := strconv.Atoi(c.Query("limit", "50"))
	offset, _ := strconv.Atoi(c.Query("offset", "0"))

	merchants, err := h.merchantRepo.List(c.Context(), limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to retrieve merchants"})
	}

	return c.JSON(merchants)
}

// GetMerchant handles GET /admin/merchants/:id
func (h *AdminHandler) GetMerchant(c fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid merchant ID"})
	}

	merchant, err := h.merchantRepo.Get(c.Context(), id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Merchant not found"})
	}

	return c.JSON(merchant)
}

// ListCards handles GET /admin/cards
func (h *AdminHandler) ListCards(c fiber.Ctx) {
	cards, err := h.cardRepo.List(c.Context())
	if err != nil {
		c.Status(500).JSON(fiber.Map{"error": "Failed to retrieve cards"})
		return
	}

	c.JSON(cards)
}

// GetCard handles GET /admin/cards/:id
func (h *AdminHandler) GetCard(c fiber.Ctx) {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		c.Status(400).JSON(fiber.Map{"error": "Invalid card ID"})
		return
	}

	card, err := h.cardRepo.Get(c.Context(), id)
	if err != nil {
		c.Status(404).JSON(fiber.Map{"error": "Card not found"})
		return
	}

	c.JSON(card)
}

// ListErrorScenarios handles GET /admin/error-scenarios
func (h *AdminHandler) ListErrorScenarios(c fiber.Ctx) {
	scenarios, err := h.errorRepo.ListActive(c.Context())
	if err != nil {
		c.Status(500).JSON(fiber.Map{"error": "Failed to retrieve error scenarios"})
		return
	}

	c.JSON(scenarios)
}

// GetErrorScenario handles GET /admin/error-scenarios/:id
func (h *AdminHandler) GetErrorScenario(c fiber.Ctx) {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		c.Status(400).JSON(fiber.Map{"error": "Invalid error scenario ID"})
		return
	}

	scenario, err := h.errorRepo.Get(c.Context(), id)
	if err != nil {
		c.Status(404).JSON(fiber.Map{"error": "Error scenario not found"})
		return
	}

	c.JSON(scenario)
}

// GetMerchantWebhooks handles GET /admin/merchants/:id/webhooks
func (h *AdminHandler) GetMerchantWebhooks(c fiber.Ctx) {
	merchantID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		c.Status(400).JSON(fiber.Map{"error": "Invalid merchant ID"})
		return
	}

	webhooks, err := h.webhookRepo.GetByMerchant(c.Context(), int64(merchantID))
	if err != nil {
		c.Status(500).JSON(fiber.Map{"error": "Failed to retrieve webhooks"})
		return
	}

	c.JSON(webhooks)
}

// Dashboard handles GET /admin/dashboard
func (h *AdminHandler) Dashboard(c fiber.Ctx) {
	// Simple dashboard with statistics
	dashboard := fiber.Map{
		"total_merchants":  0,
		"total_cards":      0,
		"active_scenarios": 0,
	}

	// Get counts (simplified for this example)
	if merchants, err := h.merchantRepo.List(c.Context(), 1000, 0); err == nil {
		dashboard["total_merchants"] = len(merchants)
	}

	if cards, err := h.cardRepo.List(c.Context()); err == nil {
		dashboard["total_cards"] = len(cards)
	}

	if scenarios, err := h.errorRepo.ListActive(c.Context()); err == nil {
		dashboard["active_scenarios"] = len(scenarios)
	}

	c.JSON(dashboard)
}
