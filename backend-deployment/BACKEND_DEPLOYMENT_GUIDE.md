# 🚀 Backend API Deployment Guide - app.proposalfast.ai

**Subdomain:** app.proposalfast.ai  
**Type:** Node.js Express API Server  
**Port:** 3001 (internal) → HTTPS (external)  
**Status:** Production Ready  
**Date:** October 2025  

---

## 📋 OVERVIEW

This backend handles:
- ✅ Contract generation (OpenAI integration)
- ✅ e-Signature requests (SignWell integration)
- ✅ Payment processing (Stripe webhooks)
- ✅ User authentication (Clerk integration)
- ✅ Database operations (Supabase)
- ✅ Email notifications (Resend)

---

## 🏗️ BUILD COMMANDS

**Your build configuration:**

```bash
# Install dependencies
npm install

# Build (if needed)
npm run build

# Start server
npm start

# Or use PM2
npm install -g pm2
pm2 start ecosystem.config.js
```

**Port:** 3001 (reverse proxy to HTTPS)

---

## 📍 DNS CONFIGURATION

### **Required DNS Record**

```
Host:    app
Type:    A Record
Value:   199.188.200.91
TTL:     3600
```

**Add in Namecheap:**
1. Domain: proposalfast.ai → Manage
2. Advanced DNS
3. Add Record: app → A Record → 199.188.200.91
4. Save

**Wait 5-10 minutes for propagation**

---

## 🔐 ENVIRONMENT VARIABLES

### **Critical Secrets (Keep Private!)**

```
OPENAI_API_KEY              # Contract generation
STRIPE_SECRET_KEY           # Payment processing
STRIPE_WEBHOOK_SECRET       # Webhook verification
SIGNWELL_API_KEY            # E-signatures
SUPABASE_SERVICE_KEY        # Database access
CLERK_API_KEY               # Authentication
RESEND_API_KEY              # Email service
```

### **Non-Sensitive Configuration**

```
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=info
CORS_ORIGINS=https://proposalfast.ai,https://www.proposalfast.ai
```

---

## 📤 DEPLOYMENT STEPS

### **STEP 1: Prepare Subdomain (5 min)**

1. Add DNS record in Namecheap:
   ```
   Host: app
   Type: A Record
   Value: 199.188.200.91
   ```

2. Wait for DNS propagation (5-10 min)

3. Verify DNS resolved:
   ```bash
   nslookup app.proposalfast.ai
   # Should show: 199.188.200.91
   ```

---

### **STEP 2: Upload Backend Files (3-5 min)**

**Using SCP:**
```bash
# Create backend directory on server
ssh -p 21098 propvrtv@199.188.200.91 "mkdir -p ~/app.proposalfast.ai"

# Upload backend files
scp -P 21098 -r backend-deployment/* propvrtv@199.188.200.91:~/app.proposalfast.ai/

# Upload api.js (your backend)
scp -P 21098 api.js propvrtv@199.188.200.91:~/app.proposalfast.ai/

# Upload package.json
scp -P 21098 package.json propvrtv@199.188.200.91:~/app.proposalfast.ai/
```

---

### **STEP 3: Setup Environment Variables (2 min)**

**SSH into server:**
```bash
ssh -p 21098 propvrtv@199.188.200.91
cd ~/app.proposalfast.ai
```

**Create .env file:**
```bash
cp .env.example .env
nano .env
```

**Add your secrets:**
```
OPENAI_API_KEY=sk-proj-your-actual-key
STRIPE_SECRET_KEY=sk_live_your-actual-key
SIGNWELL_API_KEY=your-actual-key
SUPABASE_URL=your-url
SUPABASE_SERVICE_KEY=your-key
CLERK_API_KEY=your-key
RESEND_API_KEY=your-key
```

**Save & exit:** Ctrl+X, Y, Enter

---

### **STEP 4: Install & Build (3-5 min)**

```bash
# Still SSH'd into server
cd ~/app.proposalfast.ai

# Install dependencies
npm install

# Build (if needed)
npm run build

# Create logs directory
mkdir -p logs
```

---

