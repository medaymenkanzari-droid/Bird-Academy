import { FileLicenseRepository } from '../src/features/licensing/repositories/FileLicenseRepository.ts';
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator.ts';

process.env.VITE_APP_MODE = 'admin';

const repo = new FileLicenseRepository();

const license = await LicenseGenerator.generateLicense({
  holderName: 'Club Mourouj Bêta',
  holderEmail: 'menkanzari@gmail.com',
  type: 'beta',
  durationDays: 30,
  maxDevices: 1,
});

await repo.saveLicense(license);

console.log('--- NEW LICENSE CREATED ---');
console.log('licenseId:', license.id);
console.log('licenseKey:', license.key);
console.log('holderName:', license.holderName);
console.log('type:', license.type);
console.log('expiration:', license.expiresAt);
console.log('status:', license.status);
console.log('maxDevices:', license.policy.maxDevices);
console.log('checksum:', license.checksum);
console.log('signature:', license.signature);
