package services

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCheckRequiredWhenDisabled(t *testing.T) {
	svc := NewThreeDSService(false)
	ctx := context.Background()

	assert.False(t, svc.CheckRequired(ctx, true))
	assert.False(t, svc.CheckRequired(ctx, false))
}

func TestCheckRequiredWhenEnabled(t *testing.T) {
	svc := NewThreeDSService(true)
	ctx := context.Background()

	assert.True(t, svc.CheckRequired(ctx, true))
	assert.False(t, svc.CheckRequired(ctx, false))
}

func TestGenerateChallengeWhenDisabled(t *testing.T) {
	svc := NewThreeDSService(false)
	ctx := context.Background()

	_, _, err := svc.GenerateChallenge(ctx, 100, "USD", "4111111111111111")
	require.Error(t, err)
	assert.Contains(t, err.Error(), "not enabled")
}

func TestGenerateChallengeWhenEnabled(t *testing.T) {
	svc := NewThreeDSService(true)
	ctx := context.Background()

	transactionID, challengeURL, err := svc.GenerateChallenge(ctx, 100, "USD", "4111111111111111")
	require.NoError(t, err)
	assert.NotEmpty(t, transactionID)
	assert.NotEmpty(t, challengeURL)
	assert.Contains(t, challengeURL, "https://3ds.example.com/challenge")
}

func TestVerifyChallengeWhenDisabled(t *testing.T) {
	svc := NewThreeDSService(false)
	ctx := context.Background()

	verified, err := svc.VerifyChallenge(ctx, "tx-123", "response")
	require.NoError(t, err)
	assert.True(t, verified)
}

func TestVerifyChallengeWhenEnabled(t *testing.T) {
	svc := NewThreeDSService(true)
	ctx := context.Background()

	verified, err := svc.VerifyChallenge(ctx, "tx-123", "some-response")
	require.NoError(t, err)
	assert.True(t, verified)
}

func TestVerifyChallengeEmptyResponse(t *testing.T) {
	svc := NewThreeDSService(true)
	ctx := context.Background()

	verified, err := svc.VerifyChallenge(ctx, "tx-123", "")
	require.Error(t, err)
	assert.False(t, verified)
	assert.Contains(t, err.Error(), "challenge response is required")
}

func TestCancelChallengeWhenDisabled(t *testing.T) {
	svc := NewThreeDSService(false)
	ctx := context.Background()

	err := svc.CancelChallenge(ctx, "tx-123")
	require.NoError(t, err)
}

func TestCancelChallengeWhenEnabled(t *testing.T) {
	svc := NewThreeDSService(true)
	ctx := context.Background()

	err := svc.CancelChallenge(ctx, "tx-123")
	require.NoError(t, err)
}
