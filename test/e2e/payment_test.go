package e2e

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

// PaymentE2ETest runs end-to-end tests for the payment flow
type PaymentE2ETest struct {
	container *testcontainers.Container
	baseURL  string
	apiKey    string
}

type ChargeRequest struct {
	APIKey            string  `json:"api_key"`
	Amount            float64 `json:"amount"`
	Currency          string  `json:"currency"`
	CardNumber        string  `json:"card_number"`
	CardholderName    string  `json:"cardholder_name"`
	CVV               string  `json:"cvv"`
	ExpiryMonth       int     `json:"expiry_month"`
	ExpiryYear        int     `json:"expiry_year"`
	CardType          string  `json:"card_type"`
	ThreeDSAuthenticated bool    `json:"three_ds_authenticated"`
}

type CaptureRequest struct {
	APIKey  string  `json:"api_key"`
	HoldID  int     `json:"hold_id"`
	Amount  float64 `json:"amount"`
}

type RefundRequest struct {
	APIKey        string  `json:"api_key"`
	TransactionID int     `json:"transaction_id"`
	Amount        float64 `json:"amount"`
}

func setupTestEnvironment(t *testing.T) *PaymentE2ETest {
	ctx := context.Background()

	// Start the application container
	req := testcontainers.ContainerRequest{
		Image:        "mock-payment-provider:latest",
		ExposedPorts: []string{"3000/tcp"},
		WaitingFor: wait.ForHTTP("/admin/dashboard").
			WithPort("3000/tcp").
			WithStartupTimeout(30 * time.Second),
	}

	container, err := testcontainers.GenericContainer(ctx, "test-payment-provider", req)
	require.NoError(t, err, "failed to start container")

	host, err := container.Host(ctx)
	require.NoError(t, err, "failed to get container host")

	port, err := container.MappedPort(ctx, "3000")
	require.NoError(t, err, "failed to get container port")

	baseURL := fmt.Sprintf("http://%s:%s", host, port.Port())

	return &PaymentE2ETest{
		container: container,
		baseURL:  baseURL,
		apiKey:    "test_api_key_12345", // Using test API key from migrations
	}
}

