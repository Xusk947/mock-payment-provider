package middleware

import (
	"context"
	"fmt"

	"github.com/gofiber/fiber/v3"
	"github.com/xusk947/mock-payment-provider/internal/repository"
	db "github.com/xusk947/mock-payment-provider/sqlc"
)

// AuthMiddleware validates API key authentication
func AuthMiddleware(merchantRepo *repository.MerchantRepository) fiber.Handler {
	return func(c fiber.Ctx) error {
		apiKey := c.Get("X-API-Key")
		if apiKey == "" {
			return c.Status(401).JSON(fiber.Map{
				"error": "API key is required",
			})
		}

		merchant, err := merchantRepo.GetByAPIKey(context.Background(), apiKey)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{
				"error": "Invalid API key",
			})
		}

		if merchant.Active.Valid && !merchant.Active.Bool {
			return c.Status(403).JSON(fiber.Map{
				"error": "Merchant account is inactive",
			})
		}

		// Store merchant ID in context for use in handlers
		c.Locals("merchant_id", merchant.ID)
		c.Locals("merchant", merchant)

		return c.Next()
	}
}

// GetMerchantFromContext retrieves merchant from context
func GetMerchantFromContext(c fiber.Ctx) (*db.Merchant, error) {
	merchant, ok := c.Locals("merchant").(*db.Merchant)
	if !ok {
		return nil, fmt.Errorf("merchant not found in context")
	}
	return merchant, nil
}
