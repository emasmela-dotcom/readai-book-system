#!/bin/bash
# Quick script to verify Vercel deployment is set up correctly

echo "🔍 ReadAI Deployment Health Check"
echo "=================================="
echo ""

# Check if DATABASE_URL is set locally
if [ -f .env ]; then
    if grep -q "DATABASE_URL" .env; then
        echo "✅ DATABASE_URL found in .env"
        DB_URL=$(grep DATABASE_URL .env | cut -d'=' -f2 | tr -d '"')
        if [[ $DB_URL == *"neon"* ]]; then
            echo "✅ DATABASE_URL points to Neon"
        else
            echo "⚠️  DATABASE_URL doesn't appear to be Neon"
        fi
    else
        echo "❌ DATABASE_URL not found in .env"
    fi
else
    echo "⚠️  .env file not found"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Deploy to Vercel: vercel"
echo "2. Set DATABASE_URL in Vercel Dashboard → Settings → Environment Variables"
echo "3. Set CRON_SECRET in Vercel Dashboard → Settings → Environment Variables"
echo "4. Verify cron job in Vercel Dashboard → Settings → Cron Jobs"
echo ""
echo "💡 Your DATABASE_URL should be:"
grep DATABASE_URL .env 2>/dev/null | cut -d'=' -f2 | tr -d '"' | head -1

