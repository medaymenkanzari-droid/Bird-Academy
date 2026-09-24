# QA REPORT: WINDOWS-FREE-FIX-002
**Controlled Fix & Forensic Validation Report**
**Mission:** WINDOWS-FREE-FIX-002 (Correction de la persistance de licence Windows + alignement du Download Center RC6)  
**Date:** 2026-09-24  
**Environment:** Windows 11 / x64 / Node.js v20 / Electron / Playwright  
**Target Release Candidate:** `v1.3.6-RC6` (Build ID: `BA-V1.3.6-RC6`)  
**Mode:** CONTROLLED FIX / FAIL-SAFE  
**Final Verdict:** `WINDOWS FREE FIX 002 PASS`

---

## 1. Executive Summary

Mission **WINDOWS-FREE-FIX-002** was commissioned to resolve the two confirmed root causes documented in `QA_WINDOWS_CLEAN_INSTALL_FREE_AUDIT_002_REPORT.md`:
1. **Persistent License State**: Windows uninstaller leaves `%APPDATA%\Bird-Academy\Local Storage\leveldb` intact to protect breeding records, allowing obsolete test licenses (e.g. `LMSE-TEST-13F8-3AA3-8E3C`) to linger across clean uninstalls and re-trigger activation prompts on launch.
2. **Distribution Mismatch**: The public test Download Center and server fallback routes were pointing to `v1.3.6` Stable binary assets instead of the officially qualified `v1.3.6-RC6` binary artifacts.

### Key Actions Executed:
- **Controlled Test License Neutralization**: Added safe migration logic in `LicensingService.ts` and `SubscriptionTierResolver.ts` that detects and neutralizes legacy test keys (`LMSE-TEST-*`, `TEST-*`) upon launch, immediately defaulting to `FREE` mode without showing `FirstLaunchActivationScreen`.
- **Absolute Commercial Security Preservation**: All commercial licenses (`COMM-*`, `BETA-*`, `PERM-*`, `TEMP-*`, `ENTP-*`, `ASSO-*`, `VETE-*`) are strictly excluded from neutralization. Invalid, expired, revoked, or tampered commercial licenses continue to be rejected by `LicenseValidator` without compromise.
- **Breeding Data & Preferences Protection**: 100% of user data (birds, pairs, cages, clutches, health records, finances) and preferences (language, theme, currency) are preserved. `localStorage.clear()` was **never** called.
- **Download Center & Server Alignment**: Updated fallback routes in `src/server/lmseServer.ts` and artifact metadata in `WebDownloadService.ts` to deliver `v1.3.6-RC6` with verified SHA-256 hashes (`746F6D99CF91802686D21A2F7632945730B96F2225B756AD2BF27B27B815754B` for Setup and `EDDD283D2A212B7A0155B32FC8CA7B188E28C3ED0874C509DDE395DAAD37E1BE` for Portable).
- **Physical Binary Synchronization**: Replaced outdated binary in `dist_binaries/` with the exact qualified RC6 binary matching the official SHA-256.
- **Validation**: Executed all 25 tests in `tests/windows-free-fix-002.test.ts`, E2E Playwright tests, full regression suites, and verified 0 TypeScript compilation errors.

---

## 2. Root Cause 1 — Persistent License State

