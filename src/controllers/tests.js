const dbQuery = require("../db");

const generateTest = async (complexity = 3, id) => {
  const signs = ['+', '-', '*'];
  const nums = Array.from({ length: complexity + 1 }, () => Math.floor(Math.random() * 10) + 1);
  const testExpression = nums.map((num, index) => {
    const operator = signs[Math.floor(Math.random() * signs.length)];
    return index === complexity ? num : `${num} ${operator}`;
  }).join(' ');

  const answer = eval(testExpression);

  await dbQuery(`
  INSERT INTO tests (user_id, description, answer, status)
  VALUES (?, ?, ?, 0);
`, [id, testExpression, answer]);

  const insertedTest = await dbQuery(`
  SELECT * FROM tests
  WHERE user_id = ? AND description = ?;
`, [id, testExpression]);

  return insertedTest;
};

const getTests = id => dbQuery(`SELECT * FROM tests WHERE user_id = ${id}`);

// const getAvailableTests = id => dbQuery(`
//   SELECT * FROM tests
//   WHERE status = 0 AND user_id = ?
// `, [id]);

const startNewTest = async id => {
  // const availableTests = await getAvailableTests(id);
  // console.log('new test started');

  // if (!availableTests.length) {
  //   return generateTest(3, id);
  // }

  // const selectedTest = availableTests[Math.floor(Math.random() * availableTests.length)];

  // return selectedTest;
  return await generateTest(3, id);
};

const getTest = (userId, testId) => dbQuery(`SELECT * FROM tests WHERE id = ? AND user_id = ?`, [testId, userId]);

const checkTest = async (userId, testId, answer) => {
  const test = await dbQuery(`SELECT * FROM tests WHERE id = ? AND user_id = ?`, [testId, userId]).then(([test]) => test);
  const isCorrect = +test.answer === +answer.answer;
  if (isCorrect) {
    await dbQuery(`UPDATE tests SET status = 1 WHERE id = ?`, [testId]);
    console.log('Test passed');
    return { statusCode: 200, isCorrect };
  }
  console.log('Test failed');
  return { statusCode: 400, isCorrect };
};

module.exports = {
  getTests,
  getTest,
  startNewTest,
  checkTest,
};
