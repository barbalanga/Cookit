const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'barby100',
  database: 'my_recipes',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('DB connection error:', err);
  } else {
    console.log('Connected to MySQL Database!');
    connection.release();
  }
});

module.exports = db;
