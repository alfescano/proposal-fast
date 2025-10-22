# 🌐 DNS Setup for app.proposalfast.ai Subdomain

**Subdomain:** app.proposalfast.ai  
**Type:** A Record (same server as root)  
**Status:** Ready to Configure  

---

## 📋 DNS RECORD NEEDED

### **Single Record for Subdomain**

| Record Type | Host | Value | TTL | Purpose |
|------------|------|-------|-----|---------|
| **A** | app | 199.188.200.91 | 3600 | Routes app.proposalfast.ai to backend |

---

## 🔧 HOW TO ADD IN NAMECHEAP

### **Step 1: Login to Namecheap**
- Go to: https://www.namecheap.com
- Dashboard → Domains → proposalfast.ai
- Click: **Manage**

### **Step 2: Go to Advanced DNS**
- Tab: **Advanced DNS**

### **Step 3: Add Subdomain Record**

Click **Add Record** and fill in:
```
Host:    app
Type:    A Record
Value:   199.188.200.91
TTL:     3600
```

Click **Save** ✅

---

## ✅ VERIFICATION

After adding DNS record (wait 5-10 min for propagation):

```bash
# Test DNS resolution
nslookup app.proposalfast.ai
# Should show: 199.188.200.91

# Test with ping
ping app.proposalfast.ai
# Should respond

# Test with curl
curl -I https://app.proposalfast.ai/health
# Should show: HTTP/1.1 200 OK
```

---

## 🔒 SSL/HTTPS for Subdomain

**Good news:** HTTPS works automatically!

- ✅ Namecheap AutoSSL covers subdomains
- ✅ Certificate includes: *.proposalfast.ai
- ✅ HTTPS enabled for app.proposalfast.ai automatically
- ✅ No additional configuration needed

**Verify SSL:**
```bash
curl -I https://app.proposalfast.ai/health
# Should show: HTTP/1.1 200 OK
# Green padlock in browser
```

---

## 📊 DNS SETUP SUMMARY

**Your domain structure:**

```
proposalfast.ai (root)
├── A Record: @ → 199.188.200.91
│   └── Serves: Static frontend
│
└── app.proposalfast.ai (subdomain)
    └── A Record: app → 199.188.200.91
        └── Serves: Node.js backend API

Both use HTTPS automatically ✅
```

---

## 🆘 TROUBLESHOOTING

### **DNS not resolving?**
```bash
# Clear cache and retry
ipconfig /flushdns  # Windows
sudo dscacheutil -flushcache  # Mac

# Check propagation globally
# https://www.whatsmydns.net/?type=A&query=app.proposalfast.ai
```

### **HTTPS shows certificate error?**
```bash
# Wait 15-20 minutes for AutoSSL to issue
# Refresh browser cache (Ctrl+Shift+R)
# Check cPanel → SSL/TLS Status
```

### **Backend not responding?**
```bash
# SSH and check if running
ssh -p 21098 propvrtv@199.188.200.91
cd ~/app.proposalfast.ai
pm2 status
pm2 logs proposalfast-api
```

---

## ✨ DONE!

Your subdomain is ready:
- ✅ DNS configured
- ✅ HTTPS enabled
- ✅ Backend deployment ready

**Next:** Follow BACKEND_DEPLOYMENT_GUIDE.md

---

**ProposalFast Backend Subdomain**  
**October 2025**
