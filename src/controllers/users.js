const dbQuery = require("../db");

const getUsers = () => dbQuery(`SELECT * FROM users WHERE deleted_at IS NULL`);

const getUser = id => dbQuery(`SELECT * FROM users WHERE id = ${id}`).then(([user]) => user || null);

const createUser = ({ name, userName, password }) => dbQuery(
    `INSERT INTO users
    (name, user_name, password_hash)
    VALUES (?, ?, ?)`,
  [name, userName, password]
);

const verifyUser = ({ name, userName, password_hash }) => dbQuery(
  `SELECT * 
   FROM users 
   WHERE name = ? AND user_name = ? AND password_hash = ?`,
   [name, userName, password_hash]
);

const deleteUser = id => dbQuery(
    `UPDATE users
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
  [id]
);

const updateUser = async ({ id, name, userName, password }) => {
  const existingUser = await getUser(id);

  if (existingUser && existingUser.deleted_at === null) {
    return dbQuery(`
        UPDATE users
        SET name = ?, user_name = ?, password_hash = ?, deleted_at = NULL
        WHERE id = ?
    `, [name, userName, password, id]);
  } else {
    return Promise.resolve(null);
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  deleteUser,
  updateUser,
  verifyUser,
};
