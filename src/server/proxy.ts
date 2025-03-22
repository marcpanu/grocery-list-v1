import { createServer } from 'cors-anywhere';

const host = 'localhost';
const port = 8080;

createServer({
  originWhitelist: [], // Allow all origins
  requireHeader: ['origin', 'x-requested-with'],
  removeHeaders: [
    'cookie', 
    'cookie2',
    'x-frame-options',
    'content-security-policy',
    'content-security-policy-report-only',
    'x-content-security-policy',
    'x-webkit-csp'
  ]
}).listen(port, host, () => {
  console.log(`CORS Anywhere proxy server running on ${host}:${port}`);
}); 