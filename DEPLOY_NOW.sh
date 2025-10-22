#!/bin/bash

#############################################################################
# ProposalFast.ai - ONE COMMAND DEPLOYMENT
# Version: 2.0 | Date: October 19, 2025
# Status: Production Ready
#############################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Banner
clear
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     ProposalFast.ai - ONE COMMAND DEPLOYMENT                  ║"
echo "║     Version 2.0 | Production Ready                            ║"
echo "║     © 2025 ProposalFast                                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Menu
echo ""
echo -e "${YELLOW}Choose deployment method:${NC}"
echo ""
echo "1) SSH (Fastest - requires SSH access)"
echo "2) cPanel (via FTP credentials)"
echo "3) Manual (download & upload yourself)"
echo "4) Docker (for cloud deployment)"
echo "5) Vercel (one-click deployment)"
echo ""
read -p "Select option (1-5): " option

case $option in
    1)
        echo ""
        echo -e "${BLUE}SSH Deployment${NC}"
        echo "──────────────────────────────────────────────────────────────"
        echo ""
        read -p "Enter SSH host (e.g., proposalfast.ai): " ssh_host
        read -p "Enter SSH username: " ssh_user
        read -p "Enter destination path (e.g., public_html/proposalfast.ai): " dest_path
        
        echo ""
        echo -e "${YELLOW}Uploading via SSH...${NC}"
        
        # Backup existing files
        echo -e "${BLUE}Creating backup...${NC}"
        ssh "${ssh_user}@${ssh_host}" "cd ${dest_path} && tar -czf backup-$(date +%s).tar.gz . 2>/dev/null || true"
        
        # Upload files
        echo -e "${BLUE}Uploading files...${NC}"
        scp -r upload-package/* "${ssh_user}@${ssh_host}:~/${dest_path}/"
        
        # Set permissions
        echo -e "${BLUE}Setting permissions...${NC}"
        ssh "${ssh_user}@${ssh_host}" "cd ${dest_path} && chmod 644 .htaccess index.html robots.txt *.png && chmod 755 assets && chmod 644 assets/*"
        
        echo ""
        echo -e "${GREEN}✅ SSH deployment complete!${NC}"
        echo ""
        echo "Verify at: https://${ssh_host}/"
        ;;
        
    2)
        echo ""
        echo -e "${BLUE}FTP/cPanel Deployment${NC}"
        echo "──────────────────────────────────────────────────────────────"
        echo ""
        echo "Using cPanel File Manager (manual):"
        echo ""
        echo "1. Login to cPanel: https://your-cpanel-url.com:2083"
        echo "2. Open File Manager"
        echo "3. Navigate to: public_html/proposalfast.ai"
        echo "4. Enable 'Show Hidden Files' (Settings)"
        echo "5. Delete all existing files"
        echo "6. Upload ALL files from: upload-package/"
        echo ""
        echo -e "${YELLOW}Important:${NC}"
        echo "  • Make sure .htaccess is uploaded"
        echo "  • Upload assets/ folder completely"
        echo "  • Keep directory structure intact"
        echo ""
        read -p "Press Enter after uploading..."
        
        echo ""
        echo -e "${BLUE}Verifying deployment...${NC}"
        read -p "Enter your domain (e.g., proposalfast.ai): " domain
        
        # Quick verification
        if curl -s "https://${domain}/" | grep -q "ProposalFast"; then
            echo -e "${GREEN}✅ Site is live!${NC}"
        else
            echo -e "${YELLOW}⚠️  Verify manually at: https://${domain}/${NC}"
        fi
        ;;
        
    3)
        echo ""
        echo -e "${BLUE}Manual Download & Upload${NC}"
        echo "──────────────────────────────────────────────────────────────"
        echo ""
        echo "1. Download: upload-package/ folder"
        echo "2. Via cPanel File Manager:"
        echo "   - Show hidden files (.htaccess)"
        echo "   - Upload all files to: public_html/proposalfast.ai/"
        echo "3. Verify: https://proposalfast.ai/"
        echo ""
        echo "📖 For detailed instructions, see: UPLOAD_INSTRUCTIONS.md"
        echo ""
        echo "Need help? Check: READY_TO_LAUNCH.md"
        ;;
        
    4)
        echo ""
        echo -e "${BLUE}Docker Deployment${NC}"
        echo "──────────────────────────────────────────────────────────────"
        echo ""
        echo "Building Docker image..."
        
        if ! command -v docker &> /dev/null; then
            echo -e "${RED}❌ Docker not installed${NC}"
            exit 1
        fi
        
        # Build Docker image
        docker build -t proposalfast:latest -f - . << 'EOF'
FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "server"]
EOF
        
        echo ""
        echo -e "${GREEN}✅ Docker image built: proposalfast:latest${NC}"
        echo ""
        echo "Run with:"
        echo "  docker run -p 3000:80 proposalfast:latest"
        echo ""
        echo "Or deploy to:"
        echo "  • Railway.app"
        echo "  • Render.com"
        echo "  • AWS ECS"
        echo "  • Google Cloud Run"
        ;;
        
    5)
        echo ""
        echo -e "${BLUE}Vercel One-Click Deployment${NC}"
        echo "──────────────────────────────────────────────────────────────"
        echo ""
        echo "Click this link to deploy on Vercel:"
        echo ""
        echo "https://vercel.com/new/clone?repository-url=https://github.com/YOUR_REPO"
        echo ""
        echo "Or push to GitHub and connect Vercel:"
        echo "1. Commit code to GitHub repo"
        echo "2. Visit: https://vercel.com/new"
        echo "3. Import your repository"
        echo "4. Deploy"
        echo ""
        echo -e "${YELLOW}Note:${NC} Configure environment variables in Vercel dashboard"
        ;;
        
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

# Post-deployment
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}NEXT STEPS:${NC}"
echo ""
echo "✅ Deployment complete!"
echo ""
echo "Week 1 - Verify:"
echo "  [ ] Visit https://proposalfast.ai/"
echo "  [ ] Test all pages (/pricing, /terms, /privacy, /refund)"
echo "  [ ] Check mobile responsiveness"
echo "  [ ] No console errors"
echo ""
echo "Week 2 - Setup Services:"
echo "  [ ] Configure Supabase (database)"
echo "  [ ] Setup Clerk (authentication)"
echo "  [ ] Connect Stripe (payments)"
echo "  [ ] Setup Resend (email)"
echo ""
echo "Week 3 - Enhancements:"
echo "  [ ] Setup WhatsApp chatbot (Twilio)"
echo "  [ ] Deploy onboarding modals"
echo "  [ ] Produce landing video"
echo "  [ ] Generate brand assets"
echo ""
echo "📖 Full guides:"
echo "  • UPLOAD_INSTRUCTIONS.md - Detailed upload steps"
echo "  • CHATBOT_ONBOARDING_INTEGRATION_GUIDE.md - Setup guides"
echo "  • VIDEO_PRODUCTION_GUIDE.md - Video production"
echo "  • AI_BRAND_KIT_VISUAL_PROMPTS.md - Brand generation"
echo ""
echo "💬 Need help? Contact: support@proposalfast.ai"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
