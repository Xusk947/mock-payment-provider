package utils

import (
	"os"
	"strings"
	"testing"
)

func TestGenerateCheckoutURL_WithPublicBaseURL(t *testing.T) {
	cfg := &URLConfig{
		PublicBaseURL: "https://payment.example.com",
		ServerPort:    "8080",
	}

	url := cfg.GenerateCheckoutURL(123)
	expected := "https://payment.example.com/pay/123"
	if url != expected {
		t.Errorf("expected %q, got %q", expected, url)
	}
}

func TestGenerateCheckoutURL_WithPublicBaseURLTrailingSlash(t *testing.T) {
	cfg := &URLConfig{
		PublicBaseURL: "https://payment.example.com/",
		ServerPort:    "8080",
	}

	url := cfg.GenerateCheckoutURL(456)
	expected := "https://payment.example.com/pay/456"
	if url != expected {
		t.Errorf("expected %q, got %q", expected, url)
	}
}

func TestGenerateCheckoutURL_WithServerPort(t *testing.T) {
	cfg := &URLConfig{
		PublicBaseURL: "",
		ServerPort:    "8080",
	}

	url := cfg.GenerateCheckoutURL(789)
	expected := "http://localhost:8080/pay/789"
	if url != expected {
		t.Errorf("expected %q, got %q", expected, url)
	}
}

func TestGenerateCheckoutURL_FallbackDefault(t *testing.T) {
	cfg := &URLConfig{
		PublicBaseURL: "",
		ServerPort:    "",
	}

	url := cfg.GenerateCheckoutURL(999)
	expected := "http://localhost:3000/pay/999"
	if url != expected {
		t.Errorf("expected %q, got %q", expected, url)
	}
}

func TestGenerateCheckoutURL_ZeroTransactionID(t *testing.T) {
	cfg := &URLConfig{
		PublicBaseURL: "https://payment.example.com",
	}

	url := cfg.GenerateCheckoutURL(0)
	expected := "https://payment.example.com/pay/0"
	if url != expected {
		t.Errorf("expected %q, got %q", expected, url)
	}
}

func TestGenerateCheckoutURL_LargeTransactionID(t *testing.T) {
	cfg := &URLConfig{
		PublicBaseURL: "https://payment.example.com",
	}

	url := cfg.GenerateCheckoutURL(2147483647)
	expected := "https://payment.example.com/pay/2147483647"
	if url != expected {
		t.Errorf("expected %q, got %q", expected, url)
	}
}

func TestGenerateAPIURL_WithServerPort(t *testing.T) {
	cfg := &URLConfig{
		ServerPort: "5000",
	}

	url := cfg.GenerateAPIURL("/api/v1/charge")
	expected := "http://localhost:5000/api/v1/charge"
	if url != expected {
		t.Errorf("expected %q, got %q", expected, url)
	}
}

func TestGenerateAPIURL_FallbackDefault(t *testing.T) {
	cfg := &URLConfig{}

	url := cfg.GenerateAPIURL("/api/v1/refund")
	expected := "http://localhost:3000/api/v1/refund"
	if url != expected {
		t.Errorf("expected %q, got %q", expected, url)
	}
}

func TestGenerateAPIURL_TrailingSlashEndpoint(t *testing.T) {
	cfg := &URLConfig{
		ServerPort: "3000",
	}

	url := cfg.GenerateAPIURL("/api/v1/health/")
	expected := "http://localhost:3000/api/v1/health/"
	if url != expected {
		t.Errorf("expected %q, got %q", expected, url)
	}
}

func TestNewURLConfig_ReadsEnv(t *testing.T) {
	t.Setenv("PUBLIC_BASE_URL", "https://env.example.com")
	t.Setenv("SERVER_PORT", "9090")

	cfg := NewURLConfig()
	if cfg.PublicBaseURL != "https://env.example.com" {
		t.Errorf("expected PublicBaseURL %q, got %q", "https://env.example.com", cfg.PublicBaseURL)
	}
	if cfg.ServerPort != "9090" {
		t.Errorf("expected ServerPort %q, got %q", "9090", cfg.ServerPort)
	}
}

func TestNewURLConfig_EmptyEnv(t *testing.T) {
	os.Unsetenv("PUBLIC_BASE_URL")
	os.Unsetenv("SERVER_PORT")

	cfg := NewURLConfig()
	if cfg.PublicBaseURL != "" {
		t.Errorf("expected empty PublicBaseURL, got %q", cfg.PublicBaseURL)
	}
	if cfg.ServerPort != "" {
		t.Errorf("expected empty ServerPort, got %q", cfg.ServerPort)
	}
}

func TestGenerateCheckoutURL_MultipleTrailingSlashes(t *testing.T) {
	cfg := &URLConfig{
		PublicBaseURL: "https://payment.example.com///",
	}

	url := cfg.GenerateCheckoutURL(1)
	// strings.TrimRight should strip all trailing slashes
	if !strings.HasPrefix(url, "https://payment.example.com/pay/") {
		t.Errorf("unexpected URL format: %q", url)
	}
}
