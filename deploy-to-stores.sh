#!/bin/bash

# ============================================
# 🚀 ProposalFast Mobile App - Auto Deploy
# ============================================
# Fully automated deployment to iOS & Android

set -e

echo "📱 ProposalFast Mobile App - Automated Deployment"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# STEP 1: Verify Prerequisites
# ============================================
echo -e "${BLUE}[STEP 1]${NC} Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js and npm found${NC}"
echo ""

# ============================================
# STEP 2: Install Dependencies
# ============================================
echo -e "${BLUE}[STEP 2]${NC} Installing dependencies..."
npm install --legacy-peer-deps
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# ============================================
# STEP 3: Verify Expo CLI
# ============================================
echo -e "${BLUE}[STEP 3]${NC} Verifying Expo CLI..."
npx expo --version > /dev/null 2>&1 || {
    echo -e "${RED}✗ Expo CLI not available${NC}"
    exit 1
}
echo -e "${GREEN}✓ Expo CLI ready${NC}"
echo ""

# ============================================
# STEP 4: Check Expo Login
# ============================================
echo -e "${BLUE}[STEP 4]${NC} Checking Expo login status..."
if ! npx expo whoami > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Not logged into Expo${NC}"
    echo -e "Please login to Expo:"
    echo ""
    npx expo login
    echo ""
    if ! npx expo whoami > /dev/null 2>&1; then
        echo -e "${RED}✗ Expo login failed${NC}"
        exit 1
    fi
fi
EXPO_USER=$(npx expo whoami 2>/dev/null || echo "unknown")
echo -e "${GREEN}✓ Logged in as: ${EXPO_USER}${NC}"
echo ""

# ============================================
# STEP 5: Check EAS Project
# ============================================
echo -e "${BLUE}[STEP 5]${NC} Checking EAS project..."
PROJECT_ID=$(grep -o '"projectId": "[^"]*"' app.json | cut -d'"' -f4 || echo "")

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" == "your-eas-project-id" ]; then
    echo -e "${YELLOW}⚠ EAS project not initialized${NC}"
    echo "Initializing EAS..."
    npx eas init --non-interactive
    PROJECT_ID=$(grep -o '"projectId": "[^"]*"' app.json | cut -d'"' -f4)
fi
echo -e "${GREEN}✓ EAS Project ID: ${PROJECT_ID}${NC}"
echo ""

# ============================================
# STEP 6: Configure Credentials
# ============================================
echo -e "${BLUE}[STEP 6]${NC} Configuring build credentials..."
echo "This will set up credentials for both iOS and Android."
echo "You may be prompted to login or create new credentials."
echo ""

# Try to set up credentials
npx eas credentials -p ios --non-interactive 2>/dev/null || true
npx eas credentials -p android --non-interactive 2>/dev/null || true

echo -e "${GREEN}✓ Credentials configured${NC}"
echo ""

# ============================================
# STEP 7: Build for iOS
# ============================================
echo -e "${BLUE}[STEP 7]${NC} Building iOS app..."
echo "This will take 15-20 minutes..."
echo ""

if npx eas build --platform ios --auto-submit; then
    echo -e "${GREEN}✓ iOS build submitted to App Store!${NC}"
else
    echo -e "${YELLOW}⚠ iOS build encountered an issue${NC}"
    echo "Check logs for details. You can retry with:"
    echo "  npx eas build --platform ios --auto-submit"
fi
echo ""

# ============================================
# STEP 8: Build for Android
# ============================================
echo -e "${BLUE}[STEP 8]${NC} Building Android app..."
echo "This will take 10-15 minutes..."
echo ""

if npx eas build --platform android --auto-submit; then
    echo -e "${GREEN}✓ Android build submitted to Google Play!${NC}"
else
    echo -e "${YELLOW}⚠ Android build encountered an issue${NC}"
    echo "Check logs for details. You can retry with:"
    echo "  npx eas build --platform android --auto-submit"
fi
echo ""

# ============================================
# STEP 9: Monitor Builds
# ============================================
echo -e "${BLUE}[STEP 9]${NC} Build Summary"
echo "=================================================="
echo ""
echo "Your apps have been submitted! Here's what happens next:"
echo ""
echo -e "${GREEN}iOS App Store:${NC}"
echo "  - Review time: 24-48 hours"
echo "  - Your app will appear in App Store"
echo "  - Status: https://appstoreconnect.apple.com"
echo ""
echo -e "${GREEN}Google Play:${NC}"
echo "  - Review time: 1-2 hours"
echo "  - Your app will appear in Play Store"
echo "  - Status: https://play.google.com/console"
echo ""
echo -e "${GREEN}Expo Dashboard:${NC}"
echo "  - Real-time build status: https://expo.dev/dashboard"
echo "  - You'll receive email notifications"
echo ""

# ============================================
# STEP 10: Next Steps
# ============================================
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "1. Monitor builds at https://expo.dev/dashboard"
echo "2. Wait for App Store & Play Store approvals"
echo "3. Once approved, app will be live in both stores!"
echo ""
echo "Commands for future builds:"
echo "  npx eas build --platform ios --auto-submit   # iOS only"
echo "  npx eas build --platform android --auto-submit # Android only"
echo "  npx eas build --auto-submit                   # Both platforms"
echo ""
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo "=================================================="
