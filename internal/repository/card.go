package repository

import (
	"context"

	"github.com/xusk947/mock-payment-provider/pkg/database"
	db "github.com/xusk947/mock-payment-provider/sqlc"
)

// CardRepository handles database operations for test cards using sqlc
type CardRepository struct {
	db      *database.DB
	queries *db.Queries
}

// NewCardRepository creates a new card repository
func NewCardRepository(database *database.DB, queries *db.Queries) *CardRepository {
	return &CardRepository{db: database, queries: queries}
}

// GetByCardNumber retrieves a card by card number
func (r *CardRepository) GetByCardNumber(ctx context.Context, cardNumber string) (*db.Card, error) {
	card, err := r.queries.GetCardByNumber(ctx, cardNumber)
	if err != nil {
		return nil, err
	}
	return &card, nil
}

// Get retrieves a card by ID
func (r *CardRepository) Get(ctx context.Context, id int) (*db.Card, error) {
	card, err := r.queries.GetCard(ctx, int64(id))
	if err != nil {
		return nil, err
	}
	return &card, nil
}

// List retrieves all cards
func (r *CardRepository) List(ctx context.Context) ([]db.Card, error) {
	return r.queries.ListCards(ctx)
}

// Create creates a new test card
func (r *CardRepository) Create(ctx context.Context, card *db.Card) error {
	result, err := r.queries.CreateCard(ctx, db.CreateCardParams{
		CardNumber:       card.CardNumber,
		CardholderName:   card.CardholderName,
		ExpiryMonth:      card.ExpiryMonth,
		ExpiryYear:       card.ExpiryYear,
		Cvv:              card.Cvv,
		CardType:         card.CardType,
		ResponseScenario: card.ResponseScenario,
		Require3ds:       card.Require3ds,
		Description:      card.Description,
	})
	if err != nil {
		return err
	}
	*card = result
	return nil
}

// Update updates a card
func (r *CardRepository) Update(ctx context.Context, card *db.Card) error {
	return r.queries.UpdateCard(ctx, db.UpdateCardParams{
		CardholderName:   card.CardholderName,
		ExpiryMonth:      card.ExpiryMonth,
		ExpiryYear:       card.ExpiryYear,
		Cvv:              card.Cvv,
		CardType:         card.CardType,
		ResponseScenario: card.ResponseScenario,
		Require3ds:       card.Require3ds,
		Description:      card.Description,
		ID:               card.ID,
	})
}

// Delete deletes a card
func (r *CardRepository) Delete(ctx context.Context, id int) error {
	return r.queries.DeleteCard(ctx, int64(id))
}
