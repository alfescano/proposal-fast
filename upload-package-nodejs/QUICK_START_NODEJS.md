# ⚡ QUICK START - Node.js (Namecheap)

**Status:** 5-minute deployment guide

---

## 🚀 DEPLOY IN 5 MINUTES

### **1. Upload Files**
```bash
scp -r upload-package-nodejs/* user@your-domain.com:~/public_html/proposalfast.ai/
```

### **2. SSH Into Server**
```bash
ssh user@your-domain.com
cd ~/public_html/proposalfast.ai
```

### **3. Setup & Start**
```bash
# Copy environment file
cp .env.example .env

# Install dependencies (2-3 min)
npm install

# Install PM2
npm install -g pm2

# Start app
pm2 start ecosystem.config.js

# Auto-restart on reboot
pm2 startup
pm2 save

# View logs
pm2 logs
```

### **4. Configure Reverse Proxy (cPanel)**
- Go to **Apache Handlers** or **Proxy**
- Route `proposalfast.ai` → `http://127.0.0.1:3000/`
- Save

### **5. Visit Website**
- Open: `https://proposalfast.ai/`
- Should see your React app ✅

---

## 📋 COMMON COMMANDS

| Command | What It Does |
|---------|--------------|
| `pm2 status` | Show app status |
| `pm2 logs proposalfast-ai` | View live logs |
| `pm2 restart proposalfast-ai` | Restart app |
| `pm2 stop proposalfast-ai` | Stop app |
| `pm2 monit` | Monitor CPU/Memory |
| `npm run build` | Rebuild React app |

---

## 🆘 TROUBLESHOOTING

### **App Won't Start**
```bash
pm2 logs proposalfast-ai  # Check errors
node server.js            # Test manual start
```

### **Port 3000 in Use**
```bash
lsof -i :3000             # Find process
kill -9 <PID>             # Kill it
```

### **Blank Page**
```bash
# Check React build exists
ls -la dist/

# Check reverse proxy configured in cPanel
# Try: curl http://127.0.0.1:3000
```

### **Dependencies Error**
```bash
npm install               # Reinstall
npm run build            # Rebuild
pm2 restart proposalfast-ai
```

---

## ✅ VERIFY WORKING

1. ✅ Visit `https://proposalfast.ai/`
2. ✅ Page loads (no white screen)
3. ✅ Click buttons → work
4. ✅ F12 Console → no errors
5. ✅ `pm2 status` shows "online"

**If all checkmarks:** You're live! 🎉

---

## 📖 DETAILED GUIDE

See: **NODEJS_DEPLOYMENT_GUIDE.md** for full instructions

---

**Now deploy!** 🚀
