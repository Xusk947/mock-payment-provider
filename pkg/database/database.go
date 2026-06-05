package database

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
	db "github.com/xusk947/mock-payment-provider/sqlc"
)

// DB wraps the sql.DB connection and sqlc queries
type DB struct {
	*sql.DB
	Queries *db.Queries
}

// Config holds database configuration
type Config struct {
	Path string // Path to the SQLite database file
}

// DefaultConfig returns a default configuration
func DefaultConfig() *Config {
	return &Config{
		Path: "database/payments.db",
	}
}

// New creates a new database connection
func New(cfg *Config) (*DB, error) {
	if cfg == nil {
		cfg = DefaultConfig()
	}

	// Ensure the database directory exists
	dbDir := filepath.Dir(cfg.Path)
	if err := os.MkdirAll(dbDir, 0750); err != nil {
		return nil, fmt.Errorf("failed to create database directory: %w", err)
	}

	// Open the database connection
	conn, err := sql.Open("sqlite3", cfg.Path)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test the connection
	if err := conn.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Set connection pool settings
	conn.SetMaxOpenConns(25)
	conn.SetMaxIdleConns(25)
	conn.SetConnMaxLifetime(5 * 60) // 5 minutes

	// Create sqlc queries
	queries := db.New(conn)

	return &DB{conn, queries}, nil
}

// Close closes the database connection
func (db *DB) Close() error {
	return db.DB.Close()
}