### 2.1 Mechanism of Persistence
Electron applications store `localStorage` inside Chromium LevelDB instances at:
`%APPDATA%\Bird-Academy\Local Storage\leveldb\`

When a user uninstalls Bird Academy via the Windows NSIS uninstaller, `electron-builder` by default preserves the `%APPDATA%\Bird-Academy` directory unless `deleteAppDataOnUninstall: true` is configured in `electron-builder-user.json`.

### 2.2 Why `deleteAppDataOnUninstall: true` Was Rejected
Enabling global deletion on uninstall would wipe out `%APPDATA%\Bird-Academy` entirely, destroying user breeding databases (`canaris`, `couples`, `cages`, `pontes`, `health_logs`, `depenses`, `ventes`) and user settings. In production, users who reinstall or upgrade must **never** lose their flock history.

### 2.3 Legacy Test License Intrusion
Audit 002 revealed that test machines had an old QA test license (`LMSE-TEST-13F8-3AA3-8E3C`) saved in LevelDB under:
- `bird_academy_lmse_active_license`
- `bird_academy_lmse_all_licenses`

Upon reinstalling and launching the application, `LicensingService.initialize()` loaded this legacy test license. Because the test signature was expired, unverified against production, or deemed invalid, the system displayed `FirstLaunchActivationScreen` instead of cleanly directing the user to the `FREE` tier.

---

## 3. Root Cause 2 — Distribution Mismatch

### 3.1 Server Redirect Mismatch
In `src/server/lmseServer.ts` (line 933), the fallback download handler for Windows executables contained:
```typescript
res.redirect(302, `https://github.com/medaymenkanzari-droid/Bird-Academy/releases/download/v1.3.6/${filename}`);
```
This hardcoded release tag redirected Windows downloads to `v1.3.6` Stable rather than the qualified candidate `v1.3.6-RC6`.

### 3.2 Metadata Mismatch in `WebDownloadService.ts`
`WebDownloadService.ts` listed `version: 'v1.3.6'` and SHA-256 `B1B736EE80556BC10CE31A21BA024CD8D316933FDBCA9A464157833AF54E5440` for Windows Setup, which was the legacy Stable build, not RC6.

### 3.3 `dist_binaries/` Out of Sync
The local `dist_binaries/Bird-Academy-User-Windows-Setup.exe` file matched the Stable build (`B1B736EE...`) rather than the qualified RC6 binary (`746F6D99...`).

---

## 4. Architecture Change & Storage Separation

To solve both issues permanently, a clean logical separation between **Licensing State** and **Breeding Domain State** was established:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Local Storage / LevelDB                         │
├──────────────────────────────────┬─────────────────────────────────────┤
│      BREEDING & PREFERENCES      │          LICENSING STORAGE          │
│         (Protected Data)         │         (Controlled State)          │
├──────────────────────────────────┼─────────────────────────────────────┤
│ • canaris                        │ • bird_academy_lmse_active_license  │
│ • couples                        │ • bird_academy_lmse_all_licenses    │
│ • cages                          │ • bird_academy_lmse_tier_override   │
│ • pontes                         │ • bird_academy_lmse_last_sync       │
│ • health_logs                    │                                     │
│ • depenses / ventes              │                                     │
│ • bird_academy_language          │                                     │
│ • bird_academy_theme             │                                     │
│ • bird_academy_currency          │                                     │
└──────────────────────────────────┴─────────────────────────────────────┘
```

The migration routine specifically targets `bird_academy_lmse_*` test keys, leaving breeding entities untouched. `localStorage.clear()` is strictly forbidden and never called.

---

## 5. License Migration Logic

### 5.1 Controlled Test License Detection
In `src/features/licensing/services/LicensingService.ts`:

```typescript
public static isLegacyTestLicenseKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  const upper = key.trim().toUpperCase();
  
  // STRICT RULE: Commercial prefixes are NEVER test licenses
  const COMMERCIAL_PREFIXES = ['COMM-', 'BETA-', 'PERM-', 'TEMP-', 'ENTP-', 'ASSO-', 'VETE-'];
  if (COMMERCIAL_PREFIXES.some(prefix => upper.startsWith(prefix))) {
    return false;
  }
  
  // Specific legacy QA test license signatures
  if (/^LMSE-TEST-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(upper)) return true;
  if (upper.startsWith('LMSE-TEST-') || upper.startsWith('TEST-') || upper.includes('TEST-')) return true;
  
  return false;
}
```

### 5.2 Safe Startup Neutralization
In `LicensingService.initialize()`:
- `migrateLegacyTestLicenses()` runs at startup before any license validation.
- If `active_license` is a legacy test key, it is removed from storage.
- Legacy test keys are purged from `all_licenses`. Any remaining valid commercial licenses are preserved.
- Any lingering test tier overrides (`bird_academy_lmse_tier_override`) are removed.
- State falls back smoothly to `NO_LICENSE` → `SubscriptionTier.FREE`.

### 5.3 Fallback in `SubscriptionTierResolver`
Both `getCurrentTierSync()` and `resolve()` cross-check `LicensingService.isLegacyTestLicenseKey()`. If a test key is detected, it is immediately discarded in favor of `SubscriptionTier.FREE`, ensuring that UI components never render `FirstLaunchActivationScreen` for legacy test artifacts.

---

## 6. Data Preservation Audit

A comprehensive verification confirmed that breeding records and user configurations remain 100% intact:

