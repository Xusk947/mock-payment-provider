package models

import (
	"database/sql"
	"time"

	db "github.com/xusk947/mock-payment-provider/sqlc"
)

// Helper functions for sql.Null* mapping
func nullStringPtr(ns sql.NullString) *string {
	if ns.Valid {
		s := ns.String
		return &s
	}
	return nil
}

func nullInt64Ptr(ni sql.NullInt64) *int {
	if ni.Valid {
		v := int(ni.Int64)
		return &v
	}
	return nil
}

func nullBoolValue(nb sql.NullBool) bool {
	if nb.Valid {
		return nb.Bool
	}
	return false
}

func nullFloat64Value(nf sql.NullFloat64) float64 {
	if nf.Valid {
		return nf.Float64
	}
	return 0
}

func nullTimePtr(nt sql.NullTime) *time.Time {
	if nt.Valid {
		t := nt.Time
		return &t
	}
	return nil
}

func nullTimeValue(nt sql.NullTime) time.Time {
	if nt.Valid {
		return nt.Time
	}
	return time.Time{}
}

// NewInvoiceResponse builds a typed InvoiceResponse from a db.Transaction and a payment URL.
func NewInvoiceResponse(dbTx *db.Transaction, paymentURL string) *InvoiceResponse {
	return &InvoiceResponse{
		Transaction: MapTransaction(dbTx),
		PaymentURL:  paymentURL,
	}
}

// MapTransaction converts a db.Transaction to models.Transaction
func MapTransaction(dbTx *db.Transaction) *Transaction {
	if dbTx == nil {
		return nil
	}
	return &Transaction{
		ID:                   int(dbTx.ID),
		Amount:               dbTx.Amount,
		Currency:             dbTx.Currency,
		Status:               dbTx.Status,
		PaymentMethod:        dbTx.PaymentMethod,
		Metadata:             dbTx.Metadata.String,
		MerchantID:           nullInt64Ptr(dbTx.MerchantID),
		CardID:               nullInt64Ptr(dbTx.CardID),
		TransactionType:      dbTx.TransactionType.String,
		ParentTransactionID:  nullInt64Ptr(dbTx.ParentTransactionID),
		CardNumberLast4:      nullStringPtr(dbTx.CardNumberLast4),
		CardType:             nullStringPtr(dbTx.CardType),
		AuthorizationCode:    nullStringPtr(dbTx.AuthorizationCode),
		ErrorCode:            nullStringPtr(dbTx.ErrorCode),
		ErrorMessage:         nullStringPtr(dbTx.ErrorMessage),
		ThreeDSRequired:      nullBoolValue(dbTx.ThreeDsRequired),
		ThreeDSAuthenticated: nullBoolValue(dbTx.ThreeDsAuthenticated),
		ThreeDSTransactionID: nullStringPtr(dbTx.ThreeDsTransactionID),
		AmountRefunded:       nullFloat64Value(dbTx.AmountRefunded),
		AmountCaptured:       nullFloat64Value(dbTx.AmountCaptured),
		ExpiresAt:            nullTimePtr(dbTx.ExpiresAt),
		CreatedAt:            nullTimeValue(dbTx.CreatedAt),
		UpdatedAt:            nullTimeValue(dbTx.UpdatedAt),
	}
}

// MapMerchant converts a db.Merchant to models.Merchant
func MapMerchant(dbM *db.Merchant) *Merchant {
	if dbM == nil {
		return nil
	}
	return &Merchant{
		ID:         int(dbM.ID),
		Name:       dbM.Name,
		APIKey:     dbM.ApiKey,
		Email:      dbM.Email,
		Active:     nullBoolValue(dbM.Active),
		WebhookURL: nullStringPtr(dbM.WebhookUrl),
		CreatedAt:  nullTimeValue(dbM.CreatedAt),
		UpdatedAt:  nullTimeValue(dbM.UpdatedAt),
	}
}

// MapCard converts a db.Card to models.Card
func MapCard(dbC *db.Card) *Card {
	if dbC == nil {
		return nil
	}
	return &Card{
		ID:               int(dbC.ID),
		CardNumber:       dbC.CardNumber,
		CardholderName:   dbC.CardholderName,
		ExpiryMonth:      int(dbC.ExpiryMonth),
		ExpiryYear:       int(dbC.ExpiryYear),
		CVV:              dbC.Cvv,
		CardType:         dbC.CardType,
		ResponseScenario: dbC.ResponseScenario.String,
		Require3DS:       nullBoolValue(dbC.Require3ds),
		Description:      nullStringPtr(dbC.Description),
		CreatedAt:        nullTimeValue(dbC.CreatedAt),
	}
}

// MapWebhook converts a db.Webhook to models.Webhook
func MapWebhook(dbW *db.Webhook) *Webhook {
	if dbW == nil {
		return nil
	}
	return &Webhook{
		ID:             int(dbW.ID),
		MerchantID:     int(dbW.MerchantID),
		URL:            dbW.Url,
		EventTypes:     dbW.EventTypes,
		Secret:         nullStringPtr(dbW.Secret),
		Active:         nullBoolValue(dbW.Active),
		RetryAttempts:  int(dbW.RetryAttempts.Int64),
		TimeoutSeconds: int(dbW.TimeoutSeconds.Int64),
		CreatedAt:      nullTimeValue(dbW.CreatedAt),
		UpdatedAt:      nullTimeValue(dbW.UpdatedAt),
	}
}

// MapErrorScenario converts a db.ErrorScenario to models.ErrorScenario
func MapErrorScenario(dbE *db.ErrorScenario) *ErrorScenario {
	if dbE == nil {
		return nil
	}
	return &ErrorScenario{
		ID:           int(dbE.ID),
		Name:         dbE.Name,
		ErrorType:    dbE.ErrorType,
		ErrorCode:    dbE.ErrorCode,
		ErrorMessage: dbE.ErrorMessage,
		Probability:  nullFloat64Value(dbE.Probability),
		Active:       nullBoolValue(dbE.Active),
		CreatedAt:    nullTimeValue(dbE.CreatedAt),
		UpdatedAt:    nullTimeValue(dbE.UpdatedAt),
	}
}

// Slice mappers
func MapTransactions(dbTxs []db.Transaction) []Transaction {
	out := make([]Transaction, len(dbTxs))
	for i := range dbTxs {
		if m := MapTransaction(&dbTxs[i]); m != nil {
			out[i] = *m
		}
	}
	return out
}

func MapMerchants(dbMs []db.Merchant) []Merchant {
	out := make([]Merchant, len(dbMs))
	for i := range dbMs {
		if m := MapMerchant(&dbMs[i]); m != nil {
			out[i] = *m
		}
	}
	return out
}

func MapCards(dbCs []db.Card) []Card {
	out := make([]Card, len(dbCs))
	for i := range dbCs {
		if m := MapCard(&dbCs[i]); m != nil {
			out[i] = *m
		}
	}
	return out
}

func MapWebhooks(dbWs []db.Webhook) []Webhook {
	out := make([]Webhook, len(dbWs))
	for i := range dbWs {
		if m := MapWebhook(&dbWs[i]); m != nil {
			out[i] = *m
		}
	}
	return out
}

func MapErrorScenarios(dbEs []db.ErrorScenario) []ErrorScenario {
	out := make([]ErrorScenario, len(dbEs))
	for i := range dbEs {
		if m := MapErrorScenario(&dbEs[i]); m != nil {
			out[i] = *m
		}
	}
	return out
}
