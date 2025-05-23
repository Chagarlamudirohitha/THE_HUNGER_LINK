import crypto from 'crypto';

// Generate a secure random key of 64 bytes (512 bits) and convert to base64
const jwtKey = crypto.randomBytes(64).toString('base64');

console.log('Generated JWT Secret Key:');
console.log(jwtKey); 