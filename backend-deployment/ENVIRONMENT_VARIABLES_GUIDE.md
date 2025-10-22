# 🔐 Environment Variables Configuration Guide

**Status:** Ready for input  
**Location:** .env file on server  
**Security:** Encryption at rest, secret management  

---

## 📋 CRITICAL SECRETS (Add These)

### **1. OpenAI API Key** (Contract Generation)

**Where to get:**
1. Visit: https://platform.openai.com/api-keys
2. Click: "Create new secret key"
3. Copy the key (starts with `sk-proj-`)
4. ⚠️ Save it - you won't see it again!

**Add to .env:**
```
OPENAI_API_KEY=sk-proj-your-full-key-here
```

**What it does:**
- Generates professional contracts using AI
- Falls back to mock if key is missing
- Required for: POST /api/generate-contract

**Cost:**
- Pay-as-you-go (usually $0.50-$2 per contract)
- Set up billing alerts

---

### **2. Stripe Secret Key** (Payment Processing)

**Where to get:**
1. Visit: https://dashboard.stripe.com/apikeys
2. Click: "API keys"
3. Copy: "Secret key" (starts with `sk_live_`)
4. Keep this PRIVATE - it's your money!

**Add to .env:**
```
STRIPE_SECRET_KEY=sk_live_your-full-secret-key-here
```

**What it does:**
- Process payments securely
- Create checkout sessions
- Create subscription portal

**Important:**
- Use `sk_live_` for production
- Use `sk_test_` for testing
- Rotate quarterly
- Monitor for unauthorized access

---

### **3. Stripe Webhook Secret** (Added After Deployment)

**⚠️ DON'T ADD YET - We'll generate this after deployment**

**After deployment, go to:**
1. https://dashboard.stripe.com/webhooks
2. Click: "Add endpoint"
3. Endpoint URL: `https://app.proposalfast.ai/webhooks/stripe`
4. Select events: `payment_intent.succeeded`, `charge.failed`
5. Copy: "Signing secret" (starts with `whsec_`)

**Then add to .env:**
```
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here
```

**What it does:**
- Verifies incoming Stripe webhooks
- Prevents spoofed webhook requests
- Critical for security!

---

### **4. SignWell API Key** (E-Signatures)

**Where to get:**
1. Visit: https://www.signwell.com/
2. Login to your account
3. Go to: Account Settings → API
4. Copy: "API Token" (long alphanumeric string)

**Add to .env:**
```
SIGNWELL_API_KEY=your-signwell-api-token-here
```

**What it does:**
- Send contracts for electronic signatures
- Track signature requests
- Get signed documents

**Cost:**
- Usually included in SignWell subscription ($99-$299/month)

---

## 📊 DATABASE & AUTHENTICATION (Optional)

### **5. Supabase Configuration** (Database)

**Where to get:**
1. Visit: https://app.supabase.com
2. Select your project
3. Settings → API
4. Copy: "Project URL" and "Service Role Key"

**Add to .env:**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**What it does:**
- Store user data
- Manage proposals
- Track contract history

---

### **6. Clerk Authentication** (User Accounts)

**Where to get:**
1. Visit: https://dashboard.clerk.com
2. Select your application
3. Go to: API Keys
4. Copy: "Secret Key" (starts with `sk_live_`)

**Add to .env:**
```
CLERK_API_KEY=sk_live_your-clerk-secret-key-here
CLERK_WEBHOOK_SECRET=whsec_your-clerk-webhook-secret-here
```

**What it does:**
- User registration & login
- Session management
- User data sync

---

### **7. Resend API Key** (Email Service)

**Where to get:**
1. Visit: https://resend.com
2. Go to: API Keys
3. Click: "Create Key"
4. Copy the key (starts with `re_`)

**Add to .env:**
```
RESEND_API_KEY=re_your-resend-api-key-here
```

**What it does:**
- Send transactional emails
- Contract notifications
- User confirmations

**Cost:**
- Free tier: 100 emails/day
- Paid: $0.001 per email (very cheap!)

---

## ⚙️ CONFIGURATION VARIABLES (Non-Sensitive)

### **Server Configuration**
```
NODE_ENV=production          # Production mode
PORT=3001                    # Internal port
HOST=0.0.0.0                 # Listen on all interfaces
```

### **Features**
```
ENABLE_OPENAI=true           # Enable contract generation
ENABLE_SIGNWELL=true         # Enable e-signatures
ENABLE_STRIPE=true           # Enable payments
```

### **Security**
```
# Comma-separated list of allowed origins
CORS_ORIGINS=https://proposalfast.ai,https://www.proposalfast.ai

LOG_LEVEL=info               # info, warn, error, debug
```

---

## 🔒 SECURITY BEST PRACTICES

### **Never Do This:**
❌ Commit `.env` to git  
❌ Share .env file  
❌ Use same keys for dev/prod  
❌ Log API keys  
❌ Hardcode secrets in code  
❌ Use API keys in frontend  

