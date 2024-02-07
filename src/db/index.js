const mysql = require('mysql2');

const { HOST, USER, PASSWORD, DATABASE } = process.env

const db = mysql.createConnection({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATABASE,
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