// api/db.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'BD.env') });
const sql = require('mssql');

// For debugging
console.log('Environment variables loaded:');
console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_DATABASE:', process.env.DB_DATABASE);
console.log('DB_USER:', process.env.DB_USER);

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE,
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
    encrypt: false
  }
};

// Only use Windows Auth if explicitly configured
if (process.env.DB_TRUSTED_CONNECTION === 'true') {
  config.authentication = {
    type: 'default',
    options: {
      trustedConnection: true,
      integratedSecurity: true
    }
  };
  // Remove user/password for Windows Auth
  delete config.user;
  delete config.password;
}

const poolPromise = sql.connect(config)
  .then(pool => {
    console.log(`Conectado a la base de datos "${process.env.DB_DATABASE}"`);
    return pool;
  })
  .catch(err => {
    console.error('Fallo la conexión a la base de datos:', err);
  });

module.exports = {
  sql,
  poolPromise
};
