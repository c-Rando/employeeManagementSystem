module.exports = {
    getQuery: `SELECT role.id, role.title, role.salary, department.name as department
               FROM role INNER JOIN department ON role.department_id = department.id`,
    insertQuery: `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`,
    deleteQuery: `DELETE FROM role WHERE id = ?`
};