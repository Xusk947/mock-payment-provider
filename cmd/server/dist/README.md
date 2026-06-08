# Embedded Frontend Build

This directory holds the frontend build that is embedded into the Go binary
via `//go:embed all:dist` in `cmd/server/main.go`.

## How it works

- During Docker build: the frontend is built in the `frontend-builder` stage
  and copied into this directory before Go compilation.
- The Go binary embeds all files here and serves them as static assets.
- Any unmatched route falls back to `index.html` for SPA navigation.

## Local development

For local development without Docker:

```bash
cd frontend
pnpm build
cp -r dist/* ../cmd/server/dist/
cd ..
go run ./cmd/server
```

This ensures the embedded files are present when `go build` compiles
`cmd/server/main.go`.
