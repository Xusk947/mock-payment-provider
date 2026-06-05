# Multi-stage Dockerfile for Mock Payment Provider with embedded SQLite

# Stage 1: Build
FROM golang:1.26.2-bookworm AS builder

WORKDIR /app

# Install build dependencies for CGO-enabled SQLite
RUN apt-get update && apt-get install -y \
    git \
    gcc \
    make \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Generate sqlc code and swagger docs
RUN go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest && \
    go install github.com/swaggo/swag/cmd/swag@latest && \
    cd sqlc && sqlc generate && cd .. && \
    swag init -g cmd/server/main.go --output cmd/server/docs

# Build the application with CGO enabled for embedded SQLite
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -tags sqlite_omit_load_extension -ldflags "-s -w" -o /app/server ./cmd/server

# Stage 2: Runtime
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    wget \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the binary from builder (SQLite is embedded)
COPY --from=builder /app/server /app/server
COPY --from=builder /app/api/migrations /app/api/migrations
COPY --from=builder /app/sqlc /app/sqlc

# Create database directory
RUN mkdir -p /app/database

# Copy default environment file
COPY .env.example /app/.env

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/admin/dashboard || exit 1

# Run the application
CMD ["/app/server"]