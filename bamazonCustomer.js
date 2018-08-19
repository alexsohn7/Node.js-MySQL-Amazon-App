var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: "root",

  password: "",

  database: "bamazon"
});

connection.connect(function (err) {
  if (err) throw err;

  queryAllProducts();
});

function queryAllProducts() {
  var query = "SELECT * FROM products";

  connection.query(query, function (err, res) {
    // Querying results from bamazon database in a form of an array of objects 
    //console.log(res);

    for (var i = 0; i < res.length; i++) {

      console.log(

        "ID: " +
        res[i].item_id +
        " | " +
        res[i].product_name +
        " | " +
        res[i].department_name +
        " | " +
        "$" +
        res[i].price +
        " | "

      );

    }

    console.log("-----------------------------------");

    placeOrder();

  });

  function placeOrder() {
    inquirer

      .prompt(
        [
          {
            type: "input",
            message: "What is the id of the product you would you like to buy?",
            name: "Id",
            validate: function (value) {
              if (1 <= value && value <= 10) {
                return true;
              }
              return false;
            }
          },

          {
            type: "input",
            message: "How many units of the product would you like to buy?",
            name: "quantity",
            validate: function (value) {
              if (isNaN(value) === false) {
                return true;
              }
              return false;
            }
          }
        ]
      )

      .then(function (product) {
        var query = "SELECT * FROM products WHERE ?";

        connection.query(query, { item_id: product.Id }, function (err, res) {
          // console.log(res[0].stock_quantity);

          var price = res[0].price;

          if (product.quantity <= res[0].stock_quantity) {

            var query2 = connection.query("UPDATE products SET ? WHERE ?",
              [
                {
                  stock_quantity: (res[0].stock_quantity - product.quantity)
                },

                {
                  item_id: product.Id
                }
              ],
              function (err, res) {
                if (err) throw err;
                console.log("Thanks for your order");
              }
            )

            console.log("Your total is $" + (product.Id * price));

            connection.end();

          } else {
            console.log("Insufficient quantity!");
          }
        });

      });
  }
}