### **STEP 5: Start with PM2 (1 min)**

```bash
# Install PM2 globally (if not already)
npm install -g pm2

# Start the backend
pm2 start ecosystem.config.js

# Save PM2 configuration (auto-restart on reboot)
pm2 startup
pm2 save

# Verify it's running
pm2 status

# Should show:
# ┌──────────────────┬─────┬─────────┬──────┬──────┐
# │ id │ name           │ mode │ ↺  │ status │
# ├──────────────────┼─────┼─────────┼──────┼──────┤
# │ 0  │ proposalfast-api│ cluster│ 0  │ online │
# └──────────────────┴─────┴─────────┴──────┴──────┘
```

---

### **STEP 6: Configure Reverse Proxy in cPanel (2-3 min)**

**In cPanel:**
1. Go to: **Apache Handlers** or **Reverse Proxy Manager**
2. Create new proxy route:
   ```
   Domain:  app.proposalfast.ai
   Target:  http://127.0.0.1:3001/
   Protocol: HTTP
   ```
3. Click **Save**

**Wait 1-2 minutes for changes to take effect**

---

### **STEP 7: Verify Backend is Live (2 min)**

**Health Check Endpoint:**
```bash
# Test from your computer
curl -I https://app.proposalfast.ai/health

# Should return:
# HTTP/1.1 200 OK
# Content-Type: application/json

# Full response:
curl https://app.proposalfast.ai/health

# Should show:
# {
#   "status": "ok",
#   "hasApiKey": true,
#   "mode": "OpenAI"
# }
```

**Check HTTPS works:**
- Visit: `https://app.proposalfast.ai/health` in browser
- Should see green padlock
- Should see JSON response

---

## ✅ COMPLETE VERIFICATION CHECKLIST

```
DNS:
☐ nslookup app.proposalfast.ai shows 199.188.200.91
☐ Wait 5-10 minutes

DEPLOYMENT:
☐ SSH into server works
☐ Files uploaded to ~/app.proposalfast.ai/
☐ .env created with all secrets filled
☐ npm install completed
☐ npm run build completed

RUNNING:
☐ pm2 status shows "online"
☐ No errors in: pm2 logs proposalfast-api

HTTPS/SSL:
☐ curl https://app.proposalfast.ai/health works
☐ Green padlock in browser
☐ No certificate errors

HEALTH CHECK:
☐ GET /health returns 200 OK
☐ Response shows: { status: "ok", hasApiKey: true, mode: "OpenAI" }

ENDPOINTS READY:
☐ POST /api/generate-contract (contract generation)
☐ POST /api/send-to-signwell (e-signature)
☐ GET /health (health check)
```

---

## 🔌 API ENDPOINTS

### **Health Check**
```bash
GET https://app.proposalfast.ai/health

Response:
{
  "status": "ok",
  "hasApiKey": true,
  "mode": "OpenAI"
}
```

### **Generate Contract**
```bash
POST https://app.proposalfast.ai/api/generate-contract

Body:
{
  "contractType": "service",
  "clientName": "Acme Inc",
  "freelancerName": "John Doe",
  "projectScope": "Web development project",
  "budget": "$5000",
  "timeline": "30 days"
}

Response:
{
  "contract": "SERVICE AGREEMENT\nDated: 10/20/2025\n..."
}
```

### **Send to SignWell**
```bash
POST https://app.proposalfast.ai/api/send-to-signwell

Body:
{
  "contractText": "CONTRACT TEXT HERE",
  "contractName": "Service Agreement",
  "recipients": [
    { "name": "John Doe", "email": "john@example.com" },
    { "name": "Jane Smith", "email": "jane@example.com" }
  ]
}

Response:
{
  "success": true,
  "documentId": "123456",
  "signingUrl": "https://www.signwell.com/documents/123456/",
  "message": "Contract sent to SignWell for signing"
}
```

---

## 📊 MONITORING

### **Check Status**
```bash
ssh -p 21098 propvrtv@199.188.200.91 "pm2 status"
```

