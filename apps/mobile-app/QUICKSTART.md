# Quick Start Guide - Mobile App with Production API

## ✅ What Was Done
Updated mobile app to connect to production API at **https://hostshield.org/api**

## 🚀 How to Run

### Option 1: Production Mode (Default)
```bash
cd /Users/boris/git-repos/host-shield/apps/mobile-app
npm start
```
Then scan QR code with Expo Go app.

### Option 2: Local Development
```bash
# Create .env file
cp .env.example .env

# Edit .env and set your local IP
# EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api

npm start
```

## 📋 Files Changed
- ✅ `src/config.js` - API URL updated to `https://hostshield.org/api`
- ✅ `.env.example` - Environment configuration template
- ✅ Documentation files created

## 🔍 Quick Test
1. Start the app
2. Login with your production credentials
3. Try scanning a document
4. Check guest list

## 📚 Documentation
- `MOBILE_APP_UPDATE.md` - Complete summary
- `API_UPDATE_README.md` - Detailed guide
- `UPDATE_SUMMARY.md` - Technical details

## ⚠️ Important Notes
- Uses **HTTPS** for production (secure)
- Never use `localhost` on physical devices
- Token stored securely in Expo SecureStore
- All endpoints compatible with web client

## 🆘 Issues?
Check `API_UPDATE_README.md` troubleshooting section.
