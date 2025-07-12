// Save as gen_hash.cjs and run with: node gen_hash.cjs
const bcrypt = require('bcryptjs');
bcrypt.hash('password123', 10, (err, hash) => {
  if (err) throw err;
  console.log('Hash:', hash);
});