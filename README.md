# ProposalFast Mobile App

Production-ready React Native + Expo mobile app for iOS & Android.

## 📁 Folder Structure

```
proposalfast-mobile-clean/
├── App.tsx                    # Main app entry point
├── app.json                   # Expo configuration
├── eas.json                   # EAS build configuration
├── package.json               # Dependencies
├── deploy-to-stores.sh        # Deployment script
├── DEPLOY_NOW.md              # Deployment guide
└── src/
    ├── screens/               # 8 complete screens
    │   ├── auth/             # Login, SignUp
    │   ├── main/             # Dashboard, Contracts, Proposals, Payments, Profile
    │   └── details/          # Detail screens
    ├── services/             # API, notifications, camera, Stripe
    ├── store/                # Zustand stores (auth, offline)
    ├── components/           # ErrorBoundary, LoadingSpinner
    └── utils/                # Constants, validators, formatters
```

## 🚀 Quick Deploy

```bash
cd proposalfast-mobile-clean

# Install dependencies
npm install

# Deploy to both app stores
bash deploy-to-stores.sh
```

## 📋 What's Included

✅ All 8 screens (auth, dashboard, contracts, proposals, payments, details)
✅ API client with axios
✅ State management (Zustand)
✅ Push notifications
✅ Camera integration
✅ Stripe payments
✅ Offline mode
✅ Error handling & loading states
✅ Form validation
✅ Production-ready

## 🎯 Deploy

See `DEPLOY_NOW.md` for step-by-step deployment instructions.