### **View Logs**
```bash
ssh -p 21098 propvrtv@199.188.200.91 "pm2 logs proposalfast-api"

# Last 100 lines:
ssh -p 21098 propvrtv@199.188.200.91 "pm2 logs proposalfast-api --lines 100"
```

### **Monitor CPU/Memory**
```bash
ssh -p 21098 propvrtv@199.188.200.91 "pm2 monit"
```

### **Restart**
```bash
ssh -p 21098 propvrtv@199.188.200.91 "pm2 restart proposalfast-api"
```

---

## 🔄 UPDATING THE BACKEND

### **When You Make Code Changes:**

```bash
# 1. Upload new api.js
scp -P 21098 api.js propvrtv@199.188.200.91:~/app.proposalfast.ai/

# 2. SSH into server
ssh -p 21098 propvrtv@199.188.200.91
cd ~/app.proposalfast.ai

# 3. Reinstall (if package changes)
npm install

# 4. Rebuild (if needed)
npm run build

# 5. Restart PM2
pm2 restart proposalfast-api

# 6. Verify
pm2 logs proposalfast-api

# 7. Test
curl https://app.proposalfast.ai/health
```

---

## 🆘 TROUBLESHOOTING

### **Health check returns 502 Bad Gateway**

```bash
# Check if PM2 process is running
ssh -p 21098 propvrtv@199.188.200.91 "pm2 status"

# View logs
ssh -p 21098 propvrtv@199.188.200.91 "pm2 logs proposalfast-api"

# Manual start
ssh -p 21098 propvrtv@199.188.200.91 << 'EOF'
cd ~/app.proposalfast.ai
node api.js
EOF

# Should show: ✓ API server running on port 3001
```

### **Port 3001 already in use**

```bash
ssh -p 21098 propvrtv@199.188.200.91 << 'EOF'
# Find process using port 3001
lsof -i :3001

# Kill it
kill -9 <PID>

# Restart PM2
pm2 restart proposalfast-api
EOF
```

### **Environment variables not loaded**

```bash
# Verify .env exists
ssh -p 21098 propvrtv@199.188.200.91 "cat ~/app.proposalfast.ai/.env"

# Check NODE_ENV
ssh -p 21098 propvrtv@199.188.200.91 "echo $NODE_ENV"

# Should show: production
```

### **OpenAI API key not working**

```bash
# Test the key
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Check logs for errors
ssh -p 21098 propvrtv@199.188.200.91 "pm2 logs proposalfast-api | grep -i error"

# Verify key is set in .env
ssh -p 21098 propvrtv@199.188.200.91 "grep OPENAI_API_KEY ~/app.proposalfast.ai/.env"
```

---

## 🔐 SECURITY BEST PRACTICES

### **Environment Variables**
- ✅ Never commit `.env` to git
- ✅ Use `.env.example` without secrets
- ✅ Rotate API keys quarterly
- ✅ Use separate keys for dev/prod
- ✅ Monitor API usage for suspicious activity

### **Access Control**
- ✅ SSH uses custom port 21098
- ✅ Backend only accessible via reverse proxy
- ✅ CORS restricted to your domains
- ✅ API keys never logged

### **Monitoring**
- ✅ Monitor logs daily
- ✅ Set up alerts for errors
- ✅ Track API usage/costs
- ✅ Regular backups of secrets

---

## 📞 SUPPORT

**Quick Commands Reference:**
```bash
# SSH access
ssh -p 21098 propvrtv@199.188.200.91

# Navigate to backend
cd ~/app.proposalfast.ai

# Check status
pm2 status

# View logs
pm2 logs proposalfast-api

# Restart
pm2 restart proposalfast-api

# Test health
curl https://app.proposalfast.ai/health
```

---

## ✅ YOU'RE READY!

**Status:** ✅ Production Ready

**Next Steps:**
1. Add DNS record (5 min)
2. Upload files (5 min)
3. Setup environment (2 min)
4. Start PM2 (1 min)
5. Configure reverse proxy (3 min)
6. Test health endpoint (1 min)

**Total Time:** ~20 minutes

**Result:** Secure backend API running on app.proposalfast.ai ✅

---

**ProposalFast Backend API**  
**Production Deployment**  
**October 2025**
