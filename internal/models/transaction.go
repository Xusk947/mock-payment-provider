package models

import (
	"time"
)

// Transaction represents a payment transaction
type Transaction struct {
	ID                   int        `json:"id"`
	Amount               float64    `json:"amount"`
	Currency             string     `json:"currency"`
	Status               string     `json:"status"`
	PaymentMethod        string     `json:"payment_method"`
	Metadata             string     `json:"metadata"`
	MerchantID           *int       `json:"merchant_id,omitempty"`
	CardID               *int       `json:"card_id,omitempty"`
	TransactionType      string     `json:"transaction_type"` // charge, hold, capture, refund
	ParentTransactionID  *int       `json:"parent_transaction_id,omitempty"`
	CardNumberLast4      *string    `json:"card_number_last4,omitempty"`
	CardType             *string    `json:"card_type,omitempty"`
	AuthorizationCode    *string    `json:"authorization_code,omitempty"`
	ErrorCode            *string    `json:"error_code,omitempty"`
	ErrorMessage         *string    `json:"error_message,omitempty"`
	ThreeDSRequired      bool       `json:"three_ds_required"`
	ThreeDSAuthenticated bool       `json:"three_ds_authenticated"`
	ThreeDSTransactionID *string    `json:"three_ds_transaction_id,omitempty"`
	AmountRefunded       float64    `json:"amount_refunded"`
	AmountCaptured       float64    `json:"amount_captured"`
	ExpiresAt            *time.Time `json:"expires_at,omitempty"`
	CreatedAt            time.Time  `json:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at"`
}

// TransactionStatus represents the status of a transaction
type TransactionStatus string

const (
	StatusPending    TransactionStatus = "pending"
	StatusCompleted  TransactionStatus = "completed"
	StatusFailed     TransactionStatus = "failed"
	StatusRefunded   TransactionStatus = "refunded"
	StatusAuthorized TransactionStatus = "authorized" // for holds
	StatusCaptured   TransactionStatus = "captured"   // for captured holds
)

// TransactionType represents the type of transaction
type TransactionType string

const (
	TypeCharge  TransactionType = "charge"
	TypeHold    TransactionType = "hold"
	TypeCapture TransactionType = "capture"
	TypeRefund  TransactionType = "refund"
)

// Merchant represents a payment merchant
type Merchant struct {
	ID         int       `json:"id"`
	Name       string    `json:"name"`
	APIKey     string    `json:"api_key"`
	Email      string    `json:"email"`
	Active     bool      `json:"active"`
	WebhookURL *string   `json:"webhook_url,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// Card represents a test credit card
type Card struct {
	ID               int       `json:"id"`
	CardNumber       string    `json:"card_number"`
	CardholderName   string    `json:"cardholder_name"`
	ExpiryMonth      int       `json:"expiry_month"`
	ExpiryYear       int       `json:"expiry_year"`
	CVV              string    `json:"cvv"`
	CardType         string    `json:"card_type"`         // visa, mastercard, amex
	ResponseScenario string    `json:"response_scenario"` // success, decline, insufficient_funds, etc.
	Require3DS       bool      `json:"require_3ds"`
	Description      *string   `json:"description,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
}

// Webhook represents a webhook configuration
type Webhook struct {
	ID             int       `json:"id"`
	MerchantID     int       `json:"merchant_id"`
	URL            string    `json:"url"`
	EventTypes     string    `json:"event_types"` // JSON array of event types
	Secret         *string   `json:"secret,omitempty"`
	Active         bool      `json:"active"`
	RetryAttempts  int       `json:"retry_attempts"`
	TimeoutSeconds int       `json:"timeout_seconds"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// WebhookLog represents a webhook delivery log
type WebhookLog struct {
	ID            int        `json:"id"`
	WebhookID     int        `json:"webhook_id"`
	TransactionID *int       `json:"transaction_id,omitempty"`
	EventType     string     `json:"event_type"`
	Payload       string     `json:"payload"`
	ResponseCode  *int       `json:"response_code,omitempty"`
	ResponseBody  *string    `json:"response_body,omitempty"`
	Status        string     `json:"status"` // pending, success, failed
	AttemptNumber int        `json:"attempt_number"`
	DeliveredAt   *time.Time `json:"delivered_at,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
}

// ErrorScenario represents an error scenario configuration
type ErrorScenario struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	ErrorType    string    `json:"error_type"`
	ErrorCode    string    `json:"error_code"`
	ErrorMessage string    `json:"error_message"`
	Probability  float64   `json:"probability"` // 0.00 to 100.00
	Active       bool      `json:"active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
