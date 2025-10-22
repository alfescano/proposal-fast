#!/bin/bash
# ProposalFast - Deploy Everything in One Command
# Usage: bash deploy-one-command.sh

set -e

SERVER_USER="alfescano"
SERVER_IP="199.188.200.91"
APP_PATH="public_html/proposalfast.ai"

echo "🚀 ProposalFast Deployment Starting..."

# Step 1: Build
echo "📦 Building app..."
npm install > /dev/null 2>&1
npm run build > /dev/null 2>&1

# Step 2: Create remote directory
echo "📁 Creating server directory..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $APP_PATH" 2>/dev/null || true

# Step 3: Upload files
echo "📤 Uploading files..."
scp -r dist/* $SERVER_USER@$SERVER_IP:$APP_PATH/ 2>/dev/null
scp server.js $SERVER_USER@$SERVER_IP:$APP_PATH/ 2>/dev/null
scp package.json $SERVER_USER@$SERVER_IP:$APP_PATH/ 2>/dev/null

# Step 4: Install & Configure Everything
echo "⚙️ Installing & configuring on server..."
ssh $SERVER_USER@$SERVER_IP << 'DEPLOY'
set -e
cd public_html/proposalfast.ai
npm install --production > /dev/null 2>&1
npm install -g pm2 > /dev/null 2>&1
pm2 stop proposalfast 2>/dev/null || true
pm2 delete proposalfast 2>/dev/null || true
pm2 start server.js --name "proposalfast" > /dev/null 2>&1
pm2 startup > /dev/null 2>&1
pm2 save > /dev/null 2>&1
sudo a2enmod proxy proxy_http rewrite > /dev/null 2>&1
sudo tee /etc/apache2/sites-available/proposalfast.ai.conf > /dev/null << 'VHOST'
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
sudo apache2ctl configtest > /dev/null 2>&1
sudo systemctl restart apache2 > /dev/null 2>&1
sudo certbot --apache -d proposalfast.ai -d www.proposalfast.ai --non-interactive --agree-tos -m admin@proposalfast.ai > /dev/null 2>&1 || true
DEPLOY

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📍 Your app is running at: https://proposalfast.ai"
echo ""
echo "⚠️  Final Step - Update DNS in Namecheap:"
echo "   1. Go to namecheap.com → Domain List → proposalfast.ai"
echo "   2. Click Manage → Advanced DNS"
echo "   3. Add A Records:"
echo "      Host: @   → Value: 199.188.200.91"
echo "      Host: www → Value: 199.188.200.91"
echo "   4. Wait 5-30 mins for DNS to propagate"
echo ""
echo "Then visit: https://proposalfast.ai"
echo ""
