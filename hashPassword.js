const bcrypt = require('bcrypt');
const plainPassword = 'admin1234';
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
  if (err) {
    console.error('Error creating hash:', err);
    return;
  }
  console.log('Hashed password:', hash);
  console.log('Use this hash to update the admin password in your database');
});