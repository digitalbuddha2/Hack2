#!/bin/bash

echo "=========================================="
echo "ClaudeMail Setup Script"
echo "=========================================="

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required. Install from https://nodejs.org"
    exit 1
fi

echo "Node.js version: $(node --version)"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Copy .env.example if .env doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo ""
    echo "Created .env file from .env.example"
    echo "Please edit .env with your actual credentials!"
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env with your credentials"
echo "2. Run: npm start"
echo "3. Visit: http://localhost:3000"
echo ""