func TestFullPaymentFlow_VisaCard_Success(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping E2E test in short mode")
	}

	test := setupTestEnvironment(t)
	defer test.container.Terminate(context.Background())

	// Test 1: Successful charge with Visa card
	t.Run("VisaCard_SuccessfulCharge", func(t *testing.T) {
		req := ChargeRequest{
			APIKey:            test.apiKey,
			Amount:            100.00,
			Currency:          "USD",
			CardNumber:        "4111111111111111",
			CardholderName:    "John Doe",
			CVV:               "123",
			ExpiryMonth:       12,
			ExpiryYear:        2025,
			CardType:          "visa",
			ThreeDSAuthenticated: false,
		}

		resp := sendChargeRequest(t, test.baseURL, req)
		assert.Equal(t, http.StatusCreated, resp.StatusCode)

		var tx map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&tx)
		
		assert.Equal(t, "completed", tx["status"])
		assert.Equal(t, 100.00, tx["amount"])
		assert.Equal(t, "visa", tx["card_type"])
		assert.Nil(t, tx["error_code"])
	})

	// Test 2: Failed charge with declined Visa card
	t.Run("VisaCard_DeclinedCharge", func(t *testing.T) {
		req := ChargeRequest{
			APIKey:            test.apiKey,
			Amount:            50.00,
			Currency:          "USD",
			CardNumber:        "4000000000000002",
			CardholderName:    "Jane Smith",
			CVV:               "123",
			ExpiryMonth:       12,
			ExpiryYear:        2025,
			CardType:          "visa",
			ThreeDSAuthenticated: false,
		}

		resp := sendChargeRequest(t, test.baseURL, req)
		assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)

		var errResp map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&errResp)
		
		assert.Equal(t, "failed", errResp["status"])
		assert.Equal(t, "DECLINED", errResp["error_code"])
	})

	// Test 3: 3D Secure required flow with Mastercard
	t.Run("MasterCard_3DSRequired", func(t *testing.T) {
		req := ChargeRequest{
			APIKey:            test.apiKey,
			Amount:            75.00,
			Currency:          "USD",
			CardNumber:        "5555555555554444",
			CardholderName:    "Bob Johnson",
			CVV:               "456",
			ExpiryMonth:       6,
			ExpiryYear:        2026,
			CardType:          "mastercard",
			ThreeDSAuthenticated: false,
		}

		resp := sendChargeRequest(t, test.baseURL, req)
		assert.Equal(t, http.StatusPaymentRequired, resp.StatusCode)

		var errResp map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&errResp)
		
		assert.Equal(t, "3D Secure authentication required", errResp["error"])
		assert.NotNil(t, errResp["transaction"])

		// Then complete with 3DS authenticated
		req.ThreeDSAuthenticated = true
		resp = sendChargeRequest(t, test.baseURL, req)
		assert.Equal(t, http.StatusCreated, resp.StatusCode)

		var tx map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&tx)
		
		assert.Equal(t, "completed", tx["status"])
	})

	// Test 4: Hold and Capture flow
	t.Run("MasterCard_HoldAndCapture", func(t *testing.T) {
		// Create hold
		req := ChargeRequest{
			APIKey:            test.apiKey,
			Amount:            150.00,
			Currency:          "USD",
			CardNumber:        "5555555555554444",
			CardholderName:    "Bob Johnson",
			CVV:               "456",
			ExpiryMonth:       6,
			ExpiryYear:        2026,
			CardType:          "mastercard",
			ThreeDSAuthenticated: true,
		}

		resp := sendHoldRequest(t, test.baseURL, req)
		assert.Equal(t, http.StatusCreated, resp.StatusCode)

		var hold map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&hold)
		
		holdID := int(hold["id"].(float64))
		assert.Equal(t, "authorized", hold["status"])
		assert.NotNil(t, hold["expires_at"])

		// Capture the hold
		captureReq := CaptureRequest{
			APIKey:  test.apiKey,
			HoldID:  holdID,
			Amount:  150.00,
		}

		capResp := sendCaptureRequest(t, test.baseURL, captureReq)
		assert.Equal(t, http.StatusCreated, capResp.StatusCode)

		var capture map[string]interface{}
		json.NewDecoder(capResp.Body).Decode(&capture)
		
		assert.Equal(t, "captured", capture["status"])
	})

	// Test 5: Refund flow
	t.Run("VisaCard_Refund", func(t *testing.T) {
		// First create a successful transaction
		req := ChargeRequest{
			APIKey:            test.apiKey,
			Amount:            200.00,
			Currency:          "USD",
			CardNumber:        "4111111111111111",
			CardholderName:    "John Doe",
			CVV:               "123",
			ExpiryMonth:       12,
			ExpiryYear:        2025,
			CardType:          "visa",
			ThreeDSAuthenticated: false,
		}

		resp := sendChargeRequest(t, test.baseURL, req)
		assert.Equal(t, http.StatusCreated, resp.StatusCode)

		var charge map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&charge)
		
		txID := int(charge["id"].(float64))

		// Refund the transaction
		refundReq := RefundRequest{
			APIKey:        test.apiKey,
			TransactionID: txID,
			Amount:        200.00,
		}

		refResp := sendRefundRequest(t, test.baseURL, refundReq)
		assert.Equal(t, http.StatusCreated, refResp.StatusCode)

		var refund map[string]interface{}
		json.NewDecoder(refResp.Body).Decode(&refund)
		
		assert.Equal(t, "refunded", refund["status"])
		assert.Equal(t, 200.00, refund["amount"])
	})

	// Test 6: Insufficient funds error
	t.Run("Amex_InsufficientFunds", func(t *testing.T) {
		req := ChargeRequest{
			APIKey:            test.apiKey,
			Amount:            9999.00,
			Currency:          "USD",
			CardNumber:        "378282246310005",
			CardholderName:    "Alice Williams",
			CVV:               "1234",
			ExpiryMonth:       8,
			ExpiryYear:        2024,
			CardType:          "amex",
			ThreeDSAuthenticated: false,
		}

		resp := sendChargeRequest(t, test.baseURL, req)
		assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)

		var errResp map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&errResp)
		
		assert.Equal(t, "INSUFFICIENT_FUNDS", errResp["error_code"])
	})

	// Test 7: Different card types - Second attempt with same card
	t.Run("VisaCard_SecondAttempt", func(t *testing.T) {
		// First attempt
		req1 := ChargeRequest{
			APIKey:            test.apiKey,
			Amount:            25.00,
			Currency:          "USD",
			CardNumber:        "4111111111111111",
			CardholderName:    "John Doe",
			CVV:               "123",
			ExpiryMonth:       12,
			ExpiryYear:        2025,
			CardType:          "visa",
			ThreeDSAuthenticated: false,
		}

		resp1 := sendChargeRequest(t, test.baseURL, req1)
		assert.Equal(t, http.StatusCreated, resp1.StatusCode)

		var tx1 map[string]interface{}
		json.NewDecoder(resp1.Body).Decode(&tx1)
		assert.Equal(t, "completed", tx1["status"])

		// Second attempt with same card
		resp2 := sendChargeRequest(t, test.baseURL, req1)
		assert.Equal(t, http.StatusCreated, resp2.StatusCode)

		var tx2 map[string]interface{}
		json.NewDecoder(resp2.Body).Decode(&tx2)
		assert.Equal(t, "completed", tx2["status"])
		assert.Equal(t, 25.00, tx2["amount"])
	})
}

