package handlers

import (
	"encoding/json"
	"strconv"

	"github.com/gofiber/fiber/v3"
	"github.com/xusk947/mock-payment-provider/internal/services"
)

// PaymentHandler handles HTTP requests for payment operations
type PaymentHandler struct {
	txService      *services.TransactionService
	threeDSService *services.ThreeDSService
}

// NewPaymentHandler creates a new payment handler
func NewPaymentHandler(txService *services.TransactionService, threeDSService *services.ThreeDSService) *PaymentHandler {
	return &PaymentHandler{txService: txService, threeDSService: threeDSService}
}

// Charge handles POST /api/v1/charges
func (h *PaymentHandler) Charge(c fiber.Ctx) error {
	var req services.ChargeRequest
	if err := json.Unmarshal(c.Body(), &req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	tx, err := h.txService.Charge(c.Context(), &req)
	if err != nil {
		// Check if 3D Secure is required
		if err.Error() == "3D Secure required" {
			return c.Status(402).JSON(fiber.Map{
				"error":       "3D Secure authentication required",
				"transaction": tx,
			})
		}
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(tx)
}

// Hold handles POST /api/v1/holds
func (h *PaymentHandler) Hold(c fiber.Ctx) error {
	var req services.ChargeRequest
	if err := json.Unmarshal(c.Body(), &req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	tx, err := h.txService.Hold(c.Context(), &req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(tx)
}

// Capture handles POST /api/v1/captures
func (h *PaymentHandler) Capture(c fiber.Ctx) error {
	var req CaptureRequest
	if err := json.Unmarshal(c.Body(), &req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	tx, err := h.txService.Capture(c.Context(), req.HoldID, req.Amount, req.APIKey)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(tx)
}

// Refund handles POST /api/v1/refunds
func (h *PaymentHandler) Refund(c fiber.Ctx) error {
	var req RefundRequest
	if err := json.Unmarshal(c.Body(), &req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	tx, err := h.txService.Refund(c.Context(), req.TransactionID, req.Amount, req.APIKey)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(tx)
}

// GetTransaction handles GET /api/v1/transactions/:id
func (h *PaymentHandler) GetTransaction(c fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid transaction ID"})
	}

	tx, err := h.txService.Get(c.Context(), id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Transaction not found"})
	}

	return c.JSON(tx)
}

// Generate3DSChallenge handles POST /api/v1/3ds/challenge
func (h *PaymentHandler) Generate3DSChallenge(c fiber.Ctx) error {
	var req struct {
		Amount     float64 `json:"amount"`
		Currency   string  `json:"currency"`
		CardNumber string  `json:"card_number"`
	}
	if err := json.Unmarshal(c.Body(), &req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	transactionID, challengeURL, err := h.threeDSService.GenerateChallenge(c.Context(), req.Amount, req.Currency, req.CardNumber)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"transaction_id": transactionID,
		"challenge_url":  challengeURL,
	})
}

// CaptureRequest represents a capture request
type CaptureRequest struct {
	APIKey string  `json:"api_key"`
	HoldID int     `json:"hold_id"`
	Amount float64 `json:"amount"`
}

// RefundRequest represents a refund request
type RefundRequest struct {
	APIKey        string  `json:"api_key"`
	TransactionID int     `json:"transaction_id"`
	Amount        float64 `json:"amount"`
}
