package services

import (
	"strings"

	"github.com/google/uuid"
)

// last4 returns the last four digits of a card number.
// If the number is shorter than four digits the full number is returned.
func last4(cardNumber string) string {
	if len(cardNumber) < 4 {
		return cardNumber
	}
	return cardNumber[len(cardNumber)-4:]
}

// authCode generates a short uppercase authorization code.
func authCode() string {
	return strings.ToUpper(uuid.New().String()[:8])
}
