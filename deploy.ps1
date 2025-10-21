Write-Host "ProposalFast Mobile App - Automated Deployment" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[1] Checking prerequisites..." -ForegroundColor Blue
$node = node --version 2>$null
if (-not $node) {
    Write-Host "ERROR: Node.js not installed. Download from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js found: $node" -ForegroundColor Green

# Install dependencies
Write-Host "[2] Installing dependencies..." -ForegroundColor Blue
npm install --legacy-peer-deps
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Check Expo login
Write-Host "[3] Checking Expo login..." -ForegroundColor Blue
$user = npx expo whoami 2>$null
if (-not $user) {
    Write-Host "⚠ Not logged into Expo. Please login:" -ForegroundColor Yellow
    npx expo login
}
Write-Host "✓ Logged in as: $user" -ForegroundColor Green
Write-Host ""

# Check EAS project
Write-Host "[4] Checking EAS project..." -ForegroundColor Blue
$appJson = Get-Content "app.json" | ConvertFrom-Json
$projectId = $appJson.expo.extra.eas.projectId

if (-not $projectId -or $projectId -eq "your-eas-project-id") {
    Write-Host "Initializing EAS project..." -ForegroundColor Yellow
    npx eas init --non-interactive
    $appJson = Get-Content "app.json" | ConvertFrom-Json
    $projectId = $appJson.expo.extra.eas.projectId
}
Write-Host "✓ EAS Project ID: $projectId" -ForegroundColor Green
Write-Host ""

# Build iOS
Write-Host "[5] Building iOS app (15-20 min)..." -ForegroundColor Blue
npx eas build --platform ios --auto-submit
Write-Host ""

# Build Android
Write-Host "[6] Building Android app (10-15 min)..." -ForegroundColor Blue
npx eas build --platform android --auto-submit
Write-Host ""

# Summary
Write-Host "✓ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Monitor at: https://expo.dev/dashboard" -ForegroundColor White
Write-Host "2. iOS App Store review: 24-48 hours" -ForegroundColor White
Write-Host "3. Google Play review: 1-2 hours" -ForegroundColor White
Write-Host ""
Write-Host "Your apps will go live automatically when approved!" -ForegroundColor Green
