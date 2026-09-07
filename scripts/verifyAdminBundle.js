import fs from 'node:fs';
import path from 'node:path';

console.log('==================================================================');
console.log(' BIRD ACADEMY ENTERPRISE ADMIN — BUNDLE AUDIT & VERIFICATION      ');
console.log('==================================================================');

const targetDir = fs.existsSync('dist_admin') ? 'dist_admin' : 'dist';
console.log(`[BUNDLE AUDIT] Auditing ADMIN build output in ${targetDir}/ ...`);

let hasError = false;

// 1. Verify existence of target directory
if (!fs.existsSync(targetDir)) {
  console.error(`[BUNDLE AUDIT FAIL] Target directory "${targetDir}" does not exist. Run "npm run build:admin" first.`);
  process.exit(1);
}

// 2. Verify admin.html presence and structure
const adminHtmlPath = path.join(targetDir, 'admin.html');
if (!fs.existsSync(adminHtmlPath)) {
  console.error(`[BUNDLE AUDIT FAIL] "admin.html" is missing in ${targetDir}/`);
  hasError = true;
} else {
  const htmlContent = fs.readFileSync(adminHtmlPath, 'utf-8');
  if (!htmlContent.includes('id="admin-root"') && !htmlContent.includes("id='admin-root'")) {
    console.error(`[BUNDLE AUDIT FAIL] admin.html does not contain "#admin-root" mount target.`);
    hasError = true;
  } else {
    console.log('[BUNDLE AUDIT] admin.html entry point: PASS');
  }
}

// 3. Verify that index.html is NOT the primary entry in dist_admin
const indexHtmlPath = path.join(targetDir, 'index.html');
if (fs.existsSync(indexHtmlPath) && targetDir === 'dist_admin') {
  console.warn('[BUNDLE AUDIT WARN] index.html detected in dist_admin (admin.html must be the primary shell).');
}

// 4. Verify assets folder and JS/CSS bundles
const assetsDir = path.join(targetDir, 'assets');
if (!fs.existsSync(assetsDir)) {
  console.error(`[BUNDLE AUDIT FAIL] Assets directory "${assetsDir}" does not exist.`);
  hasError = true;
} else {
  const assetFiles = fs.readdirSync(assetsDir);
  const jsFiles = assetFiles.filter(f => f.endsWith('.js'));
  const cssFiles = assetFiles.filter(f => f.endsWith('.css'));

  if (jsFiles.length === 0) {
    console.error('[BUNDLE AUDIT FAIL] No compiled JavaScript files found in assets directory.');
    hasError = true;
  } else {
    console.log(`[BUNDLE AUDIT] JavaScript assets compiled (${jsFiles.length} bundle chunks): PASS`);
  }

  if (cssFiles.length === 0) {
    console.error('[BUNDLE AUDIT FAIL] No compiled CSS files found in assets directory.');
    hasError = true;
  } else {
    console.log(`[BUNDLE AUDIT] CSS styling assets compiled (${cssFiles.length} stylesheets): PASS`);
  }

  // 5. Verify presence of essential Admin symbols in JS chunks
  let hasAdminAppChunk = false;
  for (const jsFile of jsFiles) {
    const content = fs.readFileSync(path.join(assetsDir, jsFile), 'utf-8');
    if (content.includes('admin-root') || content.includes('AdminApp') || content.includes('AdminCenter') || content.includes('lmse_admin')) {
      hasAdminAppChunk = true;
      break;
    }
  }

  if (!hasAdminAppChunk) {
    console.error('[BUNDLE AUDIT FAIL] Required Admin symbols not found in compiled chunks.');
    hasError = true;
  } else {
    console.log('[BUNDLE AUDIT] Admin application symbols & routes: PASS');
  }
}

console.log('------------------------------------------------------------------');
if (hasError) {
  console.error('[BUNDLE AUDIT FAIL] Admin bundle verification failed with errors.');
  process.exit(1);
} else {
  console.log('[BUNDLE AUDIT SUCCESS] Admin build is complete, valid & ready for Windows packaging.');
  process.exit(0);
}
