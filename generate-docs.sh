#!/bin/bash

# NAHS Caseload Documentation Generator
# This script helps generate JSDoc documentation for the project

echo "🔧 NAHS Caseload Documentation Generator"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
else
    echo "❌ package.json not found. Make sure you're in the project directory."
    exit 1
fi

# Generate documentation
echo "📚 Generating JSDoc documentation..."
npm run docs
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate documentation"
    exit 1
fi

echo "✅ Documentation generated successfully!"
echo ""
echo "📁 Documentation files created in: ./docs/"
echo ""
echo "🌐 To view documentation:"
echo "   Option 1: Open ./docs/index.html in your browser"
echo "   Option 2: Run 'npm run docs:serve' and visit http://localhost:8080"
echo ""
echo "🔄 To regenerate documentation: npm run docs:rebuild"
echo "🧹 To clean documentation: npm run docs:clean"
