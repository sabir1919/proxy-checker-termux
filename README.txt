
# Termux Proxy Checker

## Install Requirements (Node.js must be installed)
```bash
pkg install nodejs -y
npm install axios https-proxy-agent p-limit
```

## Usage
1. Add your proxies to `proxies.txt` (format: http://user:pass@ip:port)
2. Run:
```bash
node proxy-checker-fast.js
```
3. Working proxies will be saved to `working.txt`
