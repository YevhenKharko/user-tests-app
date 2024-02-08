require('dotenv').config();
const mysql = require('mysql2/promise');
const express = require('express');
const cors = require('cors');
const errorHandler = require('./utils/errorHandler');
const md5 = require('md5');
const retry = require('retry');
const { getUsers, getUser, createUser, deleteUser, updateUser, verifyUser } = require('./controllers/users');
const { getTests, getTest, startNewTest, checkTest } = require('./controllers/tests');
const { HOST, PASSWORD, USER, DATABASE, DBPORT } = process.env;

const app = express();
const PORT = 3000;

const dbConfig = {
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATABASE,
};

const createTables = async () => {
  const operation = retry.operation({
    retries: 5,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 5000,
  });

  operation.attempt(async (currentAttempt) => {
    try {
      const connection = await mysql.createConnection(dbConfig);

      await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(20) NOT NULL,
      user_name VARCHAR(20) NOT NULL,
      password_hash VARCHAR(256) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL DEFAULT NULL,
      PRIMARY KEY (id)
    );
  `);

  await connection.query(`
  CREATE TABLE IF NOT EXISTS tests (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT(10) UNSIGNED NOT NULL,
    description VARCHAR(100) NOT NULL,
    answer VARCHAR(10) NOT NULL,
    status TINYINT(4) UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    INDEX fk_test_user (user_id),
    CONSTRAINT fk_test_user FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

      connection.end();
      console.log('Tables created successfully');
    } catch (error) {
      console.error(`Error creating tables (Attempt ${currentAttempt}):`, error);

      if (operation.retry(error)) {
        return;
      }
    }
  });
};
createTables();

app.use(errorHandler, express.json(), cors({
  origin: '*',
}));
//GET ALL USERS
app.get('/users', async (req, res, next) => {
  try {
    const data = await getUsers();
    return res.json(data);
  }
  catch (e) {
    console.error(e);
    return next(e);
  }
});
//GET USER BY ID
app.get('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await getUser(id);
    return res.json(data);
  }
  catch (e) {
    console.error(e);
    return next(e);
  }
});
//GET ALL TESTS FOR USER BY ID
app.get('/users/:id/tests', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await getTests(id);
    return !data.length ? res.json(null) : res.json(data);
  }
  catch (e) {
    console.error(e);
    return next(e);
  }
});
//GET ONE TEST FOR USER BY TEST ID
app.get('/users/:id/tests/:testId', async (req, res, next) => {
  try {
    const { id, testId } = req.params;
    const data = await getTest(id, testId);
    return !data.length ? res.json("There's no such test for this user!") : res.json(data);
  }
  catch (e) {
    console.error(e);
    return next(e);
  }
});
//START NEW TEST
app.post('/users/:id/tests', async (req, res, next) => {
  try {
    const { id } = req.params;
    const newTest = await startNewTest(+id);

    if (!newTest) {
      return res.status(404).json({ message: 'No available tests.' });
    }
    res.json(newTest);
  } catch (e) {
    console.error(e);
    return next(e);
  }
});
//SEND ANSWER FOR THE TEST
app.post('/users/:id/tests/:testId', async (req, res, next) => {
  try {
    const answer = req.body;
    const { id, testId } = req.params;
    const data = await checkTest(id, testId, answer);

    if (data.isCorrect) {
      return res.status(200).json('Test passed!');
    }
    return res.status(200).json('Your answer is incorrect');
  }
  catch (e) {
    console.error(e);
    return next(e);
  }
});
//CREATE NEW USER
app.post('/users/sign-up', async (req, res, next) => {
  try {
    const { name, user_name: userName, hash } = req.body;
    const password = md5(hash);

    if (!name || !userName || !password) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    await createUser({ name, userName, password });
    res.status(201).json({ message: 'User created successfully.' });
  } catch (e) {
    console.error(e);
    return next(e);
  }
});
//USER SIGN-IN
app.post('/users/sign-in', async (req, res, next) => {
  try {
    const { name, user_name: userName, hash } = req.body;

    if (!name || !userName || !hash) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const password_hash = md5(hash);

    const user = await verifyUser({ name, userName, password_hash });

    if (!user.length) {
      return res.status(404).json({ error: 'User is not found.' });
    }

    res.status(201).json(user);
  } catch (e) {
    console.error(e);
    return next(e);
  }
});
//DELETE USER
app.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await deleteUser(id);
    return res.json(data);
  }
  catch (e) {
    console.error(e);
    return next(e);
  }
});
//UPDATE USER(ALL THREE FIELDS REQUIRED)
app.put('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, user_name: userName, hash } = req.body;
    const password = md5(hash);

    if (!name || !userName || !hash) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    await updateUser({ id, name, userName, password });
    res.json({ message: 'User updated successfully.' });
  } catch (e) {
    console.error(e);
    return next(e);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
