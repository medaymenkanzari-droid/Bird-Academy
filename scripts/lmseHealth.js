import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { LmseConfigService } from '../src/config/lmseConfig.ts';

dotenv.config();

const baseUrl = LmseConfigService.getLmseApiUrl();
console.log('=============================================================');
console.log('  LMSE BACKEND HEALTH CHECK');
console.log('=============================================================');
console.log('Target API Base URL:', baseUrl);

try {
  const start = Date.now();
  const response = await fetch(`${baseUrl}/api/health`, { method: 'GET' });
  const elapsed = Date.now() - start;

  if (response.ok) {
    const data = await response.json().catch(() => ({}));
    console.log(`STATUS         : OK (HTTP ${response.status})`);
    console.log(`Latency        : ${elapsed} ms`);
    console.log(`Backend Details:`, JSON.stringify(data, null, 2));
    console.log('=============================================================');
    process.exit(0);
  } else {
    console.error(`STATUS         : FAIL (HTTP ${response.status})`);
    console.error(`Latency        : ${elapsed} ms`);
    console.log('=============================================================');
    process.exit(1);
  }
} catch (err) {
  console.error(`STATUS         : UNREACHABLE`);
  console.error(`Error          : ${err.message}`);
  console.error(`Reason         : Cannot connect to LMSE Backend at ${baseUrl}`);
  console.log('=============================================================');
  process.exit(1);
}
