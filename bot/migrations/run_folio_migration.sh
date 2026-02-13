#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
elif [ -f ../.env ]; then
    export $(grep -v '^#' ../.env | xargs)
else
    echo "❌ .env file not found"
    exit 1
fi

echo "🔗 Connecting to Supabase..."

# Construct Postres connection string from SUPABASE_URL
# Assuming SUPABASE_URL format: https://[project-ref].supabase.co
# We need the DB password which might be in .env or consistent.
# For now, let's try to use the connection string directly if available, or construct it.
# Usually PGPASSWORD env var is needed.

# Using psql directly with the connection string from .env if available as DATABASE_URL
# or constructing it.

if [ -z "$DATABASE_URL" ]; then
    # Fallback construction (might need password input or env var)
    echo "⚠️ DATABASE_URL not found, attempting construction..."
    # This part is tricky without the password.
    # Let's hope the user has PGPASSWORD set or we can use the existing pattern from run_migration.sh which seemed to rely on SUPABASE_URL replacement?
    # run_migration.sh used: psql "${SUPABASE_URL/https:\/\//postgresql://postgres:}?sslmode=require"
    # This implies the user has .pgpass or PGPASSWORD set, or trusted auth?
    # Or maybe the password needs to be inserted?
    
    # Let's use the same command structure as run_migration.sh
    DATABASE_URL="${SUPABASE_URL/https:\/\//postgresql://postgres:}?sslmode=require"
fi

SQL_FILE="$(dirname "$0")/add_folio_and_public_results.sql"
echo "Running SQL file: $SQL_FILE"
psql "$DATABASE_URL" -f "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
else
    echo "❌ Migration failed."
    exit 1
fi
