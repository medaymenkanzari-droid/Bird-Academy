# BUILD IDENTITY REPORT — BIRD ACADEMY USER (V1.2.8)

**Date**: 2026-08-11  
**Target Platform**: Android 16 (API Level 36) / Capacitor 8  

---

## 1. BUILD IDENTITY DISCOVERY & MISMATCH

### 1.1 Version Inconsistency Analysis
During forensic build analysis of version `1.2.8-MOBILE-ROOT-FIX`, a critical build mismatch was discovered between Node/Web configuration and native Android Gradle configuration:

| Configuration File | Property | Value in Repository | Expected Value | Status |
| :--- | :--- | :--- | :--- | :---: |
| `package.json` | `version` | `"1.2.8-MOBILE-ROOT-FIX"` | `"1.2.8-MOBILE-ROOT-FIX"` | 🟢 OK |
| `android/app/build.gradle` | `versionName` | `"1.2.7-MOBILE-QA"` | `"1.2.8-MOBILE-ROOT-FIX"` | 🔴 MISMATCH |
| `android/app/build.gradle` | `versionCode` | `7` | `8` | 🔴 MISMATCH |

### 1.2 Impact on Android 16 Installation
- Gradle builds native Android APK packages using parameters from `android/app/build.gradle`.
- Because `versionCode` was left at `7` (identical to version `1.2.7-MOBILE-QA`), Android OS package manager detects the newly installed APK as an identical build version (`versionCode 7`).
- As a result, Android 16 OS does **not trigger a clean application package update**, retaining cached web assets, origin storage, or rejecting full package replacement.

---

## 2. APK BINARY ARTIFACT METRICS

- **APK File Location**: `Release/Beta/Android/Bird-Academy-User-v1.2.8-MOBILE-ROOT-FIX.apk`
- **File Size**: 4,914,318 bytes (~4.68 MB)
- **SHA-256 Hash**: `F2FCBE107937E0E908E14A074F0402E8D95ED9FFF694F693B89EF0112DA7CBB8`
- **Web Build Target**: `dist_user` (Synced to `android/app/src/main/assets/public`)
- **Capacitor Configuration**: `capacitor.config.ts` (`webDir: "dist_user"`, `appId: "com.birdacademy.app"`)

---

## 3. AUDIT CONCLUSION (PHASE 1)
To ensure reliable installation and execution on physical Android 16 devices, native Gradle properties in `android/app/build.gradle` must be synchronized (`versionCode 8`, `versionName "1.2.8-MOBILE-ROOT-FIX"` or target `1.2.9`) during future build releases.
