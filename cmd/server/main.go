package main

import (
	"log"

	"github.com/gofiber/fiber/v3"
	"github.com/xusk947/mock-payment-provider/internal/handlers"
	"github.com/xusk947/mock-payment-provider/internal/middleware"
	"github.com/xusk947/mock-payment-provider/internal/repository"
	"github.com/xusk947/mock-payment-provider/internal/services"
	"github.com/xusk947/mock-payment-provider/pkg/database"
	"github.com/xusk947/mock-payment-provider/pkg/logger"
	"go.uber.org/zap"
)

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
	paymentHandler := handlers.NewPaymentHandler(txService, threeDSService)
	adminHandler := handlers.NewAdminHandler(merchantRepo, cardRepo, errorScenarioRepo, webhookRepo)

	// Initialize Fiber app
	app := fiber.New(fiber.Config{
		AppName: "Mock Payment Provider",
	})

	// Middleware
	app.Use(middleware.Logger(l))
	app.Use(middleware.Recovery(l))

	// API v1 routes
	api := app.Group("/api/v1")

	// Public payment routes
	api.Post("/charges", paymentHandler.Charge)
	api.Post("/holds", paymentHandler.Hold)
	api.Post("/captures", paymentHandler.Capture)
	api.Post("/refunds", paymentHandler.Refund)
	api.Get("/transactions/:id", paymentHandler.GetTransaction)
	api.Post("/3ds/challenge", paymentHandler.Generate3DSChallenge)

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

	// Start server
	addr := ":3000"
	l.Info("Server starting", zap.String("address", addr))
	if err := app.Listen(addr); err != nil {
		l.Fatal("Failed to start server", zap.Error(err))
	}
}
