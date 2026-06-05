# mock-payment-provider

A fully-featured mock payment provider API built with Go and React. It simulates real-world payment gateway behavior — including charges, holds, captures, refunds, 3D Secure, webhooks, and configurable error scenarios — so backend teams can integrate and test payment flows without touching live payment networks.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Go 1.26.2, Fiber v3 |
| Database | SQLite3 (embedded, CGO-enabled) |
| SQL / ORM | sqlc (type-safe SQL), Goose (migrations) |
| API Docs | Swagger / OpenAPI (swaggo) |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui |
| Logging | Uber Zap |
| Testing | Go test + Testcontainers (E2E) |
| CI/CD | GitHub Actions (tests, security scan, Docker build) |
| Dev Tools | Air (live reload), Docker, Prettier, ESLint |

## Features

- **Payment Operations**
  - `charge` — one-time card payment
  - `hold` — authorize funds without capturing
  - `capture` — capture funds from a hold
  - `refund` — partial or full refund of completed/captured transactions
  - `invoice` — create a pending invoice and pay it later with card details

- **3D Secure Simulation**
  - Cards can be configured to require 3DS
  - API returns `402` with a challenge when 3DS is required and not authenticated
  - `POST /api/v1/transactions/:id/3ds/complete` to complete authentication

- **Error Scenarios**
  - Pre-configured test cards trigger specific outcomes (`success`, `decline`, `insufficient_funds`, `3ds_required`, etc.)
  - Configurable error scenarios with probability-based failure injection
  - Explicit scenario selection via the `scenario` field in requests

- **Webhook Support**
  - Merchants can register webhook URLs for events: `charge.completed`, `charge.failed`, `hold.created`, `capture.completed`, `refund.completed`
  - Automatic retries with configurable attempts and timeout
  - Webhook delivery logs stored in the database

- **Admin Dashboard**
  - React-based SPA served by the Go backend
  - View merchants, test cards, error scenarios, and webhook configurations
  - Dashboard statistics (total transactions, success/failure rates, amounts)

- **Security & Observability**
  - API key authentication (`X-API-Key` header)
  - Request logging with Zap
  - Panic recovery middleware
  - CORS enabled for frontend integration
  - Security scanning in CI (Gosec, Trivy)

## Project Structure

```
mock-payment-provider/
├── cmd/server/               # Application entry point
├── internal/
│   ├── handlers/             # HTTP handlers (payment, admin, webhook)
│   ├── services/             # Business logic (transactions, 3DS, card validation, webhooks)
│   ├── repository/           # Data access layer (sqlc wrappers)
│   ├── models/               # Domain models, DTOs, and mappers
│   └── middleware/           # Auth, CORS, logging, recovery
├── pkg/
│   ├── database/             # SQLite connection & pool configuration
│   └── logger/               # Zap logger setup
├── sqlc/                     # sqlc generated code + queries
│   └── queries/queries.sql   # Raw SQL queries for sqlc generation
├── api/migrations/           # Goose database migrations
├── frontend/                 # React + Vite admin dashboard
├── test/e2e/                 # End-to-end tests
├── scripts/                  # Utility shell scripts
├── Dockerfile                # Multi-stage production build
├── Dockerfile.dev            # Development build with Air
├── goose.yaml                # Goose configuration
└── .env.example              # Environment variable template
```

## Quick Start

### Prerequisites

- Go 1.26.2+
- Node.js 20+ (for frontend)
- SQLite3 (for local development)
- `goose`, `sqlc`, `swag` CLI tools (optional, see below)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/xusk947/mock-payment-provider.git
cd mock-payment-provider

# Backend
go mod download

# Frontend
cd frontend && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env as needed (default values work for local development)
```

Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `3000` | HTTP server port |
| `DATABASE_PATH` | `./database/payments.db` | SQLite database file |
| `LOG_LEVEL` | `info` | Log verbosity |
| `JWT_SECRET` | — | Secret for token signing |
| `THREEDS_ENABLED` | `true` | Enable 3DS simulation |
| `WEBHOOK_TIMEOUT` | `30s` | Webhook HTTP timeout |
| `WEBHOOK_RETRY_ATTEMPTS` | `3` | Retry count for failed webhooks |

### 3. Generate Code

```bash
# Generate sqlc type-safe Go code
cd sqlc && sqlc generate && cd ..

# Generate Swagger documentation
swag init -g cmd/server/main.go --output cmd/server/docs
```

### 4. Run Migrations

```bash
go install github.com/pressly/goose/v3/cmd/goose@latest
goose -dir api/migrations sqlite3 database/payments.db up
```

### 5. Start the Server

**Development (with live reload):**

```bash
# Requires Air
go install github.com/air-verse/air@latest
air -c .air.toml
```

**Production build:**

```bash
go build -o server ./cmd/server
./server
```

**Docker:**

```bash
docker build -t mock-payment-provider .
docker run -p 3000:3000 mock-payment-provider
```

The server will be available at `http://localhost:3000`.

### 6. Start the Frontend (Standalone)

If you want to run the React frontend in dev mode separately:

```bash
cd frontend
npm run dev
```

## API Overview

### Authentication

Most payment endpoints require an `X-API-Key` header. The test API key from migrations is:

