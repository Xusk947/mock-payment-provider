# Multi-stage Dockerfile for Mock Payment Provider with embedded frontend

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code and build
COPY frontend/ ./
RUN pnpm build

# Stage 2: Build Go backend
FROM golang:1.26.2-bookworm AS go-builder

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

# Copy built frontend dist for embedding (must be relative to cmd/server/main.go)
COPY --from=frontend-builder /app/dist ./cmd/server/dist

# Generate sqlc code and swagger docs
RUN go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest && \
    go install github.com/swaggo/swag/cmd/swag@latest && \
    cd sqlc && sqlc generate && cd .. && \
    swag init -g cmd/server/main.go --output cmd/server/docs

# Build the application with CGO enabled for embedded SQLite
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -tags sqlite_omit_load_extension -ldflags "-s -w" -o /app/server ./cmd/server

# Stage 3: Runtime
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    wget \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the binary from builder (SQLite + frontend embedded)
COPY --from=go-builder /app/server /app/server
COPY --from=go-builder /app/api/migrations /app/api/migrations
COPY --from=go-builder /app/sqlc /app/sqlc

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
