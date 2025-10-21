# 🚀 Deploy to App Stores - ONE COMMAND!

Alfredo, deploying your ProposalFast app to iOS & Android stores is now **completely automated**!

---

## ⚡ Quick Start (5 minutes)

### **Run This ONE Command:**

```bash
cd mobile-app
bash deploy-to-stores.sh
```

**That's it!** The script handles everything automatically:
- ✅ Installs dependencies
- ✅ Verifies Expo setup
- ✅ Initializes EAS project
- ✅ Configures build credentials
- ✅ Builds iOS app → submits to App Store
- ✅ Builds Android app → submits to Google Play

---

## 📋 Prerequisites (One-Time Setup)

Before running the deploy script, you need these accounts:

### **1. Expo Account** (FREE)
- Go to https://expo.dev
- Create account with email
- Verify email

### **2. Apple Developer Account** (OPTIONAL but recommended for iOS)
- Cost: $99/year
- Go to https://developer.apple.com
- Enroll in Developer Program
- Approval takes 24-48 hours

### **3. Google Play Developer Account** (OPTIONAL but recommended for Android)
- Cost: $25 one-time
- Go to https://play.google.com/console
- Create account
- Instant access

---

## 🎯 What The Script Does

```
┌─────────────────────────────────────────────────────┐
│         AUTOMATED DEPLOYMENT PROCESS                 │
├─────────────────────────────────────────────────────┤
│ 1. Check Prerequisites (Node, npm, Expo CLI)        │
│ 2. Install NPM Dependencies                         │
│ 3. Verify Expo Login                                │
│ 4. Initialize EAS Project (if needed)               │
│ 5. Configure iOS Credentials                        │
│ 6. Configure Android Credentials                    │
│ 7. BUILD iOS App (15-20 min)                        │
│ 8. AUTO-SUBMIT to App Store                         │
│ 9. BUILD Android App (10-15 min)                    │
│ 10. AUTO-SUBMIT to Google Play                      │
│ 11. Show build status & next steps                  │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 DEPLOY NOW!

### **Step 1: Make script executable**
```bash
chmod +x mobile-app/deploy-to-stores.sh
```

### **Step 2: Run the deployment**
```bash
cd mobile-app
bash deploy-to-stores.sh
```

### **Step 3: Follow prompts**
The script will:
- Ask you to login to Expo (first time only)
- Ask for Apple credentials (if iOS)
- Ask for Google credentials (if Android)
- Build and submit automatically

---

## ⏱️ Timeline

| Step | Time | What Happens |
|------|------|-------------|
| Prerequisites | 1 min | Checks Node, npm, Expo |
| Dependencies | 2 min | Installs packages |
| EAS Init | 1 min | Creates Expo project |
| iOS Build | 15-20 min | Builds .ipa file |
| iOS Submit | 1 min | Sends to App Store |
| Android Build | 10-15 min | Builds .aab file |
| Android Submit | 1 min | Sends to Google Play |
| **TOTAL** | **~30-40 min** | Both apps submitted! |

---

## 📊 After Deployment

Your apps are now in review queues:

### **App Store (iOS)**
- Review time: 24-48 hours
- Status: https://appstoreconnect.apple.com
- You'll get email when approved
- App appears in store automatically

### **Google Play (Android)**
- Review time: 1-2 hours
- Status: https://play.google.com/console
- You'll get email when approved
- App appears in store automatically

### **Real-time Monitoring**
- Dashboard: https://expo.dev/dashboard
- View build logs: `npx eas build:list`

---

## 🔧 Troubleshooting

### **"npm: command not found"**
- Install Node.js from https://nodejs.org

### **"Expo login failed"**
```bash
npx expo logout
npx expo login
```

### **"Build failed"**
```bash
# View detailed logs
npx eas build:list
npx eas build:view <BUILD_ID>

# Retry
bash deploy-to-stores.sh
```

### **"Credentials error"**
```bash
# Reset credentials
npx eas credentials --platform ios
npx eas credentials --platform android

# Try again
bash deploy-to-stores.sh
```

---

## 📱 Assets Required

Before first build, create these files in `mobile-app/assets/`:

### **App Icon** (1024×1024 PNG)
```
mobile-app/assets/icon.png
```
- Minimum 1024x1024
- No rounded corners (system adds them)
- High quality

### **Splash Screen** (1242×2208 PNG)
```
mobile-app/assets/splash.png
```
- Launch screen
- All platforms

### **Notification Icon** (192×192 PNG - Android)
```
mobile-app/assets/notification-icon.png
```

### **Adaptive Icon** (192×192 PNG - Android)
```
mobile-app/assets/adaptive-icon.png
```
- Foreground layer only

---

## ✅ Full Deployment Checklist

```
BEFORE DEPLOY:
☐ Expo account created at https://expo.dev
☐ Apple Developer account (optional, $99/year)
☐ Google Play account (optional, $25 one-time)
☐ App icons created in mobile-app/assets/
☐ Splash screen created
☐ app.json has correct bundle IDs

RUNNING DEPLOY:
☐ chmod +x mobile-app/deploy-to-stores.sh
☐ bash mobile-app/deploy-to-stores.sh
☐ Provide credentials when prompted
☐ Wait for builds to complete

AFTER DEPLOY:
☐ Verify builds at https://expo.dev/dashboard
☐ Wait for App Store review (24-48 hrs)
☐ Wait for Play Store review (1-2 hrs)
☐ Apps go live automatically!
```

---

## 🎉 What You'll Get

After approval:

✅ **iOS App**
- Available on Apple App Store
- ~120 million daily active users
- Premium app store positioning

✅ **Android App**
- Available on Google Play
- ~100 million daily active users
- Direct distribution

✅ **Production Features**
- Offline mode
- Push notifications
- Camera document scanning
- Payments (Stripe)
- E-signatures

---

## 📞 Support

If you need help:

1. **Check logs**: `npx eas build:list`
2. **View detailed logs**: `npx eas build:view <BUILD_ID>`
3. **Expo docs**: https://docs.expo.dev
4. **EAS docs**: https://docs.expo.dev/eas

---

## 🎯 Ready?

```bash
cd mobile-app
chmod +x deploy-to-stores.sh
bash deploy-to-stores.sh
```

**Your apps will be live in 24-48 hours!** 🚀

