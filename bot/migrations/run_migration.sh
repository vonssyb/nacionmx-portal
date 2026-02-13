#!/bin/bash

# Script to run the transaction audit migration on Supabase
# This creates the necessary tables and RPC functions for atomic casino transactions

echo "📦 Running Transaction Audit Migration..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check for .env file
if [ ! -f ../.env ]; then
    echo "❌ .env file not found in parent directory"
    exit 1
fi

# Load environment variables
source ../.env

echo "🔗 Connecting to Supabase..."
echo "   Project: ${SUPABASE_URL}"

# Run the migration
psql "${SUPABASE_URL/https:\/\//postgresql://postgres:}?sslmode=require" -f migration_transaction_audit.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📋 Created:"
    echo "   - transaction_audit table"
    echo "   - execute_casino_transaction() RPC function"
    echo "   - execute_chips_exchange() RPC function"
    echo "   - execute_money_transfer() RPC function"
    echo "   - execute_bank_operation() RPC function"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Test the /dados command"
    echo "   2. Monitor transaction_audit table for logs"
    echo "   3. Refactor remaining casino commands"
else
    echo "❌ Migration failed. Check the error messages above."
    exit 1
fi
