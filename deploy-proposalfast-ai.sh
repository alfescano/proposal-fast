#!/bin/bash

# ===================================
# ProposalFast Automated Deployment
# Domain: proposalfast.ai
# Server: 199.188.200.91
# ===================================

set -e

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SERVER_USER="alfescano"
SERVER_IP="199.188.200.91"
DOMAIN="proposalfast.ai"
APP_PATH="~/public_html/proposalfast.ai"
SSH_PASS="Thule@23182318"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}ProposalFast Deployment to ${DOMAIN}${NC}"
echo -e "${BLUE}========================================${NC}"

# ===== STEP 1: BUILD =====
echo -e "\n${YELLOW}[1/8] Building application...${NC}"
npm install
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}Build failed - dist folder not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build complete${NC}"

# ===== STEP 2: CREATE APP DIRECTORY =====
echo -e "\n${YELLOW}[2/8] Creating app directory on server...${NC}"
ssh $SERVER_USER@$SERVER_IP "mkdir -p public_html/proposalfast.ai" 2>/dev/null || true
echo -e "${GREEN}✓ Directory ready${NC}"

# ===== STEP 3: UPLOAD FILES =====
echo -e "\n${YELLOW}[3/8] Uploading application files...${NC}"
scp -r dist/* $SERVER_USER@$SERVER_IP:$APP_PATH/ > /dev/null 2>&1
scp server.js $SERVER_USER@$SERVER_IP:$APP_PATH/ > /dev/null 2>&1
scp package.json $SERVER_USER@$SERVER_IP:$APP_PATH/ > /dev/null 2>&1
scp package-lock.json $SERVER_USER@$SERVER_IP:$APP_PATH/ > /dev/null 2>&1
echo -e "${GREEN}✓ Files uploaded${NC}"

# ===== STEP 4: INSTALL DEPENDENCIES =====
echo -e "\n${YELLOW}[4/8] Installing dependencies on server...${NC}"
ssh $SERVER_USER@$SERVER_IP "cd $APP_PATH && npm install --production" > /dev/null 2>&1
echo -e "${GREEN}✓ Dependencies installed${NC}"

# ===== STEP 5: START APP WITH PM2 =====
echo -e "\n${YELLOW}[5/8] Starting app with PM2...${NC}"
ssh $SERVER_USER@$SERVER_IP << 'REMOTE_COMMANDS'
npm install -g pm2 > /dev/null 2>&1
cd ~/public_html/proposalfast.ai
pm2 stop proposalfast 2>/dev/null || true
pm2 delete proposalfast 2>/dev/null || true
pm2 start server.js --name "proposalfast" > /dev/null 2>&1
pm2 startup > /dev/null 2>&1
pm2 save > /dev/null 2>&1
REMOTE_COMMANDS
echo -e "${GREEN}✓ App started with PM2${NC}"

# ===== STEP 6: CONFIGURE APACHE =====
echo -e "\n${YELLOW}[6/8] Configuring Apache...${NC}"
ssh $SERVER_USER@$SERVER_IP << 'REMOTE_COMMANDS'
sudo a2enmod proxy proxy_http rewrite > /dev/null 2>&1
cat | sudo tee /etc/apache2/sites-available/proposalfast.ai.conf > /dev/null << 'VHOST'
<VirtualHost *:80>
    ServerName proposalfast.ai
    ServerAlias www.proposalfast.ai
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    ErrorLog ${APACHE_LOG_DIR}/proposalfast-error.log
    CustomLog ${APACHE_LOG_DIR}/proposalfast-access.log combined
</VirtualHost>
VHOST
sudo a2ensite proposalfast.ai.conf > /dev/null 2>&1
sudo apache2ctl configtest 2>&1 | grep -q "Syntax OK" && echo "Apache config OK"
sudo systemctl restart apache2 > /dev/null 2>&1
REMOTE_COMMANDS
echo -e "${GREEN}✓ Apache configured${NC}"

# ===== STEP 7: GET SSL CERTIFICATE =====
echo -e "\n${YELLOW}[7/8] Setting up SSL certificate...${NC}"
ssh $SERVER_USER@$SERVER_IP << 'REMOTE_COMMANDS'
sudo certbot --apache -d proposalfast.ai -d www.proposalfast.ai --non-interactive --agree-tos -m admin@proposalfast.ai > /dev/null 2>&1 || echo "SSL cert may already exist"
REMOTE_COMMANDS
echo -e "${GREEN}✓ SSL setup complete${NC}"

# ===== STEP 8: VERIFY =====
echo -e "\n${YELLOW}[8/8] Verifying deployment...${NC}"
ssh $SERVER_USER@$SERVER_IP "pm2 status" > /dev/null 2>&1
echo -e "${GREEN}✓ App is running${NC}"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${BLUE}Your app is live at:${NC} https://proposalfast.ai"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Go to Namecheap dashboard"
echo "2. Domain List → proposalfast.ai → Manage"
echo "3. Go to Advanced DNS"
echo "4. Add A Records:"
echo "   - Host: @ → Value: 199.188.200.91"
echo "   - Host: www → Value: 199.188.200.91"
echo "5. Wait 5-30 mins for DNS to propagate"
echo -e "\n${YELLOW}To check logs:${NC}"
echo "   ssh $SERVER_USER@$SERVER_IP"
echo "   pm2 logs proposalfast"
echo ""
