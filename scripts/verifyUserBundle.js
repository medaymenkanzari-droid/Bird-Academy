import fs from 'node:fs';
import path from 'node:path';

const FORBIDDEN_ADMIN_SYMBOLS = [
  'AdminCenterView',
  'AdminApp',
  'AdminLmseCenter',
  'LicenseGenerator',
  'LicenseCreationModal',
  'LicensingAdminPage',
  'AdminUserDirectory',
  'AdminOrganizations',
  'AdminSecurityQa',
  'AdminGlobalSettings',
  'AdminAuditService',
  'adminAuth',
  'LMSE_PRIVATE_SIGNING_KEY',
];

const FORBIDDEN_ADMIN_ENDPOINTS = [
  '/api/admin/licenses/revoke',
  '/api/admin/users',
  '/api/admin/audit-logs',
];

function scanDirectory(dirPath) {
  let adminViolations = [];
  let localhostViolations = [];

  if (!fs.existsSync(dirPath)) {
    console.error(`[BUNDLE AUDIT] Directory ${dirPath} does not exist.`);
    return { adminViolations, localhostViolations };
  }

  const targetEnv = process.env.VITE_LMSE_ENV || 'development';
  const isStrictEnv = targetEnv === 'beta' || targetEnv === 'production';

  const entries = fs.readdirSync(dirPath, { recursive: true, withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.html'))) {
      const fullPath = path.join(entry.parentPath || dirPath, entry.name);
      const content = fs.readFileSync(fullPath, 'utf-8');

      for (const symbol of FORBIDDEN_ADMIN_SYMBOLS) {
        if (content.includes(symbol)) {
          adminViolations.push({ file: fullPath, symbol });
        }
      }

      for (const endpoint of FORBIDDEN_ADMIN_ENDPOINTS) {
        if (content.includes(endpoint)) {
          adminViolations.push({ file: fullPath, symbol: endpoint });
        }
      }

      if (isStrictEnv) {
        if (content.includes('http://localhost') || content.includes('http://127.0.0.1') || content.includes('http://0.0.0.0')) {
          localhostViolations.push({ file: fullPath, symbol: 'localhost_in_strict_build' });
        }
      }
    }
  }

  return { adminViolations, localhostViolations };
}

const targetDir = fs.existsSync('dist_user') ? 'dist_user' : 'dist';
console.log(`[BUNDLE AUDIT] Auditing USER build output in ${targetDir}/ ...`);

const { adminViolations, localhostViolations } = scanDirectory(targetDir);
let hasError = false;

console.log('[BUNDLE AUDIT] Administrative isolation: ' + (adminViolations.length === 0 ? 'PASS' : 'FAIL'));
console.log('[BUNDLE AUDIT] Private signing key: ' + (adminViolations.length === 0 ? 'PASS' : 'FAIL'));
console.log('[BUNDLE AUDIT] Admin endpoints: ' + (adminViolations.length === 0 ? 'PASS' : 'FAIL'));

if (adminViolations.length > 0) {
  hasError = true;
  console.error('[BUNDLE AUDIT ERROR] Forbidden administrative components found in USER build:');
  for (const v of adminViolations) {
    console.error(`  - Found "${v.symbol}" in ${v.file}`);
  }
}

if (localhostViolations.length > 0) {
  hasError = true;
  console.error('[BUNDLE AUDIT ERROR] Forbidden localhost references found in BETA/PRODUCTION build:');
  for (const v of localhostViolations) {
    console.error(`  - Found "${v.symbol}" in ${v.file}`);
  }
}

if (hasError) {
  process.exit(1);
} else {
  console.log('[BUNDLE AUDIT SUCCESS] Clean bundle! Zero administrative leak & valid endpoint architecture.');
}
