# Mobile App Build & Deployment Instructions

## Prerequisites

1.  **Node.js**: Ensure Node.js is installed.
2.  **Expo CLI**: Install with `npm install -g eas-cli`.
3.  **Expo Account**: You need an account at [expo.dev](https://expo.dev) for EAS Build.

## 1. Installation

Install project dependencies:

```bash
cd apps/mobile-app
npm install
```

## 2. Generating an APK (Android)

To generate an installable APK file for Android without submitting to the store:

```bash
eas build --platform android --profile preview
```

-   Follow the prompts to log in to your Expo account.
-   EAS will handle the signing credentials generation (KeyStore) for you.
-   Once finished, it will provide a URL to download the `.apk` file.

## 3. Installing the APK

**On a Physical Device:**
1.  Download the `.apk` file from the link provided by EAS.
2.  Transfer it to your Android device (USB, drive, or download directly).
3.  Tap the file to install. You may need to allow "Install from unknown sources".

**On an Emulator:**
1.  Drag and drop the `.apk` file onto the Android Emulator window.

## 4. App Store & Play Store Upload

To build for production submission:

**Android (Play Store):**
```bash
eas build --platform android --profile production
```
This produces an `.aab` (Android App Bundle). Upload this file to the [Google Play Console](https://play.google.com/console).

**iOS (App Store):**
```bash
eas build --platform ios --profile production
```
-   You need a paid Apple Developer Account.
-   EAS will guide you through setting up Certificates and Provisioning Profiles.
-   The output will be an `.ipa` file (or auto-submitted if configured).

**Automated Submission:**
You can also use EAS Submit to automatically upload:
```bash
eas submit -p android
eas submit -p ios
```

## Local Development
To run the app locally:
```bash
npm start
```
Use the Expo Go app on your phone to scan the QR code.
