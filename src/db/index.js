const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Sql_root_1488',
  database: 'users-tests',
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to database');
  }
});

const dbQuery = (query = '', data = []) => new Promise((res, rej) => {
  db.query(query, data, (err, result) => {
    if (err) return rej(err);
    return res(result);
  });
});

module.exports = dbQuery;