```
X-API-Key: test_api_key_12345
```

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/charges` | Process a charge |
| `POST` | `/api/v1/holds` | Place an authorization hold |
| `POST` | `/api/v1/captures` | Capture a hold |
| `POST` | `/api/v1/refunds` | Issue a refund |
| `GET`  | `/api/v1/transactions` | List transactions (paginated) |
| `GET`  | `/api/v1/transactions/:id` | Get transaction by ID |
| `POST` | `/api/v1/transactions/:id/confirm` | Confirm a pending transaction |
| `POST` | `/api/v1/transactions/:id/reject` | Reject a pending transaction |
| `POST` | `/api/v1/transactions/:id/capture` | Capture a hold by ID (admin) |
| `POST` | `/api/v1/transactions/:id/refund` | Refund by ID (admin) |
| `POST` | `/api/v1/transactions/:id/3ds/complete` | Complete 3DS authentication |
| `POST` | `/api/v1/3ds/challenge` | Generate a 3DS challenge |
| `POST` | `/api/v1/invoices` | Create a pending invoice |
| `POST` | `/api/v1/invoices/:id/pay` | Pay an existing invoice |
| `GET`  | `/api/v1/scenarios` | List available error scenarios |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/dashboard` | Dashboard statistics |
| `GET` | `/admin/merchants` | List merchants |
| `GET` | `/admin/merchants/:id` | Get merchant |
| `GET` | `/admin/merchants/:id/webhooks` | Get merchant webhooks |
| `GET` | `/admin/cards` | List test cards |
| `GET` | `/admin/cards/:id` | Get test card |
| `GET` | `/admin/error-scenarios` | List error scenarios |
| `GET` | `/admin/error-scenarios/:id` | Get error scenario |
| `GET` | `/admin/webhooks` | List webhooks |
| `POST` | `/admin/webhooks` | Create webhook |
| `PUT` | `/admin/webhooks/:id` | Update webhook |
| `DELETE` | `/admin/webhooks/:id` | Delete webhook |

### Swagger UI

Once the server is running, API documentation is available at:

```
http://localhost:3000/swagger/index.html
```

## Test Cards

The following cards are pre-loaded by migrations for quick testing:

| Card Number | Type | Scenario | 3DS Required | Description |
|-------------|------|----------|------------|-------------|
| `4111111111111111` | Visa | `success` | No | Always succeeds |
| `4000000000000002` | Visa | `decline` | No | Always declined |
| `5555555555554444` | Mastercard | `3ds_required` | Yes | Requires 3DS auth |
| `378282246310005` | Amex | `insufficient_funds` | No | Insufficient funds |
| `6011111111111117` | Discover | `success` | No | Always succeeds |
| `3566002020360505` | JCB | `success` | No | Always succeeds |

## Transaction Statuses

| Status | Meaning |
|--------|---------|
| `pending` | Transaction created, awaiting confirmation or 3DS |
| `completed` | Charge successfully processed |
| `authorized` | Hold placed, funds reserved |
| `captured` | Hold captured, funds settled |
| `refunded` | Refund processed |
| `failed` | Transaction declined or errored |

## Testing

### Unit Tests

```bash
go test ./... -v -short
```

### E2E Tests

```bash
# Build and start the server
go build -o server ./cmd/server
./server &

# Run E2E tests
go test ./test/e2e/... -v
```

The E2E suite uses Testcontainers for isolated integration testing where applicable.

### CI Pipeline

The GitHub Actions workflow (`/.github/workflows/ci.yml`) runs on every push/PR:

1. **test** — unit tests with coverage (Codecov)
2. **e2e-test** — end-to-end tests against a running server
3. **security-scan** — Gosec + Trivy vulnerability scanning
4. **build** — Docker image build & push to GHCR
5. **standalone-container-test** — health check on the built container

## Database Migrations

Migrations are managed with [Goose](https://github.com/pressly/goose).

```bash
# Apply all pending migrations
goose -dir api/migrations sqlite3 database/payments.db up

# Rollback last migration
goose -dir api/migrations sqlite3 database/payments.db down

# Check status
goose -dir api/migrations sqlite3 database/payments.db status
```

Migration files:

- `00001_init_schema.sql` — Initial `transactions` table
- `00002_comprehensive_schema.sql` — Merchants, cards, webhooks, webhook logs, error scenarios, enhanced transactions
- `00003_test_data.sql` — Test merchants, cards, error scenarios, and webhooks for E2E testing

## Webhook Events

When a transaction changes state, the system sends asynchronous webhooks to the merchant's registered URLs.

Supported events:

- `charge.completed`
- `charge.failed`
- `hold.created`
- `capture.completed`
- `refund.completed`

Payloads include the full transaction object. Failed deliveries are retried up to `WEBHOOK_RETRY_ATTEMPTS` times.

## Docker

### Production Image

The multi-stage `Dockerfile` builds a minimal Debian-based image with the compiled binary and embedded SQLite.

```bash
docker build -t mock-payment-provider .
docker run -p 3000:3000 -v $(pwd)/database:/app/database mock-payment-provider
```

### Development Image

`Dockerfile.dev` includes Air for live reload during development.

```bash
docker build -f Dockerfile.dev -t mock-payment-provider:dev .
docker run -p 3000:3000 -v $(pwd):/app mock-payment-provider:dev
```

## License

MIT License — see repository for details.
