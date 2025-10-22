# ⚡ QUICK START - Backend Deployment to app.proposalfast.ai

**Time:** 20 minutes  
**Status:** Production Ready  

---

## 🚀 5-STEP DEPLOYMENT

### **STEP 1: DNS (5 min)**
```
Namecheap → proposalfast.ai → Advanced DNS
Add Record:
  Host: app
  Type: A Record
  Value: 199.188.200.91
  TTL: 3600
Save ✅

Wait 5-10 minutes
```

### **STEP 2: Upload (3 min)**
```bash
# Create directory
ssh -p 21098 propvrtv@199.188.200.91 "mkdir -p ~/app.proposalfast.ai"

# Upload backend
scp -P 21098 api.js propvrtv@199.188.200.91:~/app.proposalfast.ai/
scp -P 21098 package.json propvrtv@199.188.200.91:~/app.proposalfast.ai/
scp -P 21098 backend-deployment/* propvrtv@199.188.200.91:~/app.proposalfast.ai/
```

### **STEP 3: Setup Environment (2 min)**
```bash
ssh -p 21098 propvrtv@199.188.200.91
cd ~/app.proposalfast.ai

cp .env.example .env
nano .env

# Add secrets:
# OPENAI_API_KEY=sk-proj-your-key
# STRIPE_SECRET_KEY=sk_live_your-key
# SIGNWELL_API_KEY=your-key
# etc.

# Save: Ctrl+X, Y, Enter
```

### **STEP 4: Install & Start (5 min)**
```bash
# Still SSH'd in
npm install
npm run build
mkdir -p logs

npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save

pm2 status  # Should show "online"
```

### **STEP 5: Configure Reverse Proxy (3 min)**
```
cPanel → Apache Handlers (or Reverse Proxy)
Add:
  Domain: app.proposalfast.ai
  Target: http://127.0.0.1:3001/
Save ✅

Wait 1-2 minutes
```

---

## ✅ VERIFY

```bash
# Test health endpoint
curl -I https://app.proposalfast.ai/health

# Should return: HTTP/1.1 200 OK

# Full response
curl https://app.proposalfast.ai/health

# Should show:
# {
#   "status": "ok",
#   "hasApiKey": true,
#   "mode": "OpenAI"
# }
```

---

## 🎯 DONE!

Your backend API is live at: **https://app.proposalfast.ai**

---

## 📋 Useful Commands

```bash
# Check status
ssh -p 21098 propvrtv@199.188.200.91 "pm2 status"

# View logs
ssh -p 21098 propvrtv@199.188.200.91 "pm2 logs proposalfast-api"

# Restart
ssh -p 21098 propvrtv@199.188.200.91 "pm2 restart proposalfast-api"

# Test endpoint
curl https://app.proposalfast.ai/health
```

---

**Status:** ✅ Production Ready  
**Time to Deploy:** 20 minutes  

**Let's go live!** 🚀
