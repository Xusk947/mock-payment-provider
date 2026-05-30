package repository

import (
	"context"

	"github.com/xusk947/mock-payment-provider/pkg/database"
	db "github.com/xusk947/mock-payment-provider/sqlc"
)

// MerchantRepository handles database operations for merchants using sqlc
type MerchantRepository struct {
	db      *database.DB
	queries *db.Queries
}

// NewMerchantRepository creates a new merchant repository
func NewMerchantRepository(database *database.DB, queries *db.Queries) *MerchantRepository {
	return &MerchantRepository{db: database, queries: queries}
}

// GetByAPIKey retrieves a merchant by API key
func (r *MerchantRepository) GetByAPIKey(ctx context.Context, apiKey string) (*db.Merchant, error) {
	merchant, err := r.queries.GetMerchantByAPIKey(ctx, apiKey)
	if err != nil {
		return nil, err
	}
	return &merchant, nil
}

// Get retrieves a merchant by ID
func (r *MerchantRepository) Get(ctx context.Context, id int) (*db.Merchant, error) {
	merchant, err := r.queries.GetMerchant(ctx, int64(id))
	if err != nil {
		return nil, err
	}
	return &merchant, nil
}

// List retrieves all merchants with pagination
func (r *MerchantRepository) List(ctx context.Context, limit, offset int) ([]db.Merchant, error) {
	return r.queries.ListMerchants(ctx, db.ListMerchantsParams{
		Limit:  int64(limit),
		Offset: int64(offset),
	})
}

// Create creates a new merchant
func (r *MerchantRepository) Create(ctx context.Context, merchant *db.Merchant) error {
	result, err := r.queries.CreateMerchant(ctx, db.CreateMerchantParams{
		Name:       merchant.Name,
		ApiKey:     merchant.ApiKey,
		Email:      merchant.Email,
		Active:     merchant.Active,
		WebhookUrl: merchant.WebhookUrl,
	})
	if err != nil {
		return err
	}
	*merchant = result
	return nil
}

// Update updates a merchant
func (r *MerchantRepository) Update(ctx context.Context, merchant *db.Merchant) error {
	return r.queries.UpdateMerchant(ctx, db.UpdateMerchantParams{
		Name:       merchant.Name,
		Email:      merchant.Email,
		Active:     merchant.Active,
		WebhookUrl: merchant.WebhookUrl,
		ID:         merchant.ID,
	})
}

// Delete deletes a merchant (soft delete by setting active = false)
func (r *MerchantRepository) Delete(ctx context.Context, id int) error {
	return r.queries.DeleteMerchant(ctx, int64(id))
}
