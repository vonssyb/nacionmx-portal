#!/bin/bash
# Load env from parent dir (assuming we are in bot/migrations)
source ../../.env 2>/dev/null || source .env 2>/dev/null || source ../.env

# Fix for getting the actual postgres url if possible, or just use the pattern from existing script
# Existing script: psql "${SUPABASE_URL/https:\/\//postgresql://postgres:}?sslmode=require"
# Note: This pattern might be wrong if the user didn't set it up exactly this way, but I follow existing pattern.
# Actually, let's just try to parse it better if possible, but for now stick to precedent.

URL="${SUPABASE_URL/https:\/\//postgresql://postgres:}"
# Append query params
FULL_URL="${URL}?sslmode=require"

echo "Connecting to $FULL_URL"
psql "$FULL_URL" -f add_dates_to_elections.sql
