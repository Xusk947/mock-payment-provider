package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v3"
	"github.com/xusk947/mock-payment-provider/internal/models"
	"github.com/xusk947/mock-payment-provider/internal/services"
	"github.com/xusk947/mock-payment-provider/internal/utils"
)

// PaymentHandler handles HTTP requests for payment operations
type PaymentHandler struct {
	txService      *services.TransactionService
	threeDSService *services.ThreeDSService
	errorService   *services.ErrorScenarioService
	urlConfig      *utils.URLConfig
}

// NewPaymentHandler creates a new payment handler
func NewPaymentHandler(txService *services.TransactionService, threeDSService *services.ThreeDSService, errorService *services.ErrorScenarioService, urlConfig *utils.URLConfig) *PaymentHandler {
	return &PaymentHandler{txService: txService, threeDSService: threeDSService, errorService: errorService, urlConfig: urlConfig}
}

// Charge handles POST /api/v1/charges
// @Summary Process a charge
// @Description Create a new charge transaction
// @Tags payments
// @Accept json
// @Produce json
// @Param request body models.ChargeRequest true "Charge Request"
// @Success 201 {object} models.Transaction
// @Failure 400 {object} models.ErrorResponse
// @Failure 402 {object} models.ThreeDSRequiredResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/v1/charges [post]
func (h *PaymentHandler) Charge(c fiber.Ctx) error {
	var req models.ChargeRequest
	if err := bindJSON(c, &req); err != nil {
		return badRequest(c, err)
	}

	tx, err := h.txService.Charge(c.Context(), &req)
	if err != nil {
		if errors.Is(err, services.ErrThreeDSRequired) {
			return c.Status(402).JSON(models.ThreeDSRequiredResponse{
				Error:       "3D Secure authentication required",
				Transaction: *models.MapTransaction(tx),
			})
		}
		return serverError(c, err.Error())
	}

	return c.Status(201).JSON(models.MapTransaction(tx))
}

// Hold handles POST /api/v1/holds
// @Summary Place a hold
// @Description Authorize a hold on a card
// @Tags payments
// @Accept json
// @Produce json
// @Param request body models.ChargeRequest true "Hold Request"
// @Success 201 {object} models.Transaction
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/v1/holds [post]
func (h *PaymentHandler) Hold(c fiber.Ctx) error {
	var req models.ChargeRequest
	if err := bindJSON(c, &req); err != nil {
		return badRequest(c, err)
	}

	tx, err := h.txService.Hold(c.Context(), &req)
	if err != nil {
		return serverError(c, err.Error())
	}

	return c.Status(201).JSON(models.MapTransaction(tx))
}

// Capture handles POST /api/v1/captures
// @Summary Capture a hold
// @Description Capture an authorized hold transaction
// @Tags payments
// @Accept json
// @Produce json
// @Param request body models.CaptureRequest true "Capture Request"
// @Success 201 {object} models.Transaction
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/v1/captures [post]
func (h *PaymentHandler) Capture(c fiber.Ctx) error {
	var req models.CaptureRequest
	if err := bindJSON(c, &req); err != nil {
		return badRequest(c, err)
	}

	tx, err := h.txService.Capture(c.Context(), req.HoldID, req.Amount, req.APIKey)
	if err != nil {
		return serverError(c, err.Error())
	}

	return c.Status(201).JSON(models.MapTransaction(tx))
}

// Refund handles POST /api/v1/refunds
// @Summary Process a refund
// @Description Issue a refund for a completed transaction
// @Tags payments
// @Accept json
// @Produce json
// @Param request body models.RefundRequest true "Refund Request"
// @Success 201 {object} models.Transaction
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/v1/refunds [post]
func (h *PaymentHandler) Refund(c fiber.Ctx) error {
	var req models.RefundRequest
	if err := bindJSON(c, &req); err != nil {
		return badRequest(c, err)
	}

	tx, err := h.txService.Refund(c.Context(), req.TransactionID, req.Amount, req.APIKey)
	if err != nil {
		return serverError(c, err.Error())
	}

	return c.Status(201).JSON(models.MapTransaction(tx))
}

// GetTransaction handles GET /api/v1/transactions/:id
// @Summary Get transaction by ID
// @Description Retrieve a single transaction details
// @Tags payments
// @Produce json
// @Param id path int true "Transaction ID"
// @Success 200 {object} models.Transaction
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Router /api/v1/transactions/{id} [get]
func (h *PaymentHandler) GetTransaction(c fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return badRequest(c, err)
	}

	tx, err := h.txService.Get(c.Context(), id)
	if err != nil {
		return notFound(c, "Transaction not found")
	}

	return c.JSON(models.MapTransaction(tx))
}

