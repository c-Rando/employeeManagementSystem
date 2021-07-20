module.exports = {
    getQuery: `SELECT * FROM department`,
    insertQuery: `INSERT INTO department (name) VALUES (?)`,
    deleteQuery: `DELETE FROM department WHERE id = ?`
};