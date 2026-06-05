package middleware

import (
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/xusk947/mock-payment-provider/pkg/logger"
	"go.uber.org/zap"
)

// Logger is a middleware that logs HTTP requests
func Logger(l *logger.Logger) fiber.Handler {
	return func(c fiber.Ctx) error {
		start := time.Now()
		err := c.Next()
		duration := time.Since(start)

		l.Info("Request",
			zap.String("method", c.Method()),
			zap.String("path", c.Path()),
			zap.Int("status", c.Response().StatusCode()),
			zap.Duration("duration", duration),
		)

		return err
	}
}

// Recovery is a middleware that recovers from panics
func Recovery(l *logger.Logger) fiber.Handler {
	return func(c fiber.Ctx) error {
		defer func() {
			if r := recover(); r != nil {
				l.Error("Panic recovered",
					zap.String("path", c.Path()),
					zap.Any("error", r),
				)
				if err := c.Status(500).JSON(fiber.Map{"error": "Internal server error"}); err != nil {
					l.Error("Failed to send error response", zap.Error(err))
				}
			}
		}()

		return c.Next()
	}
}