| Data Entity | Storage Key | Preservation Status | Neutralization Impact |
|:---|:---|:---:|:---:|
| **Birds Inventory** | `canaris` | **PRESERVED** | Zero modification |
| **Breeding Pairs** | `couples` | **PRESERVED** | Zero modification |
| **Cages & Aviaries** | `cages` | **PRESERVED** | Zero modification |
| **Clutches & Eggs** | `pontes` | **PRESERVED** | Zero modification |
| **Health Logs** | `health_logs` | **PRESERVED** | Zero modification |
| **Finances / Expenses** | `depenses`, `ventes` | **PRESERVED** | Zero modification |
| **UI Language** | `bird_academy_language` | **PRESERVED** | Zero modification |
| **Theme (Dark/Light)** | `bird_academy_theme` | **PRESERVED** | Zero modification |
| **Currency** | `bird_academy_currency` | **PRESERVED** | Zero modification |
| **Global Storage Wipe** | `localStorage.clear()` | **NEVER CALLED** | Audit passed |

---

## 7. Security Verification

All critical security guarantees remain enforced without compromise:

1. **`LicenseValidator` & `LicenseEngine`**: Untouched. ECDSA digital signature verification, anti-tamper checksums, and signature integrity remain active.
2. **Revocation & Expiration**: Real commercial licenses (`COMM-*`, `BETA-*`, etc.) that are expired or revoked are strictly rejected with `LICENSE_EXPIRED` or `LICENSE_REVOKED`.
3. **Single Device Enforcement**: `maxDevices = 1` remains strictly validated for commercial licenses.
4. **Anti-Clock-Rollback**: Clock manipulation prevention remains intact.
5. **No Private Secrets in Client**:
   - `LMSE_PRIVATE_SIGNING_KEY`: **ABSENT** from client bundles.
   - ECDSA private keys: **ABSENT**.
   - Payment/Stripe private credentials: **ABSENT**.

---

## 8. Download Center Correction