// ListTransactions handles GET /api/v1/transactions
// @Summary List transactions
// @Description Retrieve paginated list of transactions
// @Tags payments
// @Produce json
// @Param limit query int false "Limit"
// @Param offset query int false "Offset"
// @Success 200 {array} models.Transaction
// @Failure 500 {object} models.ErrorResponse
// @Router /api/v1/transactions [get]
func (h *PaymentHandler) ListTransactions(c fiber.Ctx) error {
	limit, _ := strconv.Atoi(c.Query("limit", "100"))
	offset, _ := strconv.Atoi(c.Query("offset", "0"))

	transactions, err := h.txService.List(c.Context(), limit, offset)
	if err != nil {
		return serverError(c, "Failed to retrieve transactions")
	}

	return c.JSON(models.MapTransactions(transactions))
}

// ConfirmTransaction handles POST /api/v1/transactions/:id/confirm
// @Summary Confirm a pending transaction
// @Description Mark a pending transaction as completed
// @Tags payments
// @Produce json
// @Param id path int true "Transaction ID"
// @Success 200 {object} models.Transaction
// @Failure 400 {object} models.ErrorResponse
// @Router /api/v1/transactions/{id}/confirm [post]
func (h *PaymentHandler) ConfirmTransaction(c fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid transaction ID"})
	}

	tx, err := h.txService.Confirm(c.Context(), id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(models.MapTransaction(tx))
}

// RejectTransaction handles POST /api/v1/transactions/:id/reject
// @Summary Reject a transaction
// @Description Mark a transaction as failed
// @Tags payments
// @Produce json
// @Param id path int true "Transaction ID"
// @Success 200 {object} models.Transaction
// @Failure 400 {object} models.ErrorResponse
// @Router /api/v1/transactions/{id}/reject [post]
func (h *PaymentHandler) RejectTransaction(c fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid transaction ID"})
	}

	tx, err := h.txService.Reject(c.Context(), id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(models.MapTransaction(tx))
}

// CaptureTransaction handles POST /api/v1/transactions/:id/capture
// @Summary Capture a hold
// @Description Capture an authorized hold amount
// @Tags payments
// @Accept json
// @Produce json
// @Param id path int true "Transaction ID"
// @Param request body models.CaptureTransactionRequest true "Capture Request"
// @Success 200 {object} models.Transaction
// @Failure 400 {object} models.ErrorResponse
// @Router /api/v1/transactions/{id}/capture [post]
func (h *PaymentHandler) CaptureTransaction(c fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid transaction ID"})
	}

	var req struct {
		Amount float64 `json:"amount"`
	}
	if err := json.Unmarshal(c.Body(), &req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	tx, err := h.txService.CaptureByID(c.Context(), id, req.Amount)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(models.MapTransaction(tx))
}

// RefundTransaction handles POST /api/v1/transactions/:id/refund
// @Summary Refund a transaction
// @Description Issue a refund for a completed or captured transaction
// @Tags payments
// @Accept json
// @Produce json
// @Param id path int true "Transaction ID"
// @Param request body models.RefundTransactionRequest true "Refund Request"
// @Success 200 {object} models.Transaction
// @Failure 400 {object} models.ErrorResponse
// @Router /api/v1/transactions/{id}/refund [post]
func (h *PaymentHandler) RefundTransaction(c fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid transaction ID"})
	}

	var req struct {
		Amount float64 `json:"amount"`
	}
	if err := json.Unmarshal(c.Body(), &req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	tx, err := h.txService.RefundByID(c.Context(), id, req.Amount)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(models.MapTransaction(tx))
}

// Authenticate3DS handles POST /api/v1/transactions/:id/3ds/complete
// @Summary Complete 3D Secure authentication
// @Description Authenticate a transaction requiring 3DS
// @Tags payments
// @Produce json
// @Param id path int true "Transaction ID"
// @Param request body models.ThreeDSAuthenticateRequest false "3DS Authentication"
// @Success 200 {object} models.ThreeDSAuthenticateResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Router /api/v1/transactions/{id}/3ds/complete [post]
func (h *PaymentHandler) Authenticate3DS(c fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return badRequest(c, err)
	}

	tx, err := h.txService.Get(c.Context(), id)
	if err != nil {
		return notFound(c, "Transaction not found")
	}

	if !tx.ThreeDsRequired.Valid || !tx.ThreeDsRequired.Bool {
		return badRequest(c, fmt.Errorf("3D Secure is not required for this transaction"))
	}

	if tx.Status == string(models.StatusPending) {
		tx, err = h.txService.Complete3DS(c.Context(), id)
		if err != nil {
			return serverError(c, err.Error())
		}
	}

	return c.JSON(models.ThreeDSAuthenticateResponse{
		Success:     true,
		Transaction: *models.MapTransaction(tx),
	})
}

