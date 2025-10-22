# ProposalFast Deployment - Windows PowerShell
# Just run: .\deploy.ps1

$SERVER_USER = "alfescano"
$SERVER_IP = "199.188.200.91"
$DOMAIN = "proposalfast.ai"
$APP_PATH = "public_html/proposalfast.ai"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ProposalFast Deployment to $DOMAIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# STEP 1: BUILD
Write-Host "`n[1/5] Building application..." -ForegroundColor Yellow
npm install
npm run build

if (-not (Test-Path "dist")) {
    Write-Host "ERROR: Build failed - dist folder not found" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build complete`n" -ForegroundColor Green

# STEP 2: UPLOAD
Write-Host "[2/5] Uploading files to server..." -ForegroundColor Yellow
scp -r "dist/*" "$SERVER_USER@$SERVER_IP`:$APP_PATH/"
scp "server.js" "$SERVER_USER@$SERVER_IP`:$APP_PATH/"
scp "package.json" "$SERVER_USER@$SERVER_IP`:$APP_PATH/"
scp "package-lock.json" "$SERVER_USER@$SERVER_IP`:$APP_PATH/"
Write-Host "✓ Upload complete`n" -ForegroundColor Green

# STEP 3: INSTALL & START
Write-Host "[3/5] Installing dependencies on server..." -ForegroundColor Yellow

$commands = @(
    "cd $APP_PATH",
    "npm install --production",
    "npm install -g pm2",
    "pm2 stop proposalfast 2>/dev/null; true",
    "pm2 delete proposalfast 2>/dev/null; true",
    "pm2 start server.js --name proposalfast",
    "pm2 startup",
    "pm2 save"
)

foreach ($cmd in $commands) {
    ssh "$SERVER_USER@$SERVER_IP" $cmd
}

Write-Host "✓ App started`n" -ForegroundColor Green

# STEP 4: APACHE CONFIG
Write-Host "[4/5] Configuring Apache..." -ForegroundColor Yellow

ssh "$SERVER_USER@$SERVER_IP" "sudo a2enmod proxy proxy_http rewrite"

$vhost = @"
<VirtualHost *:80>
    ServerName proposalfast.ai
    ServerAlias www.proposalfast.ai
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    ErrorLog `${APACHE_LOG_DIR}/proposalfast-error.log
    CustomLog `${APACHE_LOG_DIR}/proposalfast-access.log combined
</VirtualHost>
"@

$vhost | ssh "$SERVER_USER@$SERVER_IP" "cat | sudo tee /etc/apache2/sites-available/proposalfast.ai.conf > /dev/null"

ssh "$SERVER_USER@$SERVER_IP" "sudo a2ensite proposalfast.ai.conf"
ssh "$SERVER_USER@$SERVER_IP" "sudo apache2ctl configtest"
ssh "$SERVER_USER@$SERVER_IP" "sudo systemctl restart apache2"

Write-Host "✓ Apache configured`n" -ForegroundColor Green

# STEP 5: SSL
Write-Host "[5/5] Setting up SSL certificate..." -ForegroundColor Yellow

ssh "$SERVER_USER@$SERVER_IP" "sudo certbot --apache -d proposalfast.ai -d www.proposalfast.ai --non-interactive --agree-tos -m admin@proposalfast.ai 2>/dev/null || true"

Write-Host "✓ SSL complete`n" -ForegroundColor Green

# DONE
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nApp is running at: https://proposalfast.ai" -ForegroundColor Cyan

Write-Host "`nFinal Step - Update DNS in Namecheap:" -ForegroundColor Yellow
Write-Host "1. Go to namecheap.com → Domain List"
Write-Host "2. Click proposalfast.ai → Manage"
Write-Host "3. Go to Advanced DNS tab"
Write-Host "4. Add A Records:"
Write-Host "   - Host: @ → Value: 199.188.200.91"
Write-Host "   - Host: www → Value: 199.188.200.91"
Write-Host "5. Save and wait 5-30 minutes"
Write-Host "`nThen visit: https://proposalfast.ai"
