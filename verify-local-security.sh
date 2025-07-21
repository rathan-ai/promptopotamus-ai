#!/bin/bash
# Local Security Verification Script

echo "🔒 Verifying Local Development Security..."
echo

# Check if .env.local exists but is not tracked
if [ -f .env.local ]; then
    if git ls-files | grep -q ".env.local"; then
        echo "❌ DANGER: .env.local is being tracked by git!"
        echo "   Run: git rm --cached .env.local"
    else
        echo "✅ .env.local exists and is properly ignored"
    fi
else
    echo "⚠️  .env.local not found (create from .env.example)"
fi

# Check for any tracked env files
echo
echo "Checking for tracked environment files..."
tracked_env=$(git ls-files | grep -E '\.(env|key|crt)$')
if [ -z "$tracked_env" ]; then
    echo "✅ No sensitive files are being tracked"
else
    echo "❌ DANGER: These sensitive files are tracked:"
    echo "$tracked_env"
fi

# Check .gitignore
echo
echo "Checking .gitignore patterns..."
if grep -q ".env.local" .gitignore; then
    echo "✅ .env.local is in .gitignore"
else
    echo "❌ .env.local is NOT in .gitignore"
fi

# Check current git status for sensitive files
echo
echo "Checking git status for sensitive files..."
sensitive_status=$(git status --porcelain | grep -E '\.(env|key|crt)$')
if [ -z "$sensitive_status" ]; then
    echo "✅ No sensitive files in git status"
else
    echo "❌ DANGER: Sensitive files in git status:"
    echo "$sensitive_status"
fi

# Check for actual environment variables
echo
echo "Environment variables check:"
if [ -f .env.local ]; then
    echo "📋 Variables found in .env.local:"
    grep -E '^[A-Z_]+=' .env.local | cut -d'=' -f1 | sed 's/^/   - /'
else
    echo "⚠️  No .env.local file found"
fi

echo
echo "🔒 Security verification complete!"