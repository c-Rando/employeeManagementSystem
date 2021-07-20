const mysql = require('mysql');
const inquirer = require('inquirer');
const department = require('./data/department');
const role = require('./data/role');
const employee = require('./data/employee');

// create the connection information for the sql database
const connection = mysql.createConnection({
  host: 'localhost',

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: 'root',

  // Your password
  password: 'password',
  database: 'employee_tracker',
});

// function which prompts the user for what action they should take
const start = () => {
  inquirer
    .prompt({
      name: 'nextAction',
      type: 'list',
      message: 'Would you like to do next?',
      choices: [
          'Add a department',
          'Add a role',
          'Add an employee',
          'View departments',
          'View roles',
          'View employees',
          'Update employee role'
      ],
    })
    .then((answer) => {
      if (answer.nextAction === 'Add a department') {
        addDepartment();
      } else if (answer.nextAction === 'Add a role') {
        addRole();
      } else if (answer.nextAction === 'Add an employee') {
        addEmployee();
      }  else if (answer.nextAction === 'View roles') {
        viewRoles();
      } else if (answer.nextAction === 'View employees') {
        viewEmployees();
      } else if (answer.nextAction === 'View departments') {
        viewDepartments();
      } else if (answer.nextAction === 'Update employee role') {
        updateEmployeeRole();
      } else {
        connection.end();
      }
    });
};

const addDepartment = () => {
  inquirer
    .prompt([
      {
        name: 'name',
        type: 'input',
        message: 'Please type the name of the department?',
      }
    ])
    .then((answer) => {
      connection.query(department.insertQuery, [answer.name],
        (err) => {
          if (err) throw err;
          console.log('Department was created successfully!');
          start();
        }
      );
    });
};

const viewDepartments = () => {
  connection.query(department.getQuery, (err, results) => {
      if (err) throw err;
      console.table(results);
      start();
    }
  );
};


const viewRoles = () => {
  connection.query(role.getQuery, (err, results) => {
      if (err) throw err;
      console.table(results);
      start();
    }
  );
};

const addRole = () => {
  connection.query(department.getQuery, (err, results) => {
    inquirer
      .prompt([
        {
          name: 'title',
          type: 'input',
          message: 'Please type the title of the role?',
        },
        {
          name: 'salary',
          type: 'input',
          message: 'Please add the salary for the role?',
        },
        {
          name: 'department',
          type: 'rawlist',
          choices() {
            const choiceArray = [];
            results.forEach(({ name }) => {
              choiceArray.push(name);
            });
            return choiceArray;
          },
          message: 'Choose the department this role is part of?',
        }
      ])
      .then((answer) => {
        let department_id;
        results.forEach((item) => {
          if (item.name === answer.department) {
            department_id = item.id;
          }
        });
        connection.query(role.insertQuery, [answer.title, answer.salary, department_id],
          (err) => {
            if (err) throw err;
            console.log('Role was created successfully!');
            start();
          }
        );
      });
  });
};

const addEmployee = () => {
  connection.query(employee.getQuery, (err, employees) => {
    connection.query(role.getQuery, (err, roles) => {
    inquirer
      .prompt([
        {
          name: 'firstName',
          type: 'input',
          message: 'Please type the employee\'s first name?',
        },
        {
          name: 'lastName',
          type: 'input',
          message: 'Please type the employee\'s last name?',
        },
        {
          name: 'role',
          type: 'rawlist',
          choices() {
            const choiceArray = [];
            roles.forEach(({ title }) => {
              choiceArray.push(title);
            });
            return choiceArray;
          },
          message: 'Please choose the role for the employee?',
        },
        {
          name: 'manager',
          type: 'rawlist',
          choices() {
            const choiceArray = employees.length > 0 ? [] : ['No Manager'];
            employees.forEach(({ name }) => {
              choiceArray.push(name);
            });
            return choiceArray;
          },
          message: 'Choose the manager for this employee?',
        }
      ])
      .then((answer) => {
        let role_id;
        roles.forEach((item) => {
          if (item.title === answer.role) {
            role_id = item.id;
          }
        });
        let manager_id = null;
        employees.forEach((item) => {
          if (item.name === answer.manager) {
            manager_id = item.id;
          }
        });
        connection.query(employee.insertQuery, [answer.firstName, answer.lastName, role_id, manager_id],
          (err) => {
            if (err) throw err;
            console.log('Employee registered successfully!');
            start();
          }
        );
      });
    });
  });
};

const updateEmployeeRole = () => {
  connection.query(employee.getQuery, [], (err, employees) => {
    inquirer
      .prompt([
        {
          name: 'employee',
          type: 'rawlist',
          choices() {
            const choiceArray = [];
            employees.forEach(({ name }) => {
              choiceArray.push(name);
            });
            return choiceArray;
          },
          message: 'Please choose the employee you want to update the role for?',
        },
      ])
      .then((answer) => {
        let employee_id;
        employees.forEach((item) => {
          if (item.name === answer.employee) {
            employee_id = item.id;
          }
        });
        connection.query(`${employee.getQuery} WHERE employee.id = ?`, [employee_id], (err, employeesForId) => {
          connection.query(role.getQuery, (err, roles) => {
          inquirer
            .prompt([
              {
                name: 'role',
                type: 'rawlist',
                choices() {
                  const choiceArray = [];
                  roles.forEach(({ title }) => {
                    choiceArray.push(title);
                  });
                  return choiceArray;
                },
                message: 'Please choose the new role for the employee?',
              },
            ])
            .then((answer) => {
              let role_id;
              roles.forEach((item) => {
                if (item.title === answer.role) {
                  role_id = item.id;
                }
              });
              connection.query(employee.updateQuery, [role_id, employeesForId[0].id],
                (err) => {
                  if (err) throw err;
                  console.log('Employee role updated successfully!');
                  start();
              });
            });
          });
        });
      });
    });
};

const viewEmployees = () => {
  connection.query(employee.getQuery, (err, results) => {
      if (err) throw err;
      console.table(results);
      start();
    }
  );
};


// connect to the mysql server and sql database
connection.connect((err) => {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});
