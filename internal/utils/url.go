package utils

import (
	"fmt"
	"os"
	"strings"
)

// URLConfig holds configuration for URL generation
type URLConfig struct {
	PublicBaseURL string
	ServerPort    string
}

// NewURLConfig creates a new URLConfig from environment variables
func NewURLConfig() *URLConfig {
	return &URLConfig{
		PublicBaseURL: os.Getenv("PUBLIC_BASE_URL"),
		ServerPort:    os.Getenv("SERVER_PORT"),
	}
}

// GenerateCheckoutURL generates a checkout URL for the given transaction ID
func (c *URLConfig) GenerateCheckoutURL(transactionID int) string {
	// Use public base URL if available, otherwise construct from server port
	baseURL := c.PublicBaseURL
	if baseURL == "" {
		if c.ServerPort != "" {
			baseURL = fmt.Sprintf("http://localhost:%s", c.ServerPort)
		} else {
			baseURL = "http://localhost:3000" // fallback default
		}
	}
	
	return strings.TrimRight(baseURL, "/") + fmt.Sprintf("/pay/%d", transactionID)
}

// GenerateAPIURL generates an API URL for the given endpoint
func (c *URLConfig) GenerateAPIURL(endpoint string) string {
	baseURL := "http://localhost:3000"
	if c.ServerPort != "" {
		baseURL = fmt.Sprintf("http://localhost:%s", c.ServerPort)
	}
	
	return strings.TrimRight(baseURL, "/") + endpoint
}
