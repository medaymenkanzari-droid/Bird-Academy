const https = require('https');

let attempts = 0;
const maxAttempts = 40; // ~6-7 minutes max

function poll() {
  attempts++;
  const url = `https://bird-academy-public-test.onrender.com/?ts=${Date.now()}`;
  https.get(url, (res) => {
    let html = '';
    res.on('data', chunk => html += chunk);
    res.on('end', () => {
      const match = html.match(/src="\.\/assets\/(index-[^"]+\.js)"/);
      const bundle = match ? match[1] : 'unknown';
      console.log(`[${new Date().toLocaleTimeString()}] Attempt ${attempts}: Live bundle is ${bundle}`);
      
      if (bundle !== 'index-B_iZ1Cbl.js' && bundle !== 'unknown') {
        console.log('>>> DEPLOYMENT SUCCESSFUL! NEW BUNDLE DETECTED ON RENDER:', bundle);
        process.exit(0);
      }
      
      if (attempts >= maxAttempts) {
        console.log('Timeout reached. Render has not yet deployed the new bundle.');
        process.exit(1);
      }
      
      setTimeout(poll, 10000);
    });
  }).on('error', (err) => {
    console.log(`[${new Date().toLocaleTimeString()}] Polling connection error: ${err.message}`);
    setTimeout(poll, 10000);
  });
}

console.log('Starting Render deployment monitor for commit 9727353...');
poll();
