package services

import "errors"

// Sentinel errors used by the transaction service.
var (
	ErrThreeDSRequired              = errors.New("3D Secure required")
	ErrInvalidAPIKey                = errors.New("invalid API key")
	ErrCardValidationFailed         = errors.New("card validation failed")
	ErrTransactionNotFound            = errors.New("transaction not found")
	ErrTransactionNotPending        = errors.New("transaction is not pending")
	ErrTransactionCannotBeRejected  = errors.New("transaction cannot be rejected")
	ErrTransactionCannotBeRefunded  = errors.New("transaction cannot be refunded")
	ErrCannotRefundRefund           = errors.New("cannot refund a refund")
	ErrAlreadyFullyRefunded         = errors.New("transaction already fully refunded")
	ErrRefundExceedsAmount          = errors.New("refund amount exceeds remaining refundable amount")
	ErrDuplicateRefund              = errors.New("duplicate refund: same amount already refunded")
	ErrRefundAmountMustBePositive   = errors.New("refund amount must be greater than zero")
	ErrHoldNotFound                 = errors.New("hold not found")
	ErrNotAHold                     = errors.New("transaction is not a hold")
	ErrHoldCannotBeCaptured         = errors.New("hold cannot be captured")
	ErrInvalidInvoiceState          = errors.New("invalid invoice state")
	ErrInvoiceNotFound              = errors.New("invoice not found")
)
