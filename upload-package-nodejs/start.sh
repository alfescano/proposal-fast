#!/bin/bash

# ProposalFast.ai - Node.js Startup Script
# Usage: bash start.sh

echo "🚀 Starting ProposalFast.ai Node.js App..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Install from: https://nodejs.org/${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION} found${NC}"
echo ""

# Check npm
echo "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm ${NPM_VERSION} found${NC}"
echo ""

# Copy .env if needed
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠ Edit .env with your configuration${NC}"
    fi
    echo ""
fi

# Install dependencies
echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Build React app
echo "Building React app..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to build React app${NC}"
    exit 1
fi
echo -e "${GREEN}✓ React app built${NC}"
echo ""

# Install PM2
echo "Checking PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 globally..."
    npm install -g pm2
fi
echo -e "${GREEN}✓ PM2 ready${NC}"
echo ""

# Start with PM2
echo "Starting app with PM2..."
pm2 start ecosystem.config.js
echo ""

# Setup auto-restart
echo "Setting up auto-restart on reboot..."
pm2 startup
pm2 save
echo ""

# Status
echo -e "${GREEN}✓ App started successfully!${NC}"
echo ""
echo "📊 Status:"
pm2 status
echo ""
echo "📋 Next steps:"
echo "1. Configure reverse proxy in cPanel"
echo "2. Route proposalfast.ai → http://127.0.0.1:3000/"
echo "3. Visit https://proposalfast.ai/"
echo ""
echo "📝 Useful commands:"
echo "   pm2 logs proposalfast-ai     - View logs"
echo "   pm2 restart proposalfast-ai  - Restart app"
echo "   pm2 stop proposalfast-ai     - Stop app"
echo "   pm2 monit                    - Monitor CPU/Memory"
echo ""
echo "🚀 Ready to go live!"
