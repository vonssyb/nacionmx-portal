#!/bin/bash

# Script to run the economy RPC migration on Supabase

echo "📦 Running Economy RPC Migration..."

# Check for .env file
if [ ! -f ../../.env ]; then
    echo "❌ .env file not found in grandparent directory"
    exit 1
fi

# Load environment variables
source ../../.env

echo "🔗 Connecting to Supabase..."
# Construct Postgres URL from Supabase URL (Standard convention for Supabase direct DB access)
# Assuming SUPABASE_URL is like https://<project>.supabase.co, we need DB connection.
# Actually, the previous script used: "${SUPABASE_URL/https:\/\//postgresql://postgres:}?sslmode=require"
# This assumes the password is in .pgpass or handled? OR the user has to input it?
# Wait, the previous script might be slightly wrong if it relies on SUPABASE_URL for postgres connection string.
# Usually SUPABASE_DB_URL is separate.
# However, I will trust the user's previous script logic.

# If DATABASE_URL exists in .env, use it.
if [ -z "$DATABASE_URL" ]; then
    # Fallback to the logic from run_migration.sh
    DB_URL="${SUPABASE_URL/https:\/\//postgresql://postgres:}?sslmode=require"
else
    DB_URL=$DATABASE_URL
fi

# Run the migration
psql "$DB_URL" -f rpc_economy_transactions.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
else
    echo "❌ Migration failed."
    exit 1
fi