// Generate3DSChallenge handles POST /api/v1/3ds/challenge
// @Summary Generate 3DS challenge
// @Description Generate a 3D Secure challenge for a card
// @Tags payments
// @Accept json
// @Produce json
// @Param request body models.ThreeDSChallengeRequest true "3DS Request"
// @Success 200 {object} models.ThreeDSChallengeResponse
// @Failure 400 {object} models.ErrorResponse
// @Router /api/v1/3ds/challenge [post]
func (h *PaymentHandler) Generate3DSChallenge(c fiber.Ctx) error {
	var req struct {
		Amount     float64 `json:"amount"`
		Currency   string  `json:"currency"`
		CardNumber string  `json:"card_number"`
	}
	if err := bindJSON(c, &req); err != nil {
		return badRequest(c, err)
	}

	_, challengeURL, err := h.threeDSService.GenerateChallenge(c.Context(), req.Amount, req.Currency, req.CardNumber)
	if err != nil {
		return serverError(c, err.Error())
	}

	return c.JSON(fiber.Map{
		"challenge_url": challengeURL,
	})
}

// CreateInvoice handles POST /api/v1/invoices
// @Summary Create an invoice
// @Description Create a pending charge invoice without card details
// @Tags payments
// @Accept json
// @Produce json
// @Param request body models.InvoiceRequest true "Invoice Request"
// @Success 201 {object} models.Transaction
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Router /api/v1/invoices [post]
func (h *PaymentHandler) CreateInvoice(c fiber.Ctx) error {
	var req models.InvoiceRequest
	if err := bindJSON(c, &req); err != nil {
		return badRequest(c, err)
	}

	apiKey := c.Get("X-API-Key")
	if apiKey == "" {
		return c.Status(401).JSON(models.ErrorResponse{Error: "API key is required"})
	}

	tx, err := h.txService.CreateInvoice(c.Context(), apiKey, req.Amount, req.Currency, req.Metadata)
	if err != nil {
		return badRequest(c, err)
	}

	return c.Status(201).JSON(fiber.Map{
		"transaction": models.MapTransaction(tx),
		"payment_url": h.urlConfig.GenerateCheckoutURL(int(tx.ID)),
	})
}

// PayInvoice handles POST /api/v1/invoices/:id/pay
// @Summary Pay an invoice
// @Description Process payment for an existing pending invoice
// @Tags payments
// @Accept json
// @Produce json
// @Param id path int true "Invoice ID"
// @Param request body models.PayInvoiceRequest true "Payment Request"
// @Success 200 {object} models.Transaction
// @Failure 400 {object} models.ErrorResponse
// @Failure 402 {object} models.ThreeDSRequiredResponse
// @Failure 404 {object} models.ErrorResponse
// @Router /api/v1/invoices/{id}/pay [post]
func (h *PaymentHandler) PayInvoice(c fiber.Ctx) error {
	id, err := parseID(c, "id")
	if err != nil {
		return badRequest(c, err)
	}

	var req models.PayInvoiceRequest
	if err := bindJSON(c, &req); err != nil {
		return badRequest(c, err)
	}

	chargeReq := &models.ChargeRequest{
		APIKey:               "test_api_key_12345",
		CardNumber:           req.CardNumber,
		CardholderName:       req.CardholderName,
		CVV:                  req.CVV,
		ExpiryMonth:          req.ExpiryMonth,
		ExpiryYear:           req.ExpiryYear,
		CardType:             req.CardType,
		ThreeDSAuthenticated: req.ThreeDSAuthenticated,
		Scenario:             req.Scenario,
	}

	tx, err := h.txService.PayInvoice(c.Context(), id, chargeReq)
	if err != nil {
		if errors.Is(err, services.ErrThreeDSRequired) {
			return c.Status(402).JSON(models.ThreeDSRequiredResponse{
				Error:       "3D Secure authentication required",
				Transaction: *models.MapTransaction(tx),
			})
		}
		return badRequest(c, err)
	}

	return c.JSON(models.MapTransaction(tx))
}

// ListScenarios handles GET /api/v1/scenarios
// @Summary List payment scenarios
// @Description Retrieve all active error scenarios available for payment simulation
// @Tags payments
// @Produce json
// @Success 200 {array} models.ErrorScenario
// @Router /api/v1/scenarios [get]
func (h *PaymentHandler) ListScenarios(c fiber.Ctx) error {
	scenarios, err := h.errorService.ListAllScenarios(c.Context())
	if err != nil {
		return serverError(c, "Failed to retrieve scenarios")
	}
	return c.JSON(models.MapErrorScenarios(scenarios))
}
