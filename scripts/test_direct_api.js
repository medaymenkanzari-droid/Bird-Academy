import fetch from 'node-fetch';

const url = 'http://localhost:3001/api/license/validate';
const payload = {
  licenseKey: 'LMSE-BETA-5D49-1016-F6F1',
  device: {
    deviceId: 'DEV-TEST-DIRECT-API-001',
    os: 'Android Test',
  },
  holderName: 'Club Mourouj Bêta',
};

console.log('--- ÉTAPE 3: TEST DIRECT API BACKEND ---');
console.log('URL:', url);
console.log('Method: POST');
console.log('Payload:', JSON.stringify(payload, null, 2));

try {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  console.log('HTTP Status:', response.status);
  const data = await response.json();
  console.log('HTTP Response:', JSON.stringify(data, null, 2));
} catch (err) {
  console.error('API Test Error:', err.message);
}
