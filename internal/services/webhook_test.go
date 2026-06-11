package services

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

// ========== shouldSendEvent tests ==========

func TestShouldSendEventExactMatch(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	assert.True(t, svc.shouldSendEvent("[\"charge.completed\"]", "charge.completed"))
}

func TestShouldSendEventWildcard(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	assert.True(t, svc.shouldSendEvent("[\"*\"]", "any.event"))
}

func TestShouldSendEventNoMatch(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	assert.False(t, svc.shouldSendEvent("[\"charge.completed\"]", "refund.completed"))
}

func TestShouldSendEventInvalidJSON(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	// Invalid JSON should gracefully return false
	assert.False(t, svc.shouldSendEvent("not-json", "charge.completed"))
}

func TestShouldSendEventMultipleTypes(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	assert.True(t, svc.shouldSendEvent("[\"charge.completed\", \"refund.completed\"]", "refund.completed"))
	assert.False(t, svc.shouldSendEvent("[\"charge.completed\", \"refund.completed\"]", "hold.created"))
}

func TestShouldSendEventEmptyString(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	assert.False(t, svc.shouldSendEvent("", "charge.completed"))
}

func TestShouldSendEventEmptyArray(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	assert.False(t, svc.shouldSendEvent("[]", "charge.completed"))
}

func TestShouldSendEventMalformedJSON(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	assert.False(t, svc.shouldSendEvent("{\"key\": \"value\"}", "charge.completed"))
	assert.False(t, svc.shouldSendEvent("[\"incomplete", "charge.completed"))
}

func TestShouldSendEventEventTypeEmpty(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	assert.False(t, svc.shouldSendEvent("[\"charge.completed\"]", ""))
}

// ========== generateSignature tests ==========

func TestGenerateSignatureWithPayload(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	sig := svc.generateSignature(`{"event":"test"}`, "secret123")
	assert.True(t, strings.HasPrefix(sig, "sha256="))
	assert.Equal(t, 71, len(sig)) // "sha256=" + 64 hex chars
}

func TestGenerateSignatureEmptyPayload(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	sig := svc.generateSignature("", "secret")
	assert.True(t, strings.HasPrefix(sig, "sha256="))
	assert.Equal(t, 71, len(sig))
}

func TestGenerateSignatureEmptySecret(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	sig := svc.generateSignature(`{"event":"test"}`, "")
	assert.True(t, strings.HasPrefix(sig, "sha256="))
	assert.Equal(t, 71, len(sig))
}

func TestGenerateSignatureDeterministic(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	sig1 := svc.generateSignature(`{"event":"test"}`, "secret123")
	sig2 := svc.generateSignature(`{"event":"test"}`, "secret123")
	assert.Equal(t, sig1, sig2)
}

func TestGenerateSignatureDifferentSecrets(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	sig1 := svc.generateSignature(`{"event":"test"}`, "secret1")
	sig2 := svc.generateSignature(`{"event":"test"}`, "secret2")
	assert.NotEqual(t, sig1, sig2)
}

// ========== sendDefaultWebhook / sendWebhookRequest tests ==========

func TestSendDefaultWebhookSuccess(t *testing.T) {
	called := false
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		assert.Equal(t, "POST", r.Method)
		assert.Equal(t, "application/json", r.Header.Get("Content-Type"))
		assert.Equal(t, "transaction", r.Header.Get("X-Webhook-Event"))

		body, _ := io.ReadAll(r.Body)
		assert.Equal(t, `{"test":"payload"}`, string(body))

		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	svc := NewWebhookService(nil, nil, server.URL)
	err := svc.sendDefaultWebhook(context.Background(), "charge.completed", `{"test":"payload"}`)
	assert.NoError(t, err)
	assert.True(t, called, "webhook server should have been called")
}

func TestSendDefaultWebhookFailureAfterRetries(t *testing.T) {
	callCount := 0
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		callCount++
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer server.Close()

	svc := NewWebhookService(nil, nil, server.URL)
	// Override client timeout to speed up retries
	svc.client = &http.Client{Timeout: 1 * time.Second}

	err := svc.sendDefaultWebhook(context.Background(), "charge.failed", `{}`)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "failed to send default webhook after 3 attempts")
	assert.Equal(t, 3, callCount)
}

