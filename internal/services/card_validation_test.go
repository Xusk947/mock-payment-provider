package services

import (
	"context"
	"database/sql"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	db "github.com/xusk947/mock-payment-provider/sqlc"
)

func TestValidateCardValid(t *testing.T) {
	svc := NewCardValidationService(nil)
	ctx := context.Background()

	err := svc.ValidateCard(ctx, "4111111111111111", "John Doe", "123", 12, 2027)
	assert.NoError(t, err)
}

func TestValidateCardInvalidNumber(t *testing.T) {
	svc := NewCardValidationService(nil)
	ctx := context.Background()

	err := svc.ValidateCard(ctx, "1234", "John Doe", "123", 12, 2027)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "invalid card number")
}

func TestValidateCardExpired(t *testing.T) {
	svc := NewCardValidationService(nil)
	ctx := context.Background()

	err := svc.ValidateCard(ctx, "4111111111111111", "John Doe", "123", 1, 2020)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "expired")
}

func TestValidateCardInvalidCVV(t *testing.T) {
	svc := NewCardValidationService(nil)
	ctx := context.Background()

	err := svc.ValidateCard(ctx, "4111111111111111", "John Doe", "12", 12, 2027)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "invalid CVV")
}

func TestValidateCardEmptyName(t *testing.T) {
	svc := NewCardValidationService(nil)
	ctx := context.Background()

	err := svc.ValidateCard(ctx, "4111111111111111", "", "123", 12, 2027)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "cardholder name is required")
}

func TestValidateCardUnsupportedType(t *testing.T) {
	svc := NewCardValidationService(nil)
	ctx := context.Background()

	// 7999999999999999 doesn't match any known prefix (7 is not mapped)
	err := svc.ValidateCard(ctx, "7999999999999999", "John Doe", "123", 12, 2027)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "unsupported card type")
}

func TestValidateCardInvalidExpiryMonth(t *testing.T) {
	svc := NewCardValidationService(nil)
	ctx := context.Background()

	err := svc.ValidateCard(ctx, "4111111111111111", "John Doe", "123", 0, 2027)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "invalid expiry month")

	err = svc.ValidateCard(ctx, "4111111111111111", "John Doe", "123", 13, 2027)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "invalid expiry month")
}

func TestValidateCardNonDigitCVV(t *testing.T) {
	svc := NewCardValidationService(nil)
	ctx := context.Background()

	err := svc.ValidateCard(ctx, "4111111111111111", "John Doe", "12a", 12, 2027)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "CVV must contain only digits")
}

func TestValidateCardNonDigitCardNumber(t *testing.T) {
	svc := NewCardValidationService(nil)
	ctx := context.Background()

	err := svc.ValidateCard(ctx, "4111-1111-1111-111a", "John Doe", "123", 12, 2027)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "card number must contain only digits")
}

type mockCardRepo struct{}

func (m *mockCardRepo) GetByCardNumber(ctx context.Context, cardNumber string) (*db.Card, error) {
	return nil, sql.ErrNoRows
}

func TestGetTestCardReturnsSuccessForUnknownCard(t *testing.T) {
	svc := NewCardValidationService(&mockCardRepo{})
	ctx := context.Background()

	scenario, err := svc.GetTestCard(ctx, "9999999999999999")
	require.NoError(t, err)
	assert.Equal(t, "success", scenario)
}
