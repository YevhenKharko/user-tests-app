const dbQuery = require("../db");

const getTests = id => dbQuery(`SELECT * FROM tests WHERE user_id = ${id}`);

const getAvailableTests = id => dbQuery(`
  SELECT * FROM tests
  WHERE status = 0 AND user_id = ?
`, [id]);

const startNewTest = async id => {
  const availableTests = await getAvailableTests(id);
  console.log('new test started');

  if (!availableTests.length) {
    return null;
  }

  const selectedTest = availableTests[Math.floor(Math.random() * availableTests.length)];

  return selectedTest;
};

const getTest = (userId, testId) => dbQuery(`SELECT * FROM tests WHERE id = ? AND user_id = ?`, [testId, userId]);

const checkTest = async (userId, testId, answer) => {
  console.log('checking test');
  const test = await dbQuery(`SELECT * FROM tests WHERE id = ? AND user_id = ?`, [testId, userId]).then(([test]) => test);
  const isCorrect = +test.answer === +answer.answer;

  if (isCorrect) {
    await dbQuery(`UPDATE tests SET status = 1 WHERE id = ?`, [testId]);
    return { statusCode: 200, isCorrect };
  } else {
    return { statusCode: 400, isCorrect };
  }
};

module.exports = {
  getTests,
  getTest,
  startNewTest,
  checkTest,
};