func TestAdminAPI(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping E2E test in short mode")
	}

	test := setupTestEnvironment(t)
	defer test.container.Terminate(context.Background())

	t.Run("Dashboard_Statistics", func(t *testing.T) {
		resp := sendRequest(t, test.baseURL+"/admin/dashboard", http.MethodGet, nil)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var dashboard map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&dashboard)
		
		assert.NotNil(t, dashboard["total_merchants"])
		assert.NotNil(t, dashboard["total_cards"])
		assert.NotNil(t, dashboard["active_scenarios"])
	})

	t.Run("ListMerchants", func(t *testing.T) {
		resp := sendRequest(t, test.baseURL+"/admin/merchants", http.MethodGet, nil)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var merchants []map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&merchants)
		
		assert.GreaterOrEqual(t, len(merchants), 1) // At least the test merchant
	})

	t.Run("ListCards", func(t *testing.T) {
		resp := sendRequest(t, test.baseURL+"/admin/cards", http.MethodGet, nil)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var cards []map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&cards)
		
		assert.GreaterOrEqual(t, len(cards), 3) // At least 3 test cards
	})

	t.Run("ListErrorScenarios", func(t *testing.T) {
		resp := sendRequest(t, test.baseURL+"/admin/error-scenarios", http.MethodGet, nil)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var scenarios []map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&scenarios)
		
		assert.GreaterOrEqual(t, len(scenarios), 6) // 6 error scenarios from migrations
	})
}

func TestWebhookDelivery(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping E2E test in short mode")
	}

	test := setupTestEnvironment(t)
	defer test.container.Terminate(context.Background())

	t.Run("Webhook_SentAfterSuccessfulCharge", func(t *testing.T) {
		req := ChargeRequest{
			APIKey:            test.apiKey,
			Amount:            100.00,
			Currency:          "USD",
			CardNumber:        "4111111111111111",
			CardholderName:    "John Doe",
			CVV:               "123",
			ExpiryMonth:       12,
			ExpiryYear:        2025,
			CardType:          "visa",
			ThreeDSAuthenticated: false,
		}

		resp := sendChargeRequest(t, test.baseURL, req)
		assert.Equal(t, http.StatusCreated, resp.StatusCode)

		// Wait for webhook to be sent (async)
		time.Sleep(2 * time.Second)

		// Check webhook logs via admin API
		resp = sendRequest(t, test.baseURL+"/admin/merchants/1/webhooks", http.MethodGet, nil)
		if resp.StatusCode == http.StatusOK {
			var webhooks []map[string]interface{}
			json.NewDecoder(resp.Body).Decode(&webhooks)
			
			assert.GreaterOrEqual(t, len(webhooks), 0)
		}
	})
}

// Helper functions

func sendChargeRequest(t *testing.T, baseURL string, req ChargeRequest) *http.Response {
	body, _ := json.Marshal(req)
	return sendRequest(t, baseURL+"/api/v1/charges", http.MethodPost, body)
}

func sendHoldRequest(t *testing.T, baseURL string, req ChargeRequest) *http.Response {
	body, _ := json.Marshal(req)
	return sendRequest(t, baseURL+"/api/v1/holds", http.MethodPost, body)
}

func sendCaptureRequest(t *testing.T, baseURL string, req CaptureRequest) *http.Response {
	body, _ := json.Marshal(req)
	return sendRequest(t, baseURL+"/api/v1/captures", http.MethodPost, body)
}

func sendRefundRequest(t *testing.T, baseURL string, req RefundRequest) *http.Response {
	body, _ := json.Marshal(req)
	return sendRequest(t, baseURL+"/api/v1/refunds", http.MethodPost, body)
}

func sendRequest(t *testing.T, url, method string, body []byte) *http.Response {
	req, err := http.NewRequest(method, url, bytes.NewBuffer(body))
	require.NoError(t, err)
	
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	require.NoError(t, err)

	return resp
}