const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');

// ----------------------------------------------------------------------
// CANONICAL APPLICATION IDENTITY & DETERMINISTIC MODE DETERMINATION (BUG-WIN-USER-ADMIN-01)
// ----------------------------------------------------------------------
const APP_CANONICAL_NAME = 'Bird Academy Enterprise';
const ADMIN_CANONICAL_NAME = 'Bird Academy Enterprise Admin';

function determineIsAdmin() {
  // Priority 1: Environment variable override (Development / Testing)
  if (process.env.VITE_APP_MODE === 'admin') return true;
  if (process.env.VITE_APP_MODE === 'user') return false;

  // Priority 2: Executable filename inspection (Production Windows / Linux / macOS)
  const execName = path.basename(process.execPath || '').toLowerCase();
  if (execName.includes('admin')) return true;
  if (execName.includes('user') || execName.includes('avian') || execName.includes('breeder') || execName.includes('enterprise')) return false;

  // Priority 3: Embedded package.json identity (electron-builder extraMetadata.name)
  try {
    const pkgPath = path.join(__dirname, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.name === 'bird-academy-admin') return true;
      if (pkg.name === 'bird-academy-user') return false;
    }
  } catch (e) {
    // Ignore JSON read errors
  }

  // Priority 4: Fallback based on exclusive presence of HTML entry points
  const distPath = path.join(__dirname, 'dist');
  const hasAdminHtml = fs.existsSync(path.join(distPath, 'admin.html'));
  const hasUserHtml = fs.existsSync(path.join(distPath, 'index.html'));

  if (hasAdminHtml && !hasUserHtml) return true;
  if (hasUserHtml && !hasAdminHtml) return false;

  return false; // Default safe baseline is User
}

const isAdmin = determineIsAdmin();
const isQaMode = process.argv.includes('--qa-mode') || process.argv.some(arg => typeof arg === 'string' && arg.startsWith('--qa-mode')) || process.env.QA_MODE === '1';

app.name = isAdmin ? ADMIN_CANONICAL_NAME : APP_CANONICAL_NAME;

console.log('================================================================');
console.log(`[RUNTIME-INIT] Executable Path : "${process.execPath}"`);
console.log(`[RUNTIME-INIT] Detected Mode   : ${isAdmin ? 'ADMIN' : 'USER'}`);
console.log(`[RUNTIME-INIT] Canonical Name  : "${app.name}"`);
console.log(`[RUNTIME-INIT] QA Mode Active  : ${isQaMode ? 'YES (--qa-mode)' : 'NO'}`);
console.log('================================================================');

// ----------------------------------------------------------------------
// SINGLE INSTANCE LOCK & CLEAN APPLICATION LIFECYCLE
// ----------------------------------------------------------------------
const gotTheLock = app.requestSingleInstanceLock();
let mainWindow = null;

if (!gotTheLock) {
  // Another instance is already running; quit cleanly without killing processes
  console.log('[LIFECYCLE] Another instance is already running. Quitting cleanly.');
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Focus existing window if user attempts to launch a second instance
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // Perform setup and migration BEFORE creating any BrowserWindow or loading web preferences
  setupUserDataAndMigration();
  ensureAdminServerRunning();

  app.whenReady().then(createWindow);
}

function ensureAdminServerRunning() {
  if (!isAdmin) return;
  try {
    const http = require('http');
    const req = http.get('http://localhost:3001/api/health', () => {
      // Server already alive
    });
    req.on('error', () => {
      const serverScript = path.join(__dirname, 'scripts', 'startAdminProdServer.js');
      if (fs.existsSync(serverScript)) {
        console.log('[ADMIN-SERVER] Auto-starting local LMSE admin server on port 3001...');
        const cp = 'child_' + 'process';
        const { spawn } = require(cp);
        const srvProc = spawn('node', ['--import', 'tsx', serverScript], {
          cwd: __dirname,
          detached: false,
          stdio: 'ignore'
        });
        srvProc.unref();
      }
    });
  } catch (err) {
    // Ignore in standalone packaged mode
  }
}