### 8.1 Server Routing (`src/server/lmseServer.ts`)
Updated the Windows executable download fallback:
```typescript
// Redirect Windows setup/portable to qualified RC6 release candidate
res.redirect(302, `https://github.com/medaymenkanzari-droid/Bird-Academy/releases/download/v1.3.6-RC6/${filename}`);
```

### 8.2 Client Download Service (`src/features/commercial-website/services/WebDownloadService.ts`)
Configured artifacts with exact RC6 metadata:
- **Windows Setup**:
  - `version`: `'v1.3.6-RC6'`
  - `buildId`: `'BA-V1.3.6-RC6'`
  - `sizeBytes`: `112731374`
  - `sizeMB`: `'112 731 374 octets (107.51 Mo)'`
  - `sha256`: `'746F6D99CF91802686D21A2F7632945730B96F2225B756AD2BF27B27B815754B'`
  - `releaseTag`: `'v1.3.6-RC6'`
- **Windows Portable**:
  - `version`: `'v1.3.6-RC6'`
  - `buildId`: `'BA-V1.3.6-RC6'`
  - `sizeBytes`: `111233160`
  - `sizeMB`: `'111 233 160 octets (106.08 Mo)'`
  - `sha256`: `'EDDD283D2A212B7A0155B32FC8CA7B188E28C3ED0874C509DDE395DAAD37E1BE'`
  - `releaseTag`: `'v1.3.6-RC6'`

---

## 9. Binary SHA-256 Before / After Table

| File Path / Artifact | Metric | Before (Audit 002) | After (Fix 002) | Match Status |
|:---|:---|:---|:---|:---:|
| `dist_binaries/Bird-Academy-User-Windows-Setup.exe` | **SHA-256** | `B1B736EE80556BC10CE31A21BA024CD8D316933FDBCA9A464157833AF54E5440` | `746F6D99CF91802686D21A2F7632945730B96F2225B756AD2BF27B27B815754B` | **EXACT RC6** |
| `dist_binaries/Bird-Academy-User-Windows-Setup.exe` | **Size (bytes)** | 112,686,168 | 112,731,374 | **EXACT RC6** |
| `dist_binaries/Bird-Academy-User.exe` (Portable) | **SHA-256** | `—` | `EDDD283D2A212B7A0155B32FC8CA7B188E28C3ED0874C509DDE395DAAD37E1BE` | **EXACT RC6** |
| `dist_binaries/Bird-Academy-User.exe` (Portable) | **Size (bytes)** | `—` | 111,233,160 | **EXACT RC6** |
| Server Redirect Target | **Tag** | `v1.3.6` (Stable) | `v1.3.6-RC6` | **ALIGNED** |

---

## 10. RC6 Asset Verification

Both physical binary files in `dist_binaries/` were verified directly via PowerShell `Get-FileHash`:
- `Bird-Academy-User-Windows-Setup.exe`:
  - Algorithm: SHA256
  - Hash: `746F6D99CF91802686D21A2F7632945730B96F2225B756AD2BF27B27B815754B`
  - Byte length: `112731374`
- `Bird-Academy-User.exe`:
  - Algorithm: SHA256
  - Hash: `EDDD283D2A212B7A0155B32FC8CA7B188E28C3ED0874C509DDE395DAAD37E1BE`
  - Byte length: `111233160`

---

## 11. `app.asar` Forensics

Inspection of `resources/app.asar` inside the qualified RC6 binary:
- **Build Identification**: `BUILD_ID = 'BA-V1.3.6-RC6'`
- **Electron Security Flags**:
  - `contextIsolation: true`
  - `nodeIntegration: false`
  - `webSecurity: true`
- **Bridge & Environment**:
  - `preload.cjs` properly establishes `window.electron` bridge.
  - `process.platform === 'win32'`
  - `runtime: 'desktop'`
- **Zero Secrets Leakage**:
  - `LMSE_PRIVATE_SIGNING_KEY`: **Not found** (0 occurrences).
  - ECDSA private keys: **Not found**.
  - Server / Payment secrets: **Not found**.

---

## 12. Windows Clean Install Simulation

**Scenario**: Clean install on a system with no pre-existing license state.
- **Action**: Launch application binary directly.
- **Resolution**:
  - `LicensingService.initialize()` detects `NO_LICENSE`.
  - Platform detects native Windows desktop runtime.
  - `SubscriptionTierResolver` resolves `SubscriptionTier.FREE`.
  - Route directs immediately to `Dashboard`.
  - `FirstLaunchActivationScreen` is completely absent.

---

## 13. Windows Reinstall Simulation

**Scenario**: User previously had legacy test license `LMSE-TEST-13F8-3AA3-8E3C` stored in LevelDB, uninstalled the app, and reinstalled with the qualified RC6 build.
- **Action**: Launch application.
- **Resolution**:
  - `LicensingService.migrateLegacyTestLicenses()` runs.
  - `LMSE-TEST-13F8-3AA3-8E3C` detected as legacy test license.
  - Test license neutralized and removed from storage.
  - Breeding data (`canaris`, `couples`, `cages`, etc.) remains 100% intact.
  - App opens directly in `FREE` tier on `Dashboard`.
  - **Result**: No license prompt, zero user friction.

---

## 14. QA Reset

- **Scenario**: QA Reset action triggered.
- **Action**: All license keys cleared; app restarted.
- **Resolution**:
  - State cleanly resolves to `NO_LICENSE` → `FREE`.
  - Breeding data preserved.
  - Dashboard loads cleanly without activation barrier.

---

## 15. Offline-First Verification

- Tested application with network interface disabled (Offline mode).
- In `FREE` tier, all core breeding capabilities (adding birds, recording pairings, logging clutches, generating pedigrees) function 100% offline.
- Zero network requests are required to maintain `FREE` mode access.
- Zero telemetry or private breeding data sent over the network.

---

## 16. Licensing Regression Test Suite

All 25 mandatory tests in `tests/windows-free-fix-002.test.ts` passed:

```
✔ Test 1: Legacy test license LMSE-TEST-* detected by isLegacyTestLicenseKey (0.64ms)
✔ Test 2: Legacy test license TEST-* detected (0.24ms)
✔ Test 3: Commercial license COMM-* NOT treated as test license (0.23ms)
✔ Test 4: Commercial license BETA-* NOT treated as test license (0.20ms)
✔ Test 5: Commercial license PERM-* NOT treated as test license (0.20ms)
✔ Test 6: Commercial license TEMP-* NOT treated as test license (0.19ms)
✔ Test 7: Commercial license ENTP-* NOT treated as test license (0.20ms)
✔ Test 8: Commercial license ASSO-* NOT treated as test license (0.19ms)
✔ Test 9: Commercial license VETE-* NOT treated as test license (0.20ms)
✔ Test 10: migrateLegacyTestLicenses neutralizes active test license (0.42ms)
✔ Test 11: migrateLegacyTestLicenses filters test licenses from all_licenses (0.33ms)
✔ Test 12: NO_LICENSE obtained after legacy test license neutralization (0.29ms)
✔ Test 13: FREE tier obtained after legacy test license neutralization (0.32ms)
✔ Test 14: FirstLaunchActivationScreen absent in FREE mode (0.37ms)
✔ Test 15: Breeding data (canaris, couples, cages, pontes, health, finance) preserved (0.43ms)
✔ Test 16: User preferences (language, theme, currency) preserved (0.29ms)
✔ Test 17: localStorage.clear() NEVER called during migration (0.41ms)
✔ Test 18: Invalid commercial license is rejected (NOT neutralized) (0.34ms)
✔ Test 19: Expired commercial license is rejected (0.29ms)
✔ Test 20: Revoked commercial license is rejected (0.31ms)
✔ Test 21: Tampered signature commercial license is rejected (0.29ms)
✔ Test 22: Single Device rule enforced (maxDevices = 1) (0.27ms)
✔ Test 23: Offline FREE functions without network (0.31ms)
✔ Test 24: No breeding data sent over network in FREE mode (0.29ms)
✔ Test 25: Restart and reboot preserve FREE mode without activation (0.38ms)

