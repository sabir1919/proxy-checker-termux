
const fs = require('fs');
const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');
const pLimit = require('p-limit');

// CONFIG
const CONCURRENCY_LIMIT = 20;
const TIMEOUT = 10000;

const proxies = fs.readFileSync('proxies.txt', 'utf-8')
  .split('\n')
  .map(p => p.trim())
  .filter(p => p && !p.startsWith('#'));

const limit = pLimit(CONCURRENCY_LIMIT);

let workingCount = 0;
let failedCount = 0;

function timestamp() {
  return new Date().toISOString().replace('T', ' ').split('.')[0];
}

async function checkProxy(proxy) {
  try {
    const agent = new HttpsProxyAgent(proxy);
    const res = await axios.get('https://httpbin.org/ip', {
      httpAgent: agent,
      httpsAgent: agent,
      timeout: TIMEOUT
    });

    const ip = res.data.origin;
    const msg = `[${timestamp()}] [✅ WORKING] ${proxy} | IP: ${ip}`;
    console.log(`\x1b[32m${msg}\x1b[0m`);
    fs.appendFileSync('working.txt', msg + '\n');
    workingCount++;
  } catch (err) {
    const msg = `[${timestamp()}] [❌ FAILED ] ${proxy} | ${err.code || err.message}`;
    console.log(`\x1b[31m${msg}\x1b[0m`);
    fs.appendFileSync('failed.txt', msg + '\n');
    failedCount++;
  }
}

(async () => {
  console.log(`Checking ${proxies.length} proxies in parallel...\n`);

  const tasks = proxies.map(proxy => limit(() => checkProxy(proxy)));
  await Promise.allSettled(tasks);

  console.log(`\n\x1b[36m✅ Done.`);
  console.log(`🟢 Working: ${workingCount}`);
  console.log(`🔴 Failed : ${failedCount}\x1b[0m`);
  console.log(`\nResults saved to \x1b[32mworking.txt\x1b[0m and \x1b[31mfailed.txt\x1b[0m.`);
})();
