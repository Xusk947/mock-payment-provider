package services

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/xusk947/mock-payment-provider/internal/repository"
	db "github.com/xusk947/mock-payment-provider/sqlc"
)

func TestErrorScenarioGetActive(t *testing.T) {
	dbConn := setupTestDB(t)
	defer dbConn.Close()
	ctx := context.Background()

	repo := repository.NewErrorScenarioRepository(dbConn, dbConn.Queries)
	svc := NewErrorScenarioService(repo)

	// Insert a 100% active scenario
	_, err := dbConn.ExecContext(ctx,
		"INSERT INTO error_scenarios (name, error_type, error_code, error_message, probability, active) VALUES ('decline', 'card_declined', 'DECLINED', 'Declined', 100.00, 1)")
	require.NoError(t, err)

	scenario, err := svc.GetActiveScenario(ctx)
	require.NoError(t, err)
	require.NotNil(t, scenario)
	assert.Equal(t, "decline", scenario.Name)
	assert.Equal(t, "DECLINED", scenario.ErrorCode)
}

func TestErrorScenarioNoActive(t *testing.T) {
	dbConn := setupTestDB(t)
	defer dbConn.Close()
	ctx := context.Background()

	repo := repository.NewErrorScenarioRepository(dbConn, dbConn.Queries)
	svc := NewErrorScenarioService(repo)

	scenario, err := svc.GetActiveScenario(ctx)
	require.NoError(t, err)
	assert.Nil(t, scenario)
}

func TestErrorScenarioGetByName(t *testing.T) {
	dbConn := setupTestDB(t)
	defer dbConn.Close()
	ctx := context.Background()

	repo := repository.NewErrorScenarioRepository(dbConn, dbConn.Queries)
	svc := NewErrorScenarioService(repo)

	_, err := dbConn.ExecContext(ctx,
		"INSERT INTO error_scenarios (name, error_type, error_code, error_message, probability, active) VALUES ('insufficient_funds', 'insufficient_funds', 'INSUFFICIENT_FUNDS', 'No money', 100.00, 1)")
	require.NoError(t, err)

	scenario, err := svc.GetScenarioByName(ctx, "insufficient_funds")
	require.NoError(t, err)
	require.NotNil(t, scenario)
	assert.Equal(t, "INSUFFICIENT_FUNDS", scenario.ErrorCode)

	_, err = svc.GetScenarioByName(ctx, "nonexistent")
	require.Error(t, err)
}

func TestApplyScenarioUsesCardScenario(t *testing.T) {
	dbConn := setupTestDB(t)
	defer dbConn.Close()
	ctx := context.Background()

	repo := repository.NewErrorScenarioRepository(dbConn, dbConn.Queries)
	svc := NewErrorScenarioService(repo)

	_, err := dbConn.ExecContext(ctx,
		"INSERT INTO error_scenarios (name, error_type, error_code, error_message, probability, active) VALUES ('card_declined', 'card_declined', 'DECLINED', 'Declined', 100.00, 1)")
	require.NoError(t, err)

	base := &db.ErrorScenario{Name: "base", ErrorCode: "BASE", ErrorMessage: "Base error"}
	result, err := svc.ApplyScenario(ctx, base, "card_declined")
	require.NoError(t, err)
	assert.Equal(t, "DECLINED", result.ErrorCode)
}

func TestApplyScenarioFallsBackToProvided(t *testing.T) {
	dbConn := setupTestDB(t)
	defer dbConn.Close()
	ctx := context.Background()

	repo := repository.NewErrorScenarioRepository(dbConn, dbConn.Queries)
	svc := NewErrorScenarioService(repo)

	base := &db.ErrorScenario{Name: "base", ErrorCode: "BASE", ErrorMessage: "Base error"}
	result, err := svc.ApplyScenario(ctx, base, "success")
	require.NoError(t, err)
	assert.Equal(t, "BASE", result.ErrorCode)
}

func TestApplyScenarioFallsBackOnUnknownCardScenario(t *testing.T) {
	dbConn := setupTestDB(t)
	defer dbConn.Close()
	ctx := context.Background()

	repo := repository.NewErrorScenarioRepository(dbConn, dbConn.Queries)
	svc := NewErrorScenarioService(repo)

	base := &db.ErrorScenario{Name: "base", ErrorCode: "BASE", ErrorMessage: "Base error"}
	result, err := svc.ApplyScenario(ctx, base, "unknown_scenario")
	require.NoError(t, err)
	assert.Equal(t, "BASE", result.ErrorCode)
}
