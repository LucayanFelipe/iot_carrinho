const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'Astra',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true // 👈 Adicione isso
});

module.exports = pool;
