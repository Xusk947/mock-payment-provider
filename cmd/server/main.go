package main

import (
	_ "embed"
	"log"

	"github.com/gofiber/fiber/v3"
	"github.com/xusk947/mock-payment-provider/internal/handlers"
	"github.com/xusk947/mock-payment-provider/internal/middleware"
	"github.com/xusk947/mock-payment-provider/internal/repository"
	"github.com/xusk947/mock-payment-provider/internal/services"
	"github.com/xusk947/mock-payment-provider/pkg/database"
	"github.com/xusk947/mock-payment-provider/pkg/logger"
	"os"
	"go.uber.org/zap"
)

//go:embed docs/swagger.json
var swaggerJSON []byte

const swaggerUIHTML = `<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <title>Mock Payment Provider API</title>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/swagger.json",
        dom_id: "#swagger-ui",
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: "StandaloneLayout"
      });
    }
  </script>
</body>
</html>`

// @title Mock Payment Provider API
// @version 1.0
// @description API for mocking payment provider integrations with webhooks, 3DS, and admin dashboard.
// @host localhost:3000
// @BasePath /
func main() {
	// Initialize logger
	l, err := logger.New(logger.DefaultConfig())
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer l.Close()

	l.Info("Starting Mock Payment Provider API")

	// Initialize database with sqlc
	db, err := database.New(database.DefaultConfig())
	if err != nil {
		l.Fatal("Failed to initialize database", zap.Error(err))
	}
	defer db.Close()

	l.Info("Database initialized successfully")

	// Initialize repositories with sqlc queries
	txRepo := repository.NewTransactionRepository(db, db.Queries)
	merchantRepo := repository.NewMerchantRepository(db, db.Queries)
	cardRepo := repository.NewCardRepository(db, db.Queries)
	webhookRepo := repository.NewWebhookRepository(db, db.Queries)
	webhookLogRepo := repository.NewWebhookLogRepository(db, db.Queries)
	errorScenarioRepo := repository.NewErrorScenarioRepository(db, db.Queries)

	// Initialize services
	cardService := services.NewCardValidationService(cardRepo)
	threeDSService := services.NewThreeDSService(true)
	errorService := services.NewErrorScenarioService(errorScenarioRepo)
	webhookService := services.NewWebhookService(webhookRepo, webhookLogRepo)
	txService := services.NewTransactionService(
		txRepo, merchantRepo, cardRepo, cardService, threeDSService, errorService, webhookService,
	)

	// Initialize handlers
	paymentHandler := handlers.NewPaymentHandler(txService, threeDSService, errorService)
	adminHandler := handlers.NewAdminHandler(merchantRepo, cardRepo, errorScenarioRepo, webhookRepo, txRepo)
	webhookHandler := handlers.NewWebhookHandler(webhookRepo, merchantRepo)

	// Initialize Fiber app
	app := fiber.New(fiber.Config{
		AppName: "Mock Payment Provider",
	})

	// Middleware
	app.Use(middleware.Logger(l))
	app.Use(middleware.Recovery(l))
	app.Use(middleware.CORS())

	// API v1 routes
	api := app.Group("/api/v1")

	// Public payment routes
	api.Post("/charges", paymentHandler.Charge)
	api.Post("/holds", paymentHandler.Hold)
	api.Post("/captures", paymentHandler.Capture)
	api.Post("/refunds", paymentHandler.Refund)
	api.Get("/transactions", paymentHandler.ListTransactions)
	api.Get("/transactions/:id", paymentHandler.GetTransaction)
	api.Post("/transactions/:id/confirm", paymentHandler.ConfirmTransaction)
	api.Post("/transactions/:id/reject", paymentHandler.RejectTransaction)
	api.Post("/transactions/:id/capture", paymentHandler.CaptureTransaction)
	api.Post("/transactions/:id/refund", paymentHandler.RefundTransaction)
	api.Post("/transactions/:id/3ds/complete", paymentHandler.Authenticate3DS)
	api.Post("/3ds/challenge", paymentHandler.Generate3DSChallenge)

	// Invoice routes
	api.Post("/invoices", paymentHandler.CreateInvoice)
	api.Post("/invoices/:id/pay", paymentHandler.PayInvoice)

	// Public scenarios route
	api.Get("/scenarios", paymentHandler.ListScenarios)

	// Admin routes
	admin := app.Group("/admin")
	admin.Get("/dashboard", adminHandler.Dashboard)
	admin.Get("/merchants", adminHandler.ListMerchants)
	admin.Get("/merchants/:id", adminHandler.GetMerchant)
	admin.Get("/merchants/:id/webhooks", adminHandler.GetMerchantWebhooks)
	admin.Get("/cards", adminHandler.ListCards)
	admin.Get("/cards/:id", adminHandler.GetCard)
	admin.Get("/error-scenarios", adminHandler.ListErrorScenarios)
	admin.Get("/error-scenarios/:id", adminHandler.GetErrorScenario)
	admin.Get("/webhooks", webhookHandler.List)
	admin.Post("/webhooks", webhookHandler.Create)
	admin.Put("/webhooks/:id", webhookHandler.Update)
	admin.Delete("/webhooks/:id", webhookHandler.Delete)

	// Swagger routes
	app.Get("/swagger.json", func(c fiber.Ctx) error {
		c.Set("Content-Type", "application/json")
		return c.Send(swaggerJSON)
	})
	app.Get("/swagger", func(c fiber.Ctx) error {
		c.Set("Content-Type", "text/html; charset=utf-8")
		return c.SendString(swaggerUIHTML)
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	addr := ":" + port
	l.Info("Server starting", zap.String("address", addr))
	if err := app.Listen(addr); err != nil {
		l.Fatal("Failed to start server", zap.Error(err))
	}
}
