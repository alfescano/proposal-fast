# 🚀 Node.js Deployment Guide - Namecheap

**Status:** Production Ready  
**Version:** 1.0  
**Package:** upload-package-nodejs/  
**Date:** October 19, 2025

---

## 📋 OVERVIEW

This is a **complete Node.js package** with:
- ✅ Express server (server.js)
- ✅ React app (pre-built in dist/)
- ✅ Full dependencies (package.json)
- ✅ Environment configuration
- ✅ PM2 process manager config
- ✅ Production-ready setup

**What's Different from Static:**
- ✅ Server-side rendering capable
- ✅ Can connect to backend services (Supabase, Stripe, etc.)
- ✅ Environment variables support
- ✅ API routes possible
- ✅ Process management with PM2
- ✅ Auto-restart on crash
- ✅ Clustering support

---

## ⚙️ PREREQUISITES

Before deploying, ensure you have on Namecheap:
- ✅ Node.js 18+ installed (you said you did!)
- ✅ SSH access to your hosting account
- ✅ A domain pointed to your Namecheap server

**Check Node.js version:**
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher
```

---

## 🚀 DEPLOYMENT STEPS (15-20 minutes)

### **STEP 1: Upload Package via SSH**

```bash
# From your computer:
scp -r upload-package-nodejs/* user@your-domain.com:~/public_html/proposalfast.ai/

# Or use SFTP client (FileZilla, Cyberduck)
```

**Or via cPanel File Manager:**
1. Login to cPanel
2. Navigate to `/public_html/proposalfast.ai/`
3. Upload entire `upload-package-nodejs/` folder

---

### **STEP 2: Connect via SSH**

```bash
ssh user@your-domain.com

# Navigate to your app directory
cd ~/public_html/proposalfast.ai
```

---

### **STEP 3: Setup Environment Variables**

```bash
# Copy example to actual .env
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Set these values:**
```
NODE_ENV=production
PORT=3000
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
# ... other keys as needed
```

Save and exit (Ctrl+X, Y, Enter in nano)

---

### **STEP 4: Install Dependencies**

```bash
# Install all npm packages
npm ci
# or
npm install
```

**This will take 2-5 minutes.** Wait for it to complete.

---

### **STEP 5: Build React App (if not built)**

```bash
npm run build
```

Should see: `✓ built in X seconds`

---

### **STEP 6: Install PM2 Globally**

```bash
npm install -g pm2
```

---

### **STEP 7: Start Your App with PM2**

```bash
# Start the app
pm2 start ecosystem.config.js

# Check if running
pm2 status
pm2 logs proposalfast-ai
```

**Expected output:**
```
App "proposalfast-ai" started
│ id │ name           │ mode   │ ↺ │ status   │
├────┼────────────────┼────────┼──┼──────────┤
│ 0  │ proposalfast-ai│ cluster│ 0 │ online   │
```

---

### **STEP 8: Setup Auto-Start on Reboot**

```bash
# Generate PM2 startup script
pm2 startup

# Save PM2 process list
pm2 save

# Verify it's saved
pm2 show proposalfast-ai
```

Now app will restart automatically if server reboots!

---

### **STEP 9: Configure Reverse Proxy (cPanel)**

Your Node.js app runs on port 3000 internally. Setup cPanel to route traffic:

**In cPanel:**
1. Go to **Apache Handlers** or **Proxy**
2. Create reverse proxy:
   - Domain: proposalfast.ai
   - Proxy to: http://127.0.0.1:3000/
3. Save

Or **Using .htaccess:**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTP_HOST} ^proposalfast\.ai$ [OR]
  RewriteCond %{HTTP_HOST} ^www\.proposalfast\.ai$
  RewriteRule ^/?$ "http://127.0.0.1:3000/" [P,L]
</IfModule>
```

---

### **STEP 10: Verify It's Running**

```bash
# Check if app is responding
curl http://127.0.0.1:3000

# View logs
pm2 logs proposalfast-ai

# Check process status
pm2 status
```

---

### **STEP 11: Test in Browser**

1. Visit: `https://proposalfast.ai/`
2. Should load your React app
3. Click "Watch It in Action" (should work)
4. Visit `/pricing` (should work)
5. Open F12 Console (should have NO errors)

✅ **If it works, you're live!**

---

## 📊 PACKAGE CONTENTS

```
upload-package-nodejs/
├── server.js                  ← Express server
├── package.json               ← Dependencies
├── package-lock.json          ← Locked versions
├── ecosystem.config.js        ← PM2 configuration
├── .env.example               ← Environment template
├── NODEJS_DEPLOYMENT_GUIDE.md ← This file
├── QUICK_START_NODEJS.md      ← Quick reference
│
└── dist/                      ← React build (production)
    ├── index.html
    ├── assets/
    ├── favicon.ico
    └── ... (all built files)
```

---

## 🔧 COMMON COMMANDS

### **Managing Your App**

```bash
# Start the app
pm2 start ecosystem.config.js

# Stop the app
pm2 stop proposalfast-ai

# Restart the app
pm2 restart proposalfast-ai

# View logs
pm2 logs proposalfast-ai

# View all processes
pm2 list

# Delete from PM2
pm2 delete proposalfast-ai
```

### **Checking Status**

```bash
# SSH into server
ssh user@your-domain.com

# Check if process is running
pm2 status

# Check port is listening
netstat -tulpn | grep 3000

# Check resource usage
ps aux | grep node
```

### **Restarting After Changes**

```bash
# If you updated code/dependencies:
cd ~/public_html/proposalfast.ai

# Update code
git pull  # if using git

# Reinstall dependencies
npm ci

# Rebuild React app
npm run build

# Restart PM2
pm2 restart proposalfast-ai

# View logs
pm2 logs proposalfast-ai
```

---

## 🆘 TROUBLESHOOTING

### **Port 3000 Already in Use**

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in ecosystem.config.js and .env
```

### **App Won't Start**

```bash
# Check logs
pm2 logs proposalfast-ai

# Look for error messages
pm2 show proposalfast-ai

# Try starting manually
node server.js

# Check npm modules installed
ls -la node_modules
```

### **Dependencies Not Installed**

```bash
# Reinstall everything
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 restart proposalfast-ai
```

### **React App Not Building**

```bash
npm run build

# If error, check console output for specific issues
# Common: Missing environment variables
# Fix: Add them to .env file
```

### **Website Shows Blank Page**

```bash
# Check server logs
pm2 logs proposalfast-ai

# Verify React build exists
ls -la dist/

# Check port forwarding/reverse proxy configured
# Try accessing: curl http://127.0.0.1:3000
```

### **CORS Errors**

In `server.js`, CORS is already configured to allow requests.

If still having issues:
```bash
# View current CORS settings
grep -A 5 "cors" server.js

# Restart app
pm2 restart proposalfast-ai
```

---

## 📈 MONITORING & MAINTENANCE

### **Monitor Resource Usage**

```bash
# Watch CPU/Memory in real-time
pm2 monit

# Set max memory limit
pm2 start ecosystem.config.js --max-memory-restart 500M
```

### **View Logs**

```bash
# Real-time logs
pm2 logs proposalfast-ai

# Last 100 lines
pm2 logs proposalfast-ai --lines 100

# Save logs to file
pm2 logs proposalfast-ai > app.log
```

### **Setup Log Rotation**

```bash
# Install PM2 log rotation
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

---

## 🔐 SECURITY BEST PRACTICES

### **Environment Variables**
- ✅ Never commit `.env` to git
- ✅ Keep `.env.example` without real keys
- ✅ Rotate secrets regularly

### **Firewall**
```bash
# Only allow traffic to port 80/443, not 3000
# Configure in cPanel or server firewall

# Verify (should be blocked):
telnet your-domain.com 3000  # Should timeout
```

### **HTTPS/SSL**
- ✅ Ensure SSL certificate installed (cPanel → SSL/TLS)
- ✅ Redirect HTTP to HTTPS

### **API Rate Limiting**
Already configured in `server.js` to prevent abuse.

---

## 📊 PERFORMANCE TIPS

### **Enable Gzip Compression**
```bash
# Check if enabled in server.js
grep -i "gzip" server.js
# Should see: compression() middleware
```

### **Set Resource Limits**
```bash
# In ecosystem.config.js:
max_memory_restart: '500M'  # Restart if > 500MB RAM
```

### **Monitor Performance**
```bash
# Real-time monitoring
pm2 monit

# View process details
pm2 show proposalfast-ai
```

---

## 🎯 NEXT STEPS

### **Week 1: Monitor**
- ✅ App is live
- ✅ Monitor logs for errors
- ✅ Check uptime
- ✅ Test all pages

### **Week 2: Connect Backend**
- [ ] Setup Supabase (database)
- [ ] Setup authentication (Clerk)
- [ ] Setup payments (Stripe)
- [ ] Test payment flow

### **Week 3: Marketing**
- [ ] Produce landing video
- [ ] Setup email automation
- [ ] Begin marketing campaign

### **Week 4+: Scale**
- [ ] Monitor analytics
- [ ] Optimize performance
- [ ] Scale horizontally if needed

---

## 📝 QUICK REFERENCE CARD

```
SSH INTO SERVER:
ssh user@your-domain.com

NAVIGATE TO APP:
cd ~/public_html/proposalfast.ai

CHECK APP STATUS:
pm2 status

VIEW LOGS:
pm2 logs proposalfast-ai

RESTART APP:
pm2 restart proposalfast-ai

UPDATE & REBUILD:
git pull && npm ci && npm run build && pm2 restart proposalfast-ai

STOP APP:
pm2 stop proposalfast-ai

START APP:
pm2 start ecosystem.config.js

SETUP AUTO-RESTART:
pm2 startup && pm2 save

MONITOR IN REAL-TIME:
pm2 monit
```

---

## 📞 SUPPORT

**Common Issues:** See troubleshooting section above

**Namecheap Help:** https://www.namecheap.com/support/knowledgebase/

**Node.js Docs:** https://nodejs.org/docs/

**PM2 Docs:** https://pm2.keymetrics.io/docs

**Express.js:** https://expressjs.com/

---

## ✅ DEPLOYMENT CHECKLIST

```
PRE-DEPLOYMENT:
☐ Node.js installed (v18+)
☐ Downloaded upload-package-nodejs/
☐ SSH access ready
☐ Domain points to Namecheap server

DEPLOYMENT:
☐ Uploaded files via SCP/SFTP
☐ Set .env file with credentials
☐ Ran npm install
☐ Ran npm run build
☐ Installed PM2 globally
☐ Started app with PM2
☐ Verified PM2 startup enabled
☐ Configured reverse proxy in cPanel

VERIFICATION:
☐ App is running (pm2 status shows online)
☐ Visit https://proposalfast.ai/ → loads
☐ Click buttons → work properly
☐ F12 Console → no errors
☐ /pricing page → loads
☐ Mobile view → responsive

LIVE & MONITORING:
☐ App is live ✅
☐ Setup log monitoring (pm2 logs)
☐ Monitor daily for errors
☐ Plan Week 2 backend setup
```

---

## 🎉 YOU'RE DONE!

Your Node.js app is now **production-ready** on Namecheap!

**Advantages over static:**
✅ Can connect to databases (Supabase)  
✅ Can handle authentication (Clerk)  
✅ Can process payments (Stripe)  
✅ Can send emails (Resend)  
✅ Can create API routes  
✅ Can scale with PM2 clustering  

---

**Next:** Follow **QUICK_START_NODEJS.md** for common tasks.

**Questions?** Check troubleshooting or Namecheap support.

**Let's go live!** 🚀
