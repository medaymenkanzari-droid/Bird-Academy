# LMSE Enterprise — First Launch Implementation Report

## Overview
This document details the architectural implementation of the **Official First Launch (Premier Démarrage)** workflow for the **Bird Academy User Application** (`Volière Manager`), powered by the LMSE Enterprise licensing engine.

---

## Key Achievements & Technical Architecture

### 1. Strict Application Separation & Security Model
- **User vs Admin Boundary**: The User application and Admin Center remain completely distinct binaries and user flows.
- **Zero Admin Leaks**: The User build contains zero administrative pages (`AdminCenterView`, `AdminApp`, `LicensingAdminPage`, `AdminUserDirectory`), zero key creation tools (`LicenseGenerator`, `LicenseCreationModal`), zero private signing keys, and zero calls to `/api/admin/*`.
- **Crypto Guard**: In User mode (`VITE_APP_MODE=user`), any attempt to trigger key generation or private key operations throws a strict `SECURITY_ERROR`.

---

### 2. Deterministic Boot & License State Machine
On initial launch on a device:
1. `LicensingService.initialize()` validates the environment deterministically without silently auto-creating a trial license.
2. If no valid license is bound to the current device, state resolves to `UNLICENSED` / `ACTIVATION_REQUIRED`.
3. Application rendering in `App.tsx` intercepts the user session and renders `<FirstLaunchActivationScreen />` fullscreen, blocking access to all application tabs, data repositories, and sidebars.

#### State Enumeration (`FirstLaunchState`)
- `UNLICENSED`: Fresh installation with no license registered.
- `ACTIVATION_REQUIRED`: License present but device binding is missing.
- `ACTIVATING`: Activation request in progress.
- `LICENSED`: Valid license bound and verified.
- `LICENSE_EXPIRED`: License expiration date has passed.
- `LICENSE_REVOKED`: Key present in revocation list.
- `DEVICE_LIMIT_REACHED`: Maximum allowed hardware registrations reached (`policy.maxDevices`).
- `INVALID_LICENSE`: Checksum mismatch, invalid signature, or clock tampering detected.
- `OFFLINE_ACTIVATION_AVAILABLE`: Offline hardware challenge/response activation active.

---

### 3. First Launch User Interface (`FirstLaunchActivationScreen.tsx`)
- **Visual Design**: Sleek dark mode design matching Bird Academy design system, built with `AppCard`, `AppInput`, `AppButton`, `AppAlert`, `AppBadge`, `AppLoader`, `BrandLogoIcon`, and `lucide-react` icons.
- **Language Selector & RTL**: Full support for 5 languages (**FR, EN, AR, ES, IT**). When Arabic is selected, the interface dynamically adjusts to Right-To-Left (`dir="rtl"`) text alignment, input placement, and icon orientation.
- **Connectivity Indicator**: Real-time network monitor displaying `En ligne` (Online) vs `Hors ligne` (Offline).
- **Offline Challenge Flow**: Embedded offline activation generator allowing users without internet access to create a Hardware Challenge Code, obtain an offline response code, and activate locally.
- **Post-Activation Confirmation**: Screen transitions to a "✓ Licence activée" confirmation card displaying holder name, license type, expiration date, and device slots before unlocking entry into Bird Academy (`onActivationSuccess`).

---

### 4. Verification & Persistence
- **Storage Protection**: Uses `LocalStorageLicenseRepository` and `IntegrityVerificationEngine` with anti-clock rollback markers (`getMonotonicTimeMarker`) and SHA-256/AES-256 signature verification.
- **Persistence Across Restarts**: On subsequent launches with a valid license, initial validation succeeds cleanly (`code: 'VALID'`), skipping the activation screen and entering directly into Bird Academy.
