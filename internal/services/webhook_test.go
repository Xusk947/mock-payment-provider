package services

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestShouldSendEventExactMatch(t *testing.T) {
	svc := NewWebhookService(nil, nil)
	assert.True(t, svc.shouldSendEvent("[\"charge.completed\"]", "charge.completed"))
}

func TestShouldSendEventWildcard(t *testing.T) {
	svc := NewWebhookService(nil, nil)
	assert.True(t, svc.shouldSendEvent("[\"*\"]", "any.event"))
}

func TestShouldSendEventNoMatch(t *testing.T) {
	svc := NewWebhookService(nil, nil)
	assert.False(t, svc.shouldSendEvent("[\"charge.completed\"]", "refund.completed"))
}

func TestShouldSendEventInvalidJSON(t *testing.T) {
	svc := NewWebhookService(nil, nil)
	// Invalid JSON should gracefully return false
	assert.False(t, svc.shouldSendEvent("not-json", "charge.completed"))
}

func TestShouldSendEventMultipleTypes(t *testing.T) {
	svc := NewWebhookService(nil, nil)
	assert.True(t, svc.shouldSendEvent("[\"charge.completed\", \"refund.completed\"]", "refund.completed"))
	assert.False(t, svc.shouldSendEvent("[\"charge.completed\", \"refund.completed\"]", "hold.created"))
}
