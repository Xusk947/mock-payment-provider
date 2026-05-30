#!/bin/bash

# Goose migration helper script

DB_PATH="database/payments.db"
MIGRATIONS_DIR="api/migrations"

case "$1" in
    up)
        ~/go/bin/goose -dir "$MIGRATIONS_DIR" sqlite "$DB_PATH" up
        ;;
    down)
        ~/go/bin/goose -dir "$MIGRATIONS_DIR" sqlite "$DB_PATH" down
        ;;
    status)
        ~/go/bin/goose -dir "$MIGRATIONS_DIR" sqlite "$DB_PATH" status
        ;;
    create)
        ~/go/bin/goose -dir "$MIGRATIONS_DIR" create "$2" sql
        ;;
    *)
        echo "Usage: $0 {up|down|status|create migration_name}"
        exit 1
        ;;
esac