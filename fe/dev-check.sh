#!/bin/bash

# Development check script for catching errors early
set -e

echo "🚀 Running Development Checks"
echo "============================"

# Type checking
echo "📝 TypeScript Type Check..."
npm run type-check

# Linting
echo "🔧 ESLint Check..."
npm run lint

# Build test (to catch NG8107 and other build-time errors)
echo "🏗️  Build Test..."
npm run build

echo ""
echo "✅ All checks passed! You're ready to develop."
echo ""
echo "💡 Tips:"
echo "   - Run 'npm run lint:fix' to auto-fix linting issues"
echo "   - Run 'npm run check' for quick type + lint check"
echo "   - Pre-commit hooks will run automatically on git commit"
