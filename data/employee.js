module.exports = {
    getQuery: `SELECT employee.id, CONCAT(employee.first_name, ' ', employee.last_name) AS name,
                      CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name,
                      role.title as role, role.salary, department.name as department
               FROM employee
               LEFT JOIN employee AS manager ON employee.manager_id = manager.id
               INNER JOIN role ON employee.role_id = role.id
               INNER JOIN department ON role.department_id = department.id`,
    insertQuery: `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`,
    updateQuery: `UPDATE employee SET role_id=? WHERE id=?`,
    deleteQuery: `DELETE FROM employee WHERE id = ?`
};