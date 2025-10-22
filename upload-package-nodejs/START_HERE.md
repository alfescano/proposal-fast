# 🚀 START HERE - ProposalFast.ai Node.js Deployment

**Version:** 1.0  
**Status:** ✅ Production Ready  
**Package Size:** 6.7 MB  
**Time to Deploy:** 10-15 minutes  

---

## 📍 YOU ARE HERE

You have the **complete Node.js deployment package** for Namecheap.

**Next:** Follow the 3-step deployment below.

---

## ⚡ 3-STEP DEPLOYMENT

### **STEP 1️⃣ UPLOAD (2-3 min)**

```bash
scp -r upload-package-nodejs/* user@your-domain.com:~/public_html/proposalfast.ai/
```

Or use **cPanel File Manager** → Upload folder → `/public_html/proposalfast.ai/`

---

### **STEP 2️⃣ SETUP (5-7 min)**

```bash
ssh user@your-domain.com
cd ~/public_html/proposalfast.ai
bash start.sh
```

Script will:
- ✅ Check Node.js
- ✅ Install dependencies (2-3 min)
- ✅ Build React app
- ✅ Install PM2
- ✅ Start your app
- ✅ Setup auto-restart

---

### **STEP 3️⃣ CONFIGURE (2-3 min)**

**In cPanel:**
1. Go to **Apache Handlers** or **Proxy**
2. Create route:
   - Domain: `proposalfast.ai`
   - Target: `http://127.0.0.1:3000/`
3. Save ✅

---

## ✅ VERIFY (2 min)

1. Wait 1 minute
2. Visit: `https://proposalfast.ai/`
3. Should load perfectly ✅

**Check:**
- Page loads (no white screen)
- Logo visible
- Buttons work
- F12 Console = no errors

---

## 📖 DOCUMENTATION

Read in this order:

| # | Guide | Time | What |
|---|-------|------|------|
| 1 | **QUICK_START_NODEJS.md** | 5 min | Fast reference |
| 2 | **README_NODEJS.md** | 10 min | Overview & setup |
| 3 | **NODEJS_DEPLOYMENT_GUIDE.md** | 15 min | Detailed with troubleshooting |
| 4 | **NODEJS_PACKAGE_SUMMARY.md** | 3 min | Quick facts |

---

## 📦 WHAT'S IN THIS PACKAGE

✅ **Express.js server** (server.js)  
✅ **React app** (pre-built in dist/)  
✅ **All dependencies** (package.json)  
✅ **PM2 config** (ecosystem.config.js)  
✅ **Environment setup** (.env.example)  
✅ **Startup script** (start.sh)  
✅ **4 guides** (all documentation)  

**Total:** 23 files | 6.7 MB | 100% Ready

---

## 🎯 QUICK COMMANDS

After deployment:

```bash
# Check if running
pm2 status

# View logs
pm2 logs proposalfast-ai

# Restart
pm2 restart proposalfast-ai

# Monitor CPU/Memory
pm2 monit

# Stop
pm2 stop proposalfast-ai

# Start
pm2 start ecosystem.config.js
```

---

## 🆘 QUICK TROUBLESHOOTING

### Blank page?
```bash
pm2 logs proposalfast-ai  # Check errors
curl http://127.0.0.1:3000  # Test port
```

### Port in use?
```bash
lsof -i :3000  # Find process
kill -9 <PID>  # Kill it
```

### Dependencies error?
```bash
npm install  # Reinstall
npm run build  # Rebuild
pm2 restart proposalfast-ai
```

---

## ✨ PACKAGE ADVANTAGES

**vs Static HTML:**
- ✅ Can connect to databases (Supabase)
- ✅ Can handle authentication (Clerk)
- ✅ Can process payments (Stripe)
- ✅ Can send emails (Resend)
- ✅ Can create API routes
- ✅ Auto-restart on crash
- ✅ Process monitoring
- ✅ Clustering support

---

## 🚀 READY?

**Next Steps:**
1. Run: `bash start.sh`
2. Configure reverse proxy in cPanel
3. Visit your website ✅

---

## 📞 NEED HELP?

- **Quick answers:** See "QUICK TROUBLESHOOTING" above
- **More details:** Read `NODEJS_DEPLOYMENT_GUIDE.md`
- **Just the facts:** Check `NODEJS_PACKAGE_SUMMARY.md`

---

## ✅ DEPLOYMENT CHECKLIST

```
UPLOAD:
☐ Downloaded this folder
☐ Uploaded via SCP or cPanel

SETUP:
☐ Ran: bash start.sh
☐ Installed dependencies
☐ App started with PM2

CONFIGURE:
☐ Set reverse proxy in cPanel
☐ Domain → http://127.0.0.1:3000/

VERIFY:
☐ Visit https://proposalfast.ai/
☐ Page loads
☐ No console errors
☐ pm2 status = online

LIVE:
☐ Website is live! 🎉
```

---

**Status:** ✅ Ready to Deploy  
**Time:** 10-15 minutes total  

---

## 🎉 LET'S GO!

**You have everything you need.**

1. **Upload** this folder
2. **Run** `bash start.sh`
3. **Configure** reverse proxy
4. **Visit** your website ✅

---

**ProposalFast.ai Node.js Package v1.0**  
**Production Ready**  
**October 19, 2025**

### **Deploy NOW!** 🚀

