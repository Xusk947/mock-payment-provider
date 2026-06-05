package handlers

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v3"
	"github.com/xusk947/mock-payment-provider/internal/models"
)

// bindJSON unmarshals the request body into the given value and returns a
// formatted 400 error if decoding fails.
func bindJSON(c fiber.Ctx, v any) error {
	if err := json.Unmarshal(c.Body(), v); err != nil {
		return fmt.Errorf("invalid request body: %w", err)
	}
	return nil
}

// parseID extracts an integer path parameter. It returns a formatted 400 error
// if the parameter is not a valid integer.
func parseID(c fiber.Ctx, param string) (int, error) {
	id, err := strconv.Atoi(c.Params(param))
	if err != nil {
		return 0, fmt.Errorf("invalid %s", param)
	}
	return id, nil
}

// badRequest sends a 400 JSON error response.
func badRequest(c fiber.Ctx, err error) error {
	return c.Status(400).JSON(models.ErrorResponse{Error: err.Error()})
}

// notFound sends a 404 JSON error response.
func notFound(c fiber.Ctx, msg string) error {
	return c.Status(404).JSON(models.ErrorResponse{Error: msg})
}

// serverError sends a 500 JSON error response.
func serverError(c fiber.Ctx, msg string) error {
	return c.Status(500).JSON(models.ErrorResponse{Error: msg})
}
