package repository

import (
	"context"

	"github.com/xusk947/mock-payment-provider/pkg/database"
	db "github.com/xusk947/mock-payment-provider/sqlc"
)

// ErrorScenarioRepository handles database operations for error scenarios using sqlc
type ErrorScenarioRepository struct {
	db      *database.DB
	queries *db.Queries
}

// NewErrorScenarioRepository creates a new error scenario repository
func NewErrorScenarioRepository(database *database.DB, queries *db.Queries) *ErrorScenarioRepository {
	return &ErrorScenarioRepository{db: database, queries: queries}
}

// Get retrieves an error scenario by ID
func (r *ErrorScenarioRepository) Get(ctx context.Context, id int) (*db.ErrorScenario, error) {
	scenario, err := r.queries.GetErrorScenario(ctx, int64(id))
	if err != nil {
		return nil, err
	}
	return &scenario, nil
}

// GetByName retrieves an error scenario by name
func (r *ErrorScenarioRepository) GetByName(ctx context.Context, name string) (*db.ErrorScenario, error) {
	scenario, err := r.queries.GetErrorScenarioByName(ctx, name)
	if err != nil {
		return nil, err
	}
	return &scenario, nil
}

// List retrieves all error scenarios
func (r *ErrorScenarioRepository) List(ctx context.Context) ([]db.ErrorScenario, error) {
	return r.queries.ListErrorScenarios(ctx)
}

// ListActive retrieves all active error scenarios
func (r *ErrorScenarioRepository) ListActive(ctx context.Context) ([]db.ErrorScenario, error) {
	return r.queries.ListActiveErrorScenarios(ctx)
}

// Create creates a new error scenario
func (r *ErrorScenarioRepository) Create(ctx context.Context, scenario *db.ErrorScenario) error {
	result, err := r.queries.CreateErrorScenario(ctx, db.CreateErrorScenarioParams{
		Name:         scenario.Name,
		ErrorType:    scenario.ErrorType,
		ErrorCode:    scenario.ErrorCode,
		ErrorMessage: scenario.ErrorMessage,
		Probability:  scenario.Probability,
		Active:       scenario.Active,
	})
	if err != nil {
		return err
	}
	*scenario = result
	return nil
}

// Update updates an error scenario
func (r *ErrorScenarioRepository) Update(ctx context.Context, scenario *db.ErrorScenario) error {
	return r.queries.UpdateErrorScenario(ctx, db.UpdateErrorScenarioParams{
		ErrorType:    scenario.ErrorType,
		ErrorCode:    scenario.ErrorCode,
		ErrorMessage: scenario.ErrorMessage,
		Probability:  scenario.Probability,
		Active:       scenario.Active,
		ID:           scenario.ID,
	})
}

// Delete deletes an error scenario (soft delete by setting active = false)
func (r *ErrorScenarioRepository) Delete(ctx context.Context, id int) error {
	return r.queries.DeleteErrorScenario(ctx, int64(id))
}
