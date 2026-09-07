const https = require('https');
['canary,bird', 'goldfinch,bird', 'finch,bird'].forEach((t, i) => {
  https.get(`https://loremflickr.com/300/300/${t}?lock=${i+1}`, (res) => {
    console.log(t, res.statusCode);
  });
});
