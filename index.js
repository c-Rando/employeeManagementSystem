const mysql = require('mysql');
const inquirer = require('inquirer');

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
          'View employees',
          'View roles',
          'Update employee role',
          'Update employee manager',
          'Delete a department',
          'Delete a role',
          'Delete an employee',
      ],
    })
    .then((answer) => {
      if (answer.nextAction === 'Add a department') {
        addDepartment();
      } else if (answer.nextAction === 'Add a role') {
        bidAuction();
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
      },
    //   {
    //     name: 'startingBid',
    //     type: 'input',
    //     message: 'What would you like your starting bid to be?',
    //     validate(value) {
    //       if (isNaN(value) === false) {
    //         return true;
    //       }
    //       return false;
    //     },
    //   },
    ])
    .then((answer) => {
      // when finished prompting, insert a new item into the db with that info
      connection.query(
        'INSERT INTO department (name) VALUES (?)',
        // QUESTION: What does the || 0 do?
        [answer.name],
        (err) => {
          if (err) throw err;
          console.log('Department was created successfully!');
          // re-prompt the user for if they want to bid or post
          start();
        }
      );
    });
};

const bidAuction = () => {
  // query the database for all items being auctioned
  connection.query('SELECT * FROM auctions', (err, results) => {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to bid on
    inquirer
      .prompt([
        {
          name: 'choice',
          type: 'rawlist',
          choices() {
            const choiceArray = [];
            results.forEach(({ item_name }) => {
              choiceArray.push(item_name);
            });
            return choiceArray;
          },
          message: 'What auction would you like to place a bid in?',
        },
        {
          name: 'bid',
          type: 'input',
          message: 'How much would you like to bid?',
        },
      ])
      .then((answer) => {
        // get the information of the chosen item
        let chosenItem;
        results.forEach((item) => {
          if (item.item_name === answer.choice) {
            chosenItem = item;
          }
        });

        // determine if bid was high enough
        if (chosenItem.highest_bid < parseInt(answer.bid)) {
          // bid was high enough, so update db, let the user know, and start over
          connection.query(
            'UPDATE auctions SET ? WHERE ?',
            [
              {
                highest_bid: answer.bid,
              },
              {
                id: chosenItem.id,
              },
            ],
            (error) => {
              if (error) throw err;
              console.log('Bid placed successfully!');
              start();
            }
          );
        } else {
          // bid wasn't high enough, so apologize and start over
          console.log('Your bid was too low. Try again...');
          start();
        }
      });
  });
};

// connect to the mysql server and sql database
connection.connect((err) => {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});
