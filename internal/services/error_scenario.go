package services

import (
	"context"
	"crypto/rand"
	"math/big"

	db "github.com/xusk947/mock-payment-provider/sqlc"
)

// ErrorScenarioService handles error scenario logic
type ErrorScenarioService struct {
	repo interface {
		ListActive(ctx context.Context) ([]db.ErrorScenario, error)
		GetByName(ctx context.Context, name string) (*db.ErrorScenario, error)
	}
}

// NewErrorScenarioService creates a new error scenario service
func NewErrorScenarioService(repo interface {
	ListActive(ctx context.Context) ([]db.ErrorScenario, error)
	GetByName(ctx context.Context, name string) (*db.ErrorScenario, error)
}) *ErrorScenarioService {
	return &ErrorScenarioService{repo: repo}
}

// GetActiveScenario gets an active error scenario based on probability
func (s *ErrorScenarioService) GetActiveScenario(ctx context.Context) (*db.ErrorScenario, error) {
	scenarios, err := s.repo.ListActive(ctx)
	if err != nil {
		return nil, err
	}

	if len(scenarios) == 0 {
		return nil, nil
	}

	// Check each scenario based on its probability
	for _, scenario := range scenarios {
		probability := 0.0
		if scenario.Probability.Valid {
			probability = scenario.Probability.Float64
		}
		val, _ := rand.Int(rand.Reader, big.NewInt(10000))
		if float64(val.Int64())/100.0 < probability {
			return &scenario, nil
		}
	}

	// No error scenario triggered
	return nil, nil
}

// GetScenarioByName gets a specific error scenario by name
func (s *ErrorScenarioService) GetScenarioByName(ctx context.Context, name string) (*db.ErrorScenario, error) {
	return s.repo.GetByName(ctx, name)
}

// ApplyScenario applies an error scenario to a transaction
func (s *ErrorScenarioService) ApplyScenario(ctx context.Context, scenario *db.ErrorScenario, cardResponseScenario string) (*db.ErrorScenario, error) {
	// If card has a specific response scenario (from test cards), use that
	if cardResponseScenario != "success" && cardResponseScenario != "" {
		cardScenario, err := s.repo.GetByName(ctx, cardResponseScenario)
		if err == nil && cardScenario != nil {
			return cardScenario, nil
		}
	}

	// Otherwise, use the provided scenario
	return scenario, nil
}

// ListAllScenarios lists all error scenarios
func (s *ErrorScenarioService) ListAllScenarios(ctx context.Context) ([]db.ErrorScenario, error) {
	return s.repo.ListActive(ctx) // For simplicity, using ListActive
}

// CreateScenario creates a new error scenario
func (s *ErrorScenarioService) CreateScenario(ctx context.Context, scenario *db.ErrorScenario) error {
	return nil // Not implemented in this version
}

// UpdateScenario updates an error scenario
func (s *ErrorScenarioService) UpdateScenario(ctx context.Context, scenario *db.ErrorScenario) error {
	return nil // Not implemented in this version
}

// DeleteScenario deletes an error scenario
func (s *ErrorScenarioService) DeleteScenario(ctx context.Context, id int) error {
	return nil // Not implemented in this version
}
