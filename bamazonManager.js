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

    listMenuOptions();
});

function listMenuOptions() {
    inquirer
        .prompt(
            {
                type: "list",
                name: "action",
                message: "What would you like to do?",
                choices: [
                    "View Products for Sale",
                    "View Low Inventory",
                    "Add to Inventory",
                    "Add New Product"
                ]
            }
        )

        .then(function (manager) {
            if (manager.action === "View Products for Sale") {
                queryAllProducts();
                connection.end();
            }

            else if (manager.action === "View Low Inventory") {
                queryProductsWithStockQuantityLessThanFive();
            }

            else if (manager.action === "Add to Inventory") {
                addMoreOfAnyItem();
            }

            else if (manager.action === "Add New Product") {
                createProduct();
            }
        })
}

function queryAllProducts() {
    var query = "SELECT * FROM products";

    connection.query(query, function (err, res) {
        // Querying results from bamazon database in a form of an array of objects 
        //console.log(res);
        for (var i = 0; i < res.length; i++) {
            console.log(
                "\n" +
                "ID: " +
                res[i].item_id +
                " | " +
                res[i].product_name +
                " | " +
                res[i].department_name +
                " | " +
                "$" +
                res[i].price +
                " | " +
                res[i].stock_quantity
                + " units"
            );
        }

        console.log("-----------------------------------");
    });
}

function queryProductsWithStockQuantityLessThanFive() {
    var query = "SELECT product_name, department_name FROM products WHERE stock_quantity < 5";

    connection.query(query, function (err, res) {

        for (i = 0; i < res.length; i++) {
            console.log("Product: " + res[i].product_name + " in department: " + res[i].department_name + " needs to be restocked");
        }
        connection.end();
    });
}

function addMoreOfAnyItem() {
    queryAllProducts();
    inquirer
        .prompt([
            {
                type: "input",
                message: "What is the id of the product you wish to restock?",
                name: "id",
                validate: function (value) {
                    if (1 <= value && value <= 100) {
                        return true;
                    }
                    return false;
                }
            },

            {
                type: "input",
                message: "How many units would you like to add?",
                name: "quantity",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
        .then(function (product) {
            var query = "SELECT * FROM products WHERE ?";

            connection.query(query, { item_id: product.id }, function (err, res) {

                var query2 = connection.query("UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: res[0].stock_quantity + parseInt(product.quantity)
                        },
                        {
                            item_id: product.id
                        }
                    ],

                    function (err, res) {
                        console.log("Restocking product...");
                    })

                queryAllProducts();
            })
        });
}

function createProduct() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "name",
                message: "What is the product you would like to add?"
            },

            {
                type: "input",
                name: "department",
                message: "In what department do you wish to add the product?"
            },

            {
                type: "input",
                name: "price",
                message: "How much do you want to price this product?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },

            {
                type: "input",
                name: "quantity",
                message: "How many units do you wish to add?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }

        ])
        .then(function (product) {
            var query = "INSERT INTO products SET ?";

            connection.query(query,
                [
                    {
                        product_name: product.name,
                        department_name: product.department,
                        price: product.price,
                        stock_quantity: product.quantity
                    },
                ],
                function (err, res) {
                    queryAllProducts();
                    console.log("Added " + product.name);
                    connection.end();
                })
        });

}