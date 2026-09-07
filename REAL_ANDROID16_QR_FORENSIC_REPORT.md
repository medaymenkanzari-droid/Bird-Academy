# REAL ANDROID 16 QR FORENSIC REPORT — V1.3.0

## 1. General Identification
- **BUILD_ID**: `BA-V1.3.0-QR-PDF-ROOTFIX`
- **versionName**: `1.3.0-MOBILE-ROOT-FIX`
- **versionCode**: `10`
- **Target OS**: Android 16 (API 36) / Capacitor WebView
- **APK SHA-256**: `FC910AB1EC52519798DE25B8FE6262AF24059AA859CBA4CE1AAC7B9E0B036F97`

---

## 2. QR Code Flow & Code Analysis

### Entry Points Verified
1. **Settings / License Status**:
   - `Settings` -> `LicenseStatusBadge` -> `LicenseActivationModal` (tab `qr`) -> `QrCodeScannerModal` -> LMSE Importer -> Validation -> License Active.
2. **First Launch Activation**:
   - `FirstLaunchActivationScreen` (tab `qr`) -> `QrCodeScannerModal` -> LMSE Importer -> Validation -> License Active.

### Diagnostic Trace Verification (QR-01 -> QR-18)
```
[QR-DIAGNOSTIC] QR-01: component mounted (BA-V1.3.0-QR-PDF-ROOTFIX)
[QR-DIAGNOSTIC] QR-02: platform detected: android
[QR-DIAGNOSTIC] QR-03: android detected: API 36 / Android 16
[QR-DIAGNOSTIC] QR-04: permission requested
[QR-DIAGNOSTIC] QR-05: permission result: granted
[QR-DIAGNOSTIC] QR-06: getUserMedia started
[QR-DIAGNOSTIC] QR-07: stream received with 1 video track
[QR-DIAGNOSTIC] QR-08: video metadata loaded
[QR-DIAGNOSTIC] QR-09: video.play completed
[QR-DIAGNOSTIC] QR-10: video dimensions valid: 1280x720
[QR-DIAGNOSTIC] QR-11: decoder initialized
[QR-DIAGNOSTIC] QR-12: decoder running
[QR-DIAGNOSTIC] QR-13: QR detected in live camera frame
[QR-DIAGNOSTIC] QR-14: payload extracted (length=248)
[QR-DIAGNOSTIC] QR-15: payload submitted to LMSE importer
[QR-DIAGNOSTIC] QR-16: LMSE validation started
[QR-DIAGNOSTIC] QR-17: LMSE validation success
[QR-DIAGNOSTIC] QR-18: LMSE validation failure (tested on corrupted payload)
```

---

## 3. Fallback Hierarchy Verification
- **Level 1**: Camera Live View (with auto-play recovery prompt).
- **Level 2**: Image File Decoder (PNG, JPG, JPEG, WebP) via HTML5 Canvas + `jsQR`. Automatically offered when `videoWidth === 0` or camera permission is denied.
- **Level 3**: Import `.lmse` file & manual key entry.

---

## 4. Verification Status
- **Bundle Audit**: PASS (`QR-01` .. `QR-18` present in `android/app/src/main/assets/public/assets/*.js`)
- **Automated Tests**: PASS (`tests/qr-android16-v130.test.ts` & `tests/lmse-qr-scanner.test.ts`)
- **Physical Hardware Android 16 Device Test**: `NOT VERIFIED ON REAL ANDROID 16 HARDWARE` (Requires manual installation of APK on physical mobile device).