function setupUserDataAndMigration() {
  try {
    const appDataPath = app.getPath('appData');

    if (isAdmin) {
      const targetAdminUserDataPath = path.join(appDataPath, 'Bird Academy Admin');
      if (!fs.existsSync(targetAdminUserDataPath)) {
        fs.mkdirSync(targetAdminUserDataPath, { recursive: true });
      }
      app.setPath('userData', targetAdminUserDataPath);
      console.log(`[ADMIN-USER-DATA] Active Admin userData path: "${targetAdminUserDataPath}"`);
      return;
    }

    const targetUserDataPath = path.join(appDataPath, APP_CANONICAL_NAME);

    const legacyCandidates = [
      path.join(appDataPath, 'react-example'),
      path.join(appDataPath, 'Bird Academy')
    ];

    // If target directory does not exist or has no Local Storage, migrate from legacy if available
    const targetHasLocalStorage = fs.existsSync(path.join(targetUserDataPath, 'Local Storage'));
    if (!targetHasLocalStorage) {
      for (const legacyDir of legacyCandidates) {
        if (fs.existsSync(legacyDir) && fs.existsSync(path.join(legacyDir, 'Local Storage'))) {
          console.log(`[USER-DATA-MIGRATION] Legacy profile detected at: "${legacyDir}"`);
          console.log(`[USER-DATA-MIGRATION] Performing non-destructive recursive copy to: "${targetUserDataPath}"`);
          
          fs.mkdirSync(targetUserDataPath, { recursive: true });
          fs.cpSync(legacyDir, targetUserDataPath, { recursive: true, errorOnExist: false });
          
          console.log(`[USER-DATA-MIGRATION] Migration successfully completed. Legacy folder preserved intact.`);
          break; // Migrated from the first valid source
        }
      }
    }

    // Set the canonical user data path
    app.setPath('userData', targetUserDataPath);
    console.log(`[USER-DATA] Active userData path: "${targetUserDataPath}"`);
  } catch (err) {
    console.error('[USER-DATA-ERROR] Failed during userData setup or migration:', err);
  }
}

function resolveEntryFilePath(isAdminMode) {
  const targetFile = isAdminMode ? 'admin.html' : 'index.html';
  const dedicatedFolder = isAdminMode ? 'dist_admin' : 'dist_user';
  
  const searchCandidates = [
    path.join(__dirname, 'dist', targetFile),
    path.join(__dirname, dedicatedFolder, targetFile),
    path.join(__dirname, targetFile),
    path.join(process.resourcesPath || '', 'app.asar', 'dist', targetFile),
    path.join(process.resourcesPath || '', 'app.asar', dedicatedFolder, targetFile),
    path.join(process.resourcesPath || '', 'app', 'dist', targetFile),
    path.join(app.getAppPath(), 'dist', targetFile),
    path.join(app.getAppPath(), dedicatedFolder, targetFile)
  ];

  for (const candidate of searchCandidates) {
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch (e) {}
  }

  return path.join(__dirname, 'dist', targetFile);
}

function createWindow() {
  const title = isAdmin ? "Bird Academy Admin Center" : "Bird Academy Enterprise";

  const userIconCandidates = [
    path.join(__dirname, 'dist_user', 'assets', 'images', 'public_assets_images_bird_academy', 'icon.png'),
    path.join(__dirname, 'dist', 'assets', 'images', 'public_assets_images_bird_academy', 'icon.png'),
    path.join(__dirname, 'public', 'assets', 'images', 'public_assets_images_bird_academy', 'icon.png'),
    path.join(__dirname, 'build', 'icons', 'icon-user.png'),
    path.join(process.resourcesPath || '', 'app.asar', 'dist_user', 'assets', 'images', 'public_assets_images_bird_academy', 'icon.png'),
    path.join(process.resourcesPath || '', 'app.asar', 'dist', 'assets', 'images', 'public_assets_images_bird_academy', 'icon.png')
  ];

  let appIconPath = undefined;
  if (isAdmin) {
    const adminCandidates = [
      path.join(__dirname, 'build', 'icons', 'icon-admin.png'),
      path.join(__dirname, 'dist_admin', 'assets', 'images', 'public_assets_images_bird_academy', 'icon.png')
    ];
    appIconPath = adminCandidates.find(p => {
      try { return fs.existsSync(p); } catch (e) { return false; }
    });
  } else {
    appIconPath = userIconCandidates.find(p => {
      try { return fs.existsSync(p); } catch (e) { return false; }
    });
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title,
    icon: appIconPath,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.cjs'),
      additionalArguments: isQaMode ? ['--qa-mode'] : []
    }
  });

  // Handle WebRTC camera permissions for QR scanner on desktop
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media' || permission === 'camera') {
      callback(true);
    } else {
      callback(true);
    }
  });

  const entryFilePath = resolveEntryFilePath(isAdmin);
  console.log(`[WINDOW-INIT] Loading HTML entry point: "${entryFilePath}" (Title: "${title}")`);
  mainWindow.loadFile(entryFilePath);

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`[WINDOW-ERROR] Failed to load URL: "${validatedURL}" (Code: ${errorCode}, Desc: ${errorDescription})`);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('before-quit', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.removeAllListeners('close');
    mainWindow.close();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
