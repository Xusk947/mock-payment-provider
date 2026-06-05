package models

// ErrorResponse represents an API error response
type ErrorResponse struct {
	Error string `json:"error"`
}

// DashboardResponse represents admin dashboard statistics
type DashboardResponse struct {
	TotalTransactions      int     `json:"total_transactions"`
	SuccessfulTransactions int     `json:"successful_transactions"`
	TotalAmount            float64 `json:"total_amount"`
	FailedTransactions     int     `json:"failed_transactions"`
	ActiveMerchants        int     `json:"active_merchants"`
	ActiveCards            int     `json:"active_cards"`
	ActiveScenarios        int     `json:"active_scenarios"`
}

// WebhookRequest represents a webhook create/update request
type WebhookRequest struct {
	URL    string   `json:"url"`
	Events []string `json:"events"`
	Active bool     `json:"active"`
}

// InvoiceRequest represents an invoice creation request
type InvoiceRequest struct {
	Amount   float64 `json:"amount"`
	Currency string  `json:"currency"`
	Metadata string  `json:"metadata,omitempty"`
}

// PayInvoiceRequest represents a payment request for an existing invoice
type PayInvoiceRequest struct {
	CardNumber           string `json:"card_number"`
	CardholderName       string `json:"cardholder_name"`
	CVV                  string `json:"cvv"`
	ExpiryMonth          int    `json:"expiry_month"`
	ExpiryYear           int    `json:"expiry_year"`
	CardType             string `json:"card_type"`
	ThreeDSAuthenticated bool   `json:"three_ds_authenticated"`
	Scenario             string `json:"scenario,omitempty"`
}

// ThreeDSChallengeRequest represents a 3DS challenge generation request
type ThreeDSChallengeRequest struct {
	CardNumber string `json:"card_number"`
	MerchantID int    `json:"merchant_id"`
}

// ThreeDSChallengeResponse represents a 3DS challenge response
type ThreeDSChallengeResponse struct {
	TransactionID int    `json:"transaction_id"`
	ChallengeURL  string `json:"challenge_url"`
}

// ThreeDSAuthenticateResponse represents a 3DS authentication completion response
type ThreeDSAuthenticateResponse struct {
	Success     bool        `json:"success"`
	Transaction Transaction `json:"transaction"`
}

// ThreeDSAuthenticateRequest represents a 3DS authentication completion request
type ThreeDSAuthenticateRequest struct {
	Authenticated bool `json:"authenticated"`
}

// CaptureTransactionRequest represents a capture by transaction ID request
type CaptureTransactionRequest struct {
	Amount float64 `json:"amount"`
}

// RefundTransactionRequest represents a refund by transaction ID request
type RefundTransactionRequest struct {
	Amount float64 `json:"amount"`
}

// ChargeRequest represents a charge/hold request.
type ChargeRequest struct {
	APIKey               string  `json:"api_key"`
	Amount               float64 `json:"amount"`
	Currency             string  `json:"currency"`
	CardNumber           string  `json:"card_number"`
	CardholderName       string  `json:"cardholder_name"`
	CVV                  string  `json:"cvv"`
	ExpiryMonth          int     `json:"expiry_month"`
	ExpiryYear           int     `json:"expiry_year"`
	CardType             string  `json:"card_type"`
	ThreeDSAuthenticated bool    `json:"three_ds_authenticated"`
	Scenario             string  `json:"scenario,omitempty"`
}

// CaptureRequest represents a capture request.
type CaptureRequest struct {
	APIKey string  `json:"api_key"`
	HoldID int     `json:"hold_id"`
	Amount float64 `json:"amount"`
}

// RefundRequest represents a refund request.
type RefundRequest struct {
	APIKey        string  `json:"api_key"`
	TransactionID int     `json:"transaction_id"`
	Amount        float64 `json:"amount"`
}

// ThreeDSRequiredResponse represents a response when 3DS is required
type ThreeDSRequiredResponse struct {
	Error       string      `json:"error"`
	Transaction Transaction `json:"transaction"`
}
