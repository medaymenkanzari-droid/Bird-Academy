# ROOT CAUSE AUDIT REPORT — BIRD ACADEMY USER ANDROID (V1.2.8-MOBILE-ROOT-FIX)

**Date**: 2026-08-11  
**Target Platform**: Android 16 (Capacitor 8 + Android WebView)  
**App**: Bird Academy User Android  

---

## 1. CURRENT ARCHITECTURE OVERVIEW

### 1.1 QR Code License System
- **Entry point**: `FirstLaunchActivationScreen.tsx` -> `QrCodeScannerModal.tsx`
- **Current Flow**:
  1. `QrCodeScannerModal.tsx` initializes camera using `navigator.mediaDevices.getUserMedia()`.
  2. A hidden canvas captures video frames at 100ms intervals.
  3. `jsQR` decodes frame pixel data into text payload.
  4. Scanned payload string is passed back to `handleQrScanned()` in `FirstLaunchActivationScreen.tsx`.
  5. `LicensingService.getInstance().importOfflineBetaLicense(rawPayload)` parses JSON structure, validates RSA-2048 / SHA-256 cryptographic signatures, checks device limits, and activates license offline.
- **Dependencies**: `jsQR`, `lucide-react`, `motion`, `react`.

### 1.2 PDF / Print System
- **Entry point**: `printUtils.ts` (`printDocument(targetElementId)`).
- **Current Flow**:
  1. Components (`Statistiques.tsx`, `Depenses.tsx`, `Ventes.tsx`, `Calendrier.tsx`, `GenealogyExplorer.tsx`) set `targetElementId = 'printable-area'`.
  2. `printUtils.ts` sets `data-printing="true"` on target container.
  3. `printUtils.ts` detects `isCapacitor` and attempts `window.print()`.
  4. If `window.print()` throws or fails, it calls `triggerPrintFallback()`, which creates an invisible `<iframe>` and calls `iframe.contentWindow?.print()`.
- **Dependencies**: Native browser DOM, CSS `@media print` rules in `index.css`.

---

## 2. BUG-A — QR SCANNER ROOT CAUSE ANALYSIS (ANDROID 16)

### 2.1 Failure Pipeline Trace
- **QR-01 / QR-02**: Android OS Camera Runtime Permission (`android.permission.CAMERA`) is declared in `AndroidManifest.xml`, but calling standard web `navigator.mediaDevices.getUserMedia()` in Android WebView does NOT automatically trigger native Android OS runtime permission dialog if Capacitor Native Permission Bridge is not engaged or permissions have not been granted beforehand.
- **QR-03 / QR-05**: When native OS permission is missing, WebView Javascript API immediately throws `NotAllowedError` or `PermissionDeniedError`, placing the modal into `cameraState = 'denied'`.
- **QR-06**: Autoplay policies in Android 16 WebView can pause `<video>` streams unless user gesture handlers explicitly resume video playback (`video.play()`).
- **QR-07**: `getUserMedia` constraints (`facingMode: { ideal: 'environment' }`) may fail on certain multi-lens Android 16 devices, failing camera stream acquisition.
- **QR Fallback Gap**: If live camera stream fails in Android WebView, there was no QR Image File Scanner (picking/uploading a QR image from gallery or file manager) to decode QR payloads.

### 2.2 Detailed Root Cause (BUG-A)
1. **Android OS Runtime Permission vs. Web Permission**: Android 16 WebView enforces strict Origin security. Web `getUserMedia()` requests in Capacitor `http://localhost` fail with `NotAllowedError` unless Android OS CAMERA permission is actively requested and granted.
2. **Missing Image QR Decoder Option**: When live video stream fails, users had no way to upload an image of a QR code to extract the payload.

---

## 3. BUG-B — PRINT / PDF SYSTEM ROOT CAUSE ANALYSIS (ANDROID 16)

### 3.1 Failure Pipeline Trace
- **PRINT-01 to PRINT-04**: DOM targets (`#printable-area`) exist and contain complete report data.
- **PRINT-05 to PRINT-07**: `window.print()` is called, but **Android WebView DOES NOT support `window.print()` natively**! Calling `window.print()` inside an Android WebView is either a no-op or silently fails.
- **PRINT-08 to PRINT-11**: `triggerPrintFallback()` creates an `<iframe>` and calls `iframe.contentWindow?.print()`. `iframe.print()` is ALSO unsupported in Android WebView engine. As a result, tapping "Imprimer / PDF" on Android 16 produces no action, no PDF file, and no print dialog.

### 3.2 Detailed Root Cause (BUG-B)
1. **WebView Limitation**: Android WebView standard implementation does not attach an Android `PrintDocumentAdapter` to `window.print()`. Standard web print APIs (`window.print()`, `iframe.print()`) are non-functional in Capacitor Android WebViews without custom native print bridges or JS PDF generation + File Save/Share mechanisms.
2. **Missing Standalone PDF Generator & Share Layer**: The app relied entirely on browser DOM printing without a robust client-side PDF document generator and mobile File/Share fallback (Web Blob download, Web Share API, Data URI PDF generation).

---

## 4. PROPOSED ROOT CAUSE REMEDIATION & ARCHITECTURE

### 4.1 Remediation Strategy for BUG-A (QR Code Scanner)
1. **Enhanced Diagnostic Pipeline**: Trace and log diagnostic codes (`QR-01` to `QR-11`) securely without leaking keys or signatures.
2. **Permission & Camera Recovery**:
   - Check and prompt for permissions with detailed feedback.
   - Implement multi-constraint fallback for `getUserMedia` (`{ video: { facingMode: { ideal: 'environment' } } }` -> `{ video: { facingMode: 'user' } }` -> `{ video: true }`).
3. **QR Image File Scanner (Priority 2 Fallback)**:
   - Add QR Image File Picker directly in `QrCodeScannerModal.tsx`.
   - When an image file (PNG/JPG/WEBP) is selected, render onto offscreen canvas and run `jsQR` (and `BarcodeDetector` if available).
   - Pass decoded payload directly to existing LMSE parser.
4. **Preserve LMSE Engine**: No change to RSA-2048/SHA-256 cryptographic rules or validation engine.

### 4.2 Remediation Strategy for BUG-B (Print / PDF System)
1. **Cross-Platform PDF & Print Engine**:
   - Enhance `printUtils.ts` to support both native DOM printing (Web/Desktop) and direct HTML-to-PDF / PDF Blob generation + File Download/Share (Android WebView & Web).
2. **Android WebView Mobile Print/Export Flow**:
   - When printing on Android (or fallback mode), generate a self-contained, beautifully formatted HTML/PDF document blob.
   - Trigger browser blob download or Web Share API (`navigator.share` / `navigator.canShare`) to save or open the report PDF in Android system tools (PDF Viewer / Print Service).
   - Provide a direct "Générer / Partager PDF" option on all report modules (Statistiques, Dépenses, Ventes, Calendrier, Génétique).
3. **Full i18n & RTL Support**: Support all 5 active languages (FR, EN, AR, ES, IT) and RTL layout for Arabic.

---

## 5. AUDIT CONCLUSION & NEXT STEPS
- **Status**: Audit completed. Root causes identified for both BUG-A (Android WebView camera permission & media stream policy + missing image scanner fallback) and BUG-B (Android WebView lack of `window.print()` support + missing client-side PDF export/share layer).
- Ready to construct detailed `implementation_plan.md` and present to user for approval.
