require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./utils/errorHandler');
const md5 = require('md5');
const { getUsers, getUser, createUser, deleteUser, updateUser, verifyUser } = require('./controllers/users');
const { getTests, getTest, startNewTest, checkTest } = require('./controllers/tests');

const app = express();
const PORT = 3000;

app.use(errorHandler, express.json(), cors({
  origin: 'http://localhost:5173',
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
