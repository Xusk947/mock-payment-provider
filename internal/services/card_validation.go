package services

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	db "github.com/xusk947/mock-payment-provider/sqlc"
)

// CardValidationService handles card validation logic
type CardValidationService struct {
	cardRepo interface {
		GetByCardNumber(ctx context.Context, cardNumber string) (*db.Card, error)
	}
}

// NewCardValidationService creates a new card validation service
func NewCardValidationService(cardRepo interface {
	GetByCardNumber(ctx context.Context, cardNumber string) (*db.Card, error)
}) *CardValidationService {
	return &CardValidationService{cardRepo: cardRepo}
}

// ValidateCard validates a credit card using Luhn algorithm and basic checks
func (s *CardValidationService) ValidateCard(ctx context.Context, cardNumber, cardholderName, cvv string, expiryMonth, expiryYear int) error {
	// Remove spaces and dashes from card number
	cardNumber = strings.ReplaceAll(cardNumber, " ", "")
	cardNumber = strings.ReplaceAll(cardNumber, "-", "")

	// Basic length check
	if len(cardNumber) < 13 || len(cardNumber) > 19 {
		return fmt.Errorf("invalid card number length")
	}

	// Check if card number contains only digits
	if _, err := strconv.Atoi(cardNumber); err != nil {
		return fmt.Errorf("card number must contain only digits")
	}

	// Luhn algorithm check
	if !s.luhnCheck(cardNumber) {
		return fmt.Errorf("invalid card number (Luhn check failed)")
	}

	// Cardholder name check
	if strings.TrimSpace(cardholderName) == "" {
		return fmt.Errorf("cardholder name is required")
	}

	// CVV check
	cvvLength := len(cvv)
	if cvvLength < 3 || cvvLength > 4 {
		return fmt.Errorf("invalid CVV length")
	}

	// Check if CVV contains only digits
	if _, err := strconv.Atoi(cvv); err != nil {
		return fmt.Errorf("CVV must contain only digits")
	}

	// Expiry date check
	now := time.Now()
	currentYear := now.Year()
	currentMonth := int(now.Month())

	if expiryYear < currentYear || (expiryYear == currentYear && expiryMonth < currentMonth) {
		return fmt.Errorf("card has expired")
	}

	if expiryMonth < 1 || expiryMonth > 12 {
		return fmt.Errorf("invalid expiry month")
	}

	// Card type detection
	cardType := s.detectCardType(cardNumber)
	if cardType == "unknown" {
		return fmt.Errorf("unsupported card type")
	}

	return nil
}

// GetTestCard retrieves a test card by number if it exists
func (s *CardValidationService) GetTestCard(ctx context.Context, cardNumber string) (string, error) {
	cardNumber = strings.ReplaceAll(cardNumber, " ", "")
	cardNumber = strings.ReplaceAll(cardNumber, "-", "")

	card, err := s.cardRepo.GetByCardNumber(ctx, cardNumber)
	if err != nil {
		return "success", nil // Default to success if not a test card
	}

	if card.ResponseScenario.Valid {
		return card.ResponseScenario.String, nil
	}
	return "success", nil
}

// luhnCheck performs the Luhn algorithm validation
func (s *CardValidationService) luhnCheck(cardNumber string) bool {
	sum := 0
	alternate := false

	// Process from right to left
	for i := len(cardNumber) - 1; i >= 0; i-- {
		digit := int(cardNumber[i] - '0')
		if digit < 0 || digit > 9 {
			return false
		}

		if alternate {
			digit *= 2
			if digit > 9 {
				digit -= 9
			}
		}

		sum += digit
		alternate = !alternate
	}

	return sum%10 == 0
}

// detectCardType detects the card type based on the card number
func (s *CardValidationService) detectCardType(cardNumber string) string {
	if strings.HasPrefix(cardNumber, "4") {
		return "visa"
	}
	if strings.HasPrefix(cardNumber, "5") || strings.HasPrefix(cardNumber, "2") {
		return "mastercard"
	}
	if strings.HasPrefix(cardNumber, "3") {
		return "amex"
	}
	if strings.HasPrefix(cardNumber, "6") {
		return "discover"
	}

	return "unknown"
}