func TestSendDefaultWebhookWithSignatureHeader(t *testing.T) {
	var receivedSignature string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		receivedSignature = r.Header.Get("X-Webhook-Signature")
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	svc := NewWebhookService(nil, nil, server.URL)

	// sendDefaultWebhook always uses empty secret, so no signature should be present
	err := svc.sendDefaultWebhook(context.Background(), "charge.completed", `{}`)
	assert.NoError(t, err)
	assert.Empty(t, receivedSignature, "default webhook should not include signature")
}

func TestSendWebhookRequestWithSignature(t *testing.T) {
	var receivedSignature string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		receivedSignature = r.Header.Get("X-Webhook-Signature")
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	svc := NewWebhookService(nil, nil, "")
	err := svc.sendWebhookRequest(context.Background(), server.URL, "my-secret", `{"event":"test"}`)
	assert.NoError(t, err)
	assert.NotEmpty(t, receivedSignature)
	assert.True(t, strings.HasPrefix(receivedSignature, "sha256="))
}

func TestSendWebhookRequestInvalidURL(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	err := svc.sendWebhookRequest(context.Background(), "://invalid-url", "", `{}`)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "failed to create request")
}

func TestSendWebhookRequestNon2xxResponse(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error":"bad request"}`))
	}))
	defer server.Close()

	svc := NewWebhookService(nil, nil, "")
	err := svc.sendWebhookRequest(context.Background(), server.URL, "", `{}`)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "webhook returned status 400")
}

func TestSendDefaultWebhookEmptyDefaultURL(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	// sendDefaultWebhook should fail immediately with empty URL
	err := svc.sendDefaultWebhook(context.Background(), "charge.completed", `{}`)
	assert.Error(t, err)
}

// ========== NewWebhookService constructor tests ==========

func TestNewWebhookServiceStoresDefaultWebhookURL(t *testing.T) {
	svc := NewWebhookService(nil, nil, "https://default.example.com/webhook")
	assert.Equal(t, "https://default.example.com/webhook", svc.defaultWebhookURL)
}

func TestNewWebhookServiceClientTimeout(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	assert.Equal(t, 30*time.Second, svc.client.Timeout)
}

// ========== Event type boundary tests ==========

func TestShouldSendEventPartialMatch(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	// "charge" is not the same as "charge.completed"
	assert.False(t, svc.shouldSendEvent("[\"charge.completed\"]", "charge"))
}

func TestShouldSendEventCaseSensitive(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	assert.False(t, svc.shouldSendEvent("[\"charge.completed\"]", "Charge.Completed"))
}

func TestShouldSendEventUnicode(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	assert.True(t, svc.shouldSendEvent("[\"платеж.завершен\"]", "платеж.завершен"))
}

func TestShouldSendEventNestedWildcard(t *testing.T) {
	svc := NewWebhookService(nil, nil, "")
	// Only exact "*" matches, not partial wildcards
	assert.False(t, svc.shouldSendEvent("[\"charge.*\"]", "charge.completed"))
}

// ========== Payload serialization boundary tests ==========

func TestPayloadSerializationTypes(t *testing.T) {
	// String payload
	payload := "simple string"
	_, err := json.Marshal(payload)
	assert.NoError(t, err)

	// Map payload
	mapPayload := map[string]interface{}{"key": "value", "num": 42}
	_, err = json.Marshal(mapPayload)
	assert.NoError(t, err)

	// Struct payload
	type Event struct {
		Type string `json:"type"`
		ID   int    `json:"id"`
	}
	structPayload := Event{Type: "charge.completed", ID: 1}
	_, err = json.Marshal(structPayload)
	assert.NoError(t, err)

	// Empty struct
	_, err = json.Marshal(struct{}{})
	assert.NoError(t, err)

	// Channel (unserializable) — documents the marshal error path
	badPayload := make(chan int)
	_, err = json.Marshal(badPayload)
	assert.Error(t, err)
}