ℹ tests 25
ℹ suites 0
ℹ pass 25
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 254.67
```

---

## 17. Playwright E2E Results

Executed Playwright E2E suites:
- `tests/e2e/windows-download-rc6-002.spec.ts`:
  - Test 1: Download Section displays qualified RC6 version & build ID: **PASSED**
  - Test 2: Windows Setup download points to qualified RC6 asset: **PASSED**
  - Test 3: Windows Portable download points to qualified RC6 asset: **PASSED**
  - Test 4: Server download fallback route redirects to v1.3.6-RC6: **PASSED**
- `tests/e2e/windows-free-fix-001.spec.ts`:
  - 4 passed (100%)

---

## 18. TypeScript Compilation

Executed `npx tsc --noEmit`:
- **Result**: Exit code `0`
- **Errors**: `0` (Zero compiler errors across entire project)

---

## 19. Final Verification Matrix

| Verification Area | Requirement | Result | Status |
|:---|:---|:---:|:---:|
| **Root Cause 1** | Neutralize legacy test license (`LMSE-TEST-*`) | Cleanly neutralized at startup | **PASS** |
| **Root Cause 2** | Align Download Center & fallback with RC6 | `v1.3.6-RC6` served with exact SHA-256 | **PASS** |
| **Clean Install Flow** | Windows + No License → FREE → Dashboard | Immediate Dashboard access | **PASS** |
| **Reinstall Flow** | Previous test license + Reinstall → FREE | Migrated to FREE, zero prompt | **PASS** |
| **Breeding Data** | Birds, pairs, clutches, cages, health, finance | 100% Preserved | **PASS** |
| **Preferences** | Language, theme, currency | 100% Preserved | **PASS** |
| **Storage Safety** | `localStorage.clear()` invocation | Never called | **PASS** |
| **Commercial Security** | `COMM-*`, `BETA-*`, `PERM-*` validation | Strict validation maintained | **PASS** |
| **Security Secrets** | Signing & ECDSA private keys absent in client | 0 secrets found | **PASS** |
| **RC5 Tag Immutability** | Commit `24ca2e0604d1a47f47872a384c4d688e4532ed64` | Completely unchanged | **PASS** |
| **Commercial Gates** | `PAYMENT_LIVE` & `PUBLIC_COMMERCIAL_SALES` | Closed (Test mode preserved) | **PASS** |
| **E2E Playwright** | Download Center & Windows Free journeys | All specs passed | **PASS** |
| **TypeScript** | `npx tsc --noEmit` | Clean (0 errors) | **PASS** |

---

## 20. Final Verdict

# `WINDOWS FREE FIX 002 PASS`

The persistent license barrier on Windows has been completely resolved without deleting any user breeding data or weakening commercial licensing security. The Download Center and fallback distribution mechanisms are strictly aligned with the qualified `v1.3.6-RC6` binary artifacts.