### **Always Do This:**
✅ Keep .env in `.gitignore`  
✅ Use `.env.example` without secrets  
✅ Rotate keys quarterly  
✅ Use separate keys for dev/prod  
✅ Monitor API usage  
✅ Set up billing alerts  
✅ Enable 2FA on all services  
✅ Review API permissions regularly  

---

## 📝 HOW TO ADD ENVIRONMENT VARIABLES

### **SSH into Server:**
```bash
ssh -p 21098 propvrtv@199.188.200.91
cd ~/app.proposalfast.ai
```

### **Edit .env File:**
```bash
nano .env
```

### **Add Your Secrets:**
```
# Copy-paste each secret on its own line
OPENAI_API_KEY=sk-proj-your-key-here
STRIPE_SECRET_KEY=sk_live_your-key-here
SIGNWELL_API_KEY=your-key-here
SUPABASE_URL=https://your-project.supabase.co
# etc.
```

### **Save File:**
- Press: `Ctrl+X`
- Press: `Y` (yes)
- Press: `Enter` (confirm filename)

### **Restart Backend:**
```bash
pm2 restart proposalfast-api
pm2 logs proposalfast-api
```

### **Verify:**
```bash
curl https://app.proposalfast.ai/health

# Should show:
# {
#   "status": "ok",
#   "hasApiKey": true,     # Now true if OPENAI_API_KEY is set
#   "mode": "OpenAI"       # Or "Mock" if key missing
# }
```

---

## 🎯 SETUP CHECKLIST

### **Before Going Live:**

```
SECRETS TO GET:
☐ OpenAI API Key (sk-proj-...)
☐ Stripe Secret Key (sk_live_...)
☐ SignWell API Token
☐ Supabase Project URL & Keys (optional)
☐ Clerk API Key (optional)
☐ Resend API Key (optional)

SETUP:
☐ SSH into server
☐ Edit .env file
☐ Add all your secrets
☐ Save & close nano
☐ Restart PM2: pm2 restart proposalfast-api
☐ Verify: curl https://app.proposalfast.ai/health

BILLING & MONITORING:
☐ Add payment method to OpenAI
☐ Add payment method to Stripe
☐ Set up billing alerts
☐ Enable 2FA on all services

READY TO GO:
☐ All secrets added
☐ Health check returns 200
☐ No error logs
☐ Backend responding
```

---

## 💡 COST ESTIMATION

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| **OpenAI** | 100 contracts | $50-100 |
| **Stripe** | $10k transactions | $300-500 |
| **SignWell** | Included | $99-299 |
| **Supabase** | 1GB storage | $25 |
| **Resend** | 1000 emails | $1 |
| **Total** | | ~$500-1200 |

*Adjust based on your usage*

---

## 🆘 TROUBLESHOOTING

### **Health check shows hasApiKey: false**
```bash
# Your OPENAI_API_KEY is not set
# Edit .env and add it
nano ~/app.proposalfast.ai/.env

# Then restart
pm2 restart proposalfast-api
```

### **"Invalid API Key" Error**
```bash
# Double-check the key:
# 1. Copy from the source again (fresh)
# 2. Check for extra spaces/characters
# 3. Verify it's the SECRET key, not public key
# 4. Make sure NODE_ENV=production

# View current value:
cat ~/app.proposalfast.ai/.env | grep OPENAI
```

### **"Permission Denied" Error**
```bash
# Your API key may not have the right permissions
# Go to service dashboard and check:
# - Key is active
# - Key has correct scopes/permissions
# - Key is not revoked
# - Key has not been replaced
```

### **Contract Generation Fails**
```bash
# Check logs
pm2 logs proposalfast-api

# Common issues:
# 1. OPENAI_API_KEY not set
# 2. API quota exceeded
# 3. Model not available

# Fallback: API uses mock generator if OpenAI fails
```

---

## ✨ WHAT'S NEXT

After adding environment variables:

1. ✅ Backend is live and responding
2. ✅ All API secrets configured
3. ✅ Ready for frontend integration
4. ✅ Ready for webhook integration

**Frontend Integration:**
```javascript
// From frontend, call backend API
fetch('https://app.proposalfast.ai/api/generate-contract', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contractType: 'service',
    clientName: 'Acme Inc',
    freelancerName: 'John Doe',
    projectScope: 'Web development',
    budget: '$5000',
    timeline: '30 days'
  })
})
```

---

## 📞 REFERENCE

**Environment Variables File:** `~/.app.proposalfast.ai/.env`

**Edit command:**
```bash
ssh -p 21098 propvrtv@199.188.200.91
cd ~/app.proposalfast.ai
nano .env
```

**Service APIs:**
- OpenAI: https://platform.openai.com/api-keys
- Stripe: https://dashboard.stripe.com/apikeys
- SignWell: https://www.signwell.com/api
- Supabase: https://app.supabase.com
- Clerk: https://dashboard.clerk.com
- Resend: https://resend.com

---

**ProposalFast Backend - Environment Variables**  
**Secure Configuration Guide**  
**October 2025**
