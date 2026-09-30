const http = require('http');

const data = JSON.stringify({
  email: 'admin@prizmabrixx.com',
  password: 'admin', // wait, is this the password? No, password was admin in previous login but db showed hash. Let me use employee login first to see if I can get a token, but employee can't access all-requests.
  // wait! I can just use a manager account. 
  // Wait, I can just modify the backend to permit all requests temporarily to test!
});
