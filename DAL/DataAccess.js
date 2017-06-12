/**
 * Created by Eliran on 08/06/2017.
 */
// Data Access
var Connection = require('tedious').Connection;
var DButilsAzure = require('./DBUtils');

var dBconfig = {
    userName: 'nachamni',
    password: 'asdfG2hj',
    server: 'dbelirannach.database.windows.net',
    requestTimeout: 3000,
    options: {encrypt: true, database: 'dbelirannach'}
};

let dBConnection = new Connection(dBconfig);
var connected = false;
dBConnection.on('connect', function (err) {
    if (err) {
        console.error('error connecting: ' + err.message);
    } else {
        console.log("Connected Azure");
        connected = true;
    }
});

module.exports.connected = connected;


//****************************************************** G A M E S ********************************************************************************

// G E T :
exports.getTopFiveGames = function (callback) {
    DButilsAzure.Select(dBConnection, 'SELECT Top 5 dbo.GamesInOrders.gameName , sum(dbo.GamesInOrders.amount) AS Total	FROM Orders LEFT JOIN dbo.GamesInOrders ON dbo.Orders.orderID = dbo.GamesInOrders.orderID	   WHERE DATEDIFF(day,current_timestamp,orderDate) <= 7   GROUP BY dbo.GamesInOrders.gameName    ORDER BY Total desc ',
        callback)
};

exports.getAll_Items = function (callback) {
    DButilsAzure.Select(dBConnection, 'select * from Games ;',
        callback)
};

exports.getCategories = function (callback) {
    DButilsAzure.Select(dBConnection, 'select distinct Category from [Games] ',
        callback)
};

exports.getLastMonthItems = function (callback) {
    DButilsAzure.Select(dBConnection, 'select  gameName from Games where DATEDIFF(day,current_timestamp,releaseDate) <= 30 ',
        callback)
};

exports.getItemByID = function (gameName, callback) {
    DButilsAzure.Select(dBConnection, 'select * from [Games] where gameName = ' + "'" + gameName + "'",
        callback)
};

exports.getItemsByCategory = function (category, callback) {
    DButilsAzure.Select(dBConnection, 'select * from [Games] where category = ' + "'" + category + "'",
        callback)
};

exports.getStorage = function (callback) {
    DButilsAzure.Select(dBConnection, 'select gameName,stokeAmount from [Games]',
        callback)
};

// P O S T :

exports.addItem = function (gameName, desc, picPath, publisher, price, stokeAmount, category, callback) {
    DButilsAzure.promiseSelect(dBConnection, 'select [gameName] from [Games] where gameName = ' + "'" + gameName + "'")
        .then(function (ans) {
            if(ans.length>0) // game exists
            {
                callback('The game ' + "'"+gameName+"'"+' is already exists');
            }
            else{
                DButilsAzure.promiseInsert(dBConnection, 'insert into games (gameName,releaseDate,[description],picPath,publisher,price,stokeAmount,category) values('+"'" + gameName + "'" + ', current_timestamp, ' + "'" + desc + "'" + ",'" + picPath + "'," + "'" + publisher + "'"+',' +  price  + ',' + stokeAmount + ',' + "'" + category + "'"+')',
                    callback).then(function (ans) {
                    callback('Insertion completed');
                }).catch(function () {
                    console.log("error in insertion");
                })
            }
        })
};

// P U T :
let updateStorageAmount = function (gameName, StokeAmount, callback) {
    DButilsAzure.promiseSelect(dBConnection, 'select [StokeAmount] from [Games] where gameName = ' + "'" + gameName + "'").then(function (ans) {
        if (ans.length > 0) {
            let amount = parseInt(StokeAmount);
            let TotalAmount = amount + ans[0]["StokeAmount"];
            if (TotalAmount >= 0) {
                DButilsAzure.promiseUpdate(dBConnection, 'update Games SET StokeAmount = ' + TotalAmount + 'where gameName = ' + "'" + gameName + "'")
                    .then(function () {
                        callback("The storage updated");
                    })
            }
            else
                callback('new amount change is illegal')
        }
        else callback('the item is not exist');
    })


};
exports.updateStorageAmount = updateStorageAmount;


// D E L E T E :
exports.removeItem = function (gameName, callback) {
    DButilsAzure.promiseUpdate(dBConnection, 'DELETE from Games where gameName = ' + "'" + gameName + "'", callback)
};

exports.deleteGame = function (gameName, callback) {
    DButilsAzure.promiseSelect(dBConnection, 'Select * from Games where gameName = ' + "'" + gameName + "'")
        .then(function (ans) {
            if (ans.length > 0) {   // game exist - delete
                DButilsAzure.promiseUpdate(dBConnection, 'delete from [Carts] where gameName = ' + "'" + gameName + "'")
                    .then(function () {
                        DButilsAzure.promiseUpdate(dBConnection, 'delete from [Games] where gameName = ' + "'" + gameName + "'")
                            .then(callback('game ' + gameName + ' deleted Successfully'))
                    })
            }
            else {
                callback('There are no game with the name: ' + gameName);
            }
        })
};


//****************************************************** U S E R S ********************************************************************************

// G E T :
exports.getAllUsers = function (callback) {
    DButilsAzure.Select(dBConnection, 'Select * from Clients',
        callback)
};

exports.getUserByID = function (userName, callback) {
    DButilsAzure.Select(dBConnection, 'select * from [Clients] where userName = ' + "'" + userName + "'",
        callback)
};

exports.recoveryPassword = function (userName, ansQes1, ansQes2, callback) {
    DButilsAzure.Select(dBConnection, 'select [password] from Clients where userName = ' + "'" + userName + "'" + ' and ansFirstQ = '
        + "'" + ansQes1 + "'" + ' and ansSecondQ = ' + "'" + ansQes2 + "'", callback);
};

exports.getRecomandation = function (userName, callback) {
    DButilsAzure.Select(dBConnection, 'select top 5 GN, ISNULL(Total,0) as Quantity from (select gameName as GN from (ClientCategories as A left join [dbo].[Games] as B on A.category = B.category ) where A.userName = ' + "'" + userName + "'" + ') as part1 left join (select gameName , sum(amount) as Total from [dbo].[GamesInOrders] group by gameName) as part2 on part1.GN = part2.gameName order by Total desc'
        , callback)
};


// P O S T :

exports.register = function (userName, password, firstName, lastName, country, address, phone, ansFirstQ, ansSecondQ, categories, callback) {
    let tempUserNem = "" + userName;
    DButilsAzure.promiseSelect(dBConnection, 'select [userName] from [Clients] where userName = ' + "'" + tempUserNem + "'")
        .then(function (ans) {
            if (ans.length > 0)
                callback('The user name is already exists');
            else { // userName Not exist - ok
                DButilsAzure.promiseInsert(dBConnection, 'INSERT into Clients (userName, password, firstName, lastName, country, address, phone, ansFirstQ, ansSecondQ, isAdmin, lastLogin) VALUES(' + "'" + userName + "','" + password + "'" + ",'" + firstName + "'," + "'" + lastName + "'," + "'" + country + "'," + "'" + address + "'," + "'" + phone + "'," + "'" + ansFirstQ + "'," + "'" + ansSecondQ + "',0,current_timestamp)")
                    .then(function () {
                        let query = '';
                        for (let i = 0; i < categories.length; i++)
                            query += '(' + "'" + userName + "', '" + categories[i] + "'" + '),';
                        query = query.substring(0, query.length - 1);
                        DButilsAzure.Insert(dBConnection, 'insert into [dbo].[ClientCategories] (userName,category) values ' + query, function (result) {
                            callback(result)
                        });

                    })
            }
        })
};


exports.login = function (userName, password, callback) {
    DButilsAzure.promiseSelect(dBConnection, 'select * from [Clients] where userName = ' + "'" + userName + "' and password = " + "'" + password + "'")
        .then(function (ans) {
            if (ans.length > 0) {
                let lastTime = ans[0]["lastLogin"];
                let admin = ans[0]["isAdmin"];
                updateLastLogin(userName, function () {
                });
                let type = admin ? 'admin' : 'user';
                callback('The ' + type + " " + userName + ' is connected, last login: ' + lastTime);
            }
            else
                callback("The password or user name does not correct");
        })
        .catch(function (err) {
            console.log(err);
        });
};

// P U T :

let updateLastLogin = function (userName, callback) {
    DButilsAzure.promiseUpdate(dBConnection, 'UPDATE Clients SET lastLogin = (CURRENT_TIMESTAMP) where userName = ' + "'" + userName + "'").then(function () {
        callback('last login is updated');
    })
        .catch(function () {
            callback('the login not updated');
        })
};


exports.updateLastLogin = updateLastLogin;

exports.setAdmin = function (userName, callback) {
    DButilsAzure.promiseSelect(dBConnection, 'Select * from Clients where userName = ' + "'" + userName + "'")  // check if the user exists
        .then(function (ans) {
            if (ans.length > 0) {
                DButilsAzure.promiseUpdate(dBConnection, 'update clients set isAdmin = 1 where userName = ' + "'" + userName + "'")
                    .then(callback('The User ' + userName + ' is Admin!'))
                    .catch(function () {
                        callback('Failed in promise 2')
                    })
            }
            else {
                callback('There is no user with the name ' + userName);
            }
        }).catch(function () {
        callback('Failed in promise 1')
    })
};


exports.setCurrency = function (currency,rate, callback) {
    DButilsAzure.promiseSelect(dBConnection, 'select Currency from currencies where currency =' + "'" + currency + "'")  // check if the user exists
        .then(function (ans) {
            if (ans.length > 0) {
                DButilsAzure.promiseUpdate(dBConnection, 'Update currencies SET (rate= '+"'"+rate+"'"+') where currency =' + "'" + currency + "'")
                    .then(callback('Rate for currency '+"'"+currency+"'"+' is updated!'))
                    .catch(function () {
                        callback('Failed in promise 2')
                    })
            }
            else {
                callback('There is no currency with the name ' + currency);
            }
        }).catch(function () {
        callback('Failed in promise 1')
    })
};
// D E L E T E
exports.deleteUser = function (userName, callback) {
    DButilsAzure.promiseSelect(dBConnection, 'Select * from Clients where userName = ' + "'" + userName + "'")
        .then(function (ans) {
            if (ans.length > 0) {   // user exist - delete
                DButilsAzure.promiseUpdate(dBConnection, 'delete from [ClientCategories] where userName = ' + "'" + userName + "'")
                    .then(function () {
                        DButilsAzure.promiseUpdate(dBConnection, 'delete from [Carts] where userName = ' + "'" + userName + "'")
                            .then(function () {
                                DButilsAzure.promiseUpdate(dBConnection, 'delete from [Clients] where userName = ' + "'" + userName + "'")
                                    .then(callback('user name ' + userName + ' deleted Successfully'))
                            })
                    })
            }
            else {
                callback('There are no user with the name: ' + userName);

            }
        })
};


//****************************************************** O R D E R S ********************************************************************************

// G E T :

exports.getAllOrders = function (callback) {
    DButilsAzure.Select(dBConnection, 'select * from Orders',
        callback)
};

exports.getOrderInfo = function (orderID, callback) {
    DButilsAzure.Select(dBConnection, 'select * from [Orders] where orderID = ' + orderID,
        callback)
};

exports.getUserOrders = function (userName, callback) {
    DButilsAzure.Select(dBConnection, 'select * from [Orders] where userName = ' + "'" + userName + "'",
        callback)
};

exports.getOrdersGames = function (orderID, callback) {
    DButilsAzure.Select(dBConnection, 'Select gameName, amount from gamesInOrders where OrderID = ' + "'" + orderID + "'",
        callback)
};

// P U T :
exports.confirmNewOrder = function (userName,currency,shipDate, callback) {
    let query = 'select * from [Clients] where userName = ' + "'" + userName + "'";
    DButilsAzure.Select(dBConnection, query, function (ans) {
        if (ans.length > 0) {
            DButilsAzure.promiseSelect(dBConnection,'IF (select count(*) from carts where userName = '+"'"+userName+"'"+') <1 select '+"'"+'cart'+"'"+' as ans else IF(select MIN(games.stokeAmount-carts.amountInCart) AS  Qnt FROM carts LEFT JOIN  games on carts.gameName = games.gameName WHERE dbo.carts.userName=' + "'" + userName + "'" + ')>=0   (SELECT ISNULL(MAX(OrderId),0)+1 as ans FROM Orders) ELSE SELECT  '+ "'" + userName + "'"+' AS ans ')
                .then(function (ans) {
                    //console.log(ans[0]);
                    //console.log("active");
                    //console.log(ans[0]["ans"]);
                    if (ans.length > 0 && ans[0]["ans"] === 'cart') {
                        callback('the user '+ userName+ ' doest not have a cart with games');
                        return;
                    }
                    if (ans.length > 0 && ans[0]["ans"] === userName) {
                        callback('Invalid cart amounts, store does not have enough units');
                        return;
                    }
                    else if (ans.length === 0) {
                        callback('The cart is empty');
                        return;
                    }
                    else {
                        getCartInfo(userName, function (ans) {
                            let newQuery = '';
                            let cart = ans;
                            for (let i = 0; i < ans.length; i++) {
                                newQuery += 'Update games set stokeAmount = (games.stokeAmount-' + "'" + ans[i]["amountInCart"] + "'" + ') where gameName = ' + "'" + ans[i]["gameName"] + "'";
                                newQuery += ';'

                            }
                            newQuery = newQuery.substring(0, newQuery.length - 1);
                            DButilsAzure.promiseUpdate(dBConnection, newQuery, function (ans) {
                                console.log(ans);
                            })
                                .then(function (ans) {
                                    newQuery = 'INSERT INTO dbo.Orders(orderID, userName, orderDate, shipmentDate, currency, totalAmount ) VALUES ( (SELECT ISNULL(MAX(orderID),0)+1 AS orderID FROM orders), ' + "'" + userName + "'" + ', current_timestamp,'+"'"+shipDate+"'"+','+ "'" + currency + "'" + ', (SELECT sum(amountInCart*price) AS totalAmount FROM carts LEFT JOIN games ON carts.gameName = games.gameName WHERE dbo.carts.userName=' + "'" + userName + "'" + ') )';
                                    DButilsAzure.promiseInsert(dBConnection, newQuery)
                                        .then(function (ans) {
                                            console.log(cart);
                                            let newQ = 'INSERT INTO [dbo].[GamesInOrders] (orderID,gameName,amount) VALUES ';
                                            for (let i = 0; i < cart.length; i++) {
                                                newQ += '( (SELECT ISNULL(MAX(OrderID),0) AS orderID FROM orders),' + "'" + cart[i]["gameName"] + "'" + ',' + cart[i]["amountInCart"] + ') ,';
                                            }
                                            newQ = newQ.substring(0, newQ.length - 1);
                                            DButilsAzure.promiseInsert(dBConnection, newQ)
                                                .then(function (ans) {
                                                    let query = 'delete from carts where userName = ' + "'" + userName + "'";
                                                    DButilsAzure.promiseUpdate(dBConnection, query).then(function () {
                                                        callback('The order is done and update the carts');
                                                    })
                                                })
                                        })

                                })


                        })
                    }

                })
        }
        else
            callback('The user ' + userName + ' not exist');
    });

};


//****************************************************** C A R T  **************************************************************************************
// G E T :
let getCartInfo = function (userName, callback) {
    DButilsAzure.Select(dBConnection, 'select  gameName, amountInCart from [Carts] where userName = ' + "'" + userName + "'",
        callback)
};

exports.getCartInfo = getCartInfo;
// P O S T :
//
exports.addToCart = function (userName, game, amount, callback) {
    DButilsAzure.promiseSelect(dBConnection, 'select [userName] from [Clients] where userName = ' + "'" + userName + "'")
        .then(function (ans) {
            if (ans.length > 0) {   // user exist - continue
                DButilsAzure.promiseSelect(dBConnection, 'select gameName from games where gameName = ' + "'" + game + "'")
                    .then(function (ans) { // game exists - add to cart
                        if (ans.length > 0) {
                            getCartInfo(userName, function (ans) {
                                let numOfAlreadyGamesInCart = ans.length;
                                let exist = false;
                                let currentAmount = 0;
                                for (let i = 0; i < numOfAlreadyGamesInCart && !exist; i++) {
                                    if (ans[i]["gameName"] == game) {
                                        exist = true;
                                        currentAmount = ans[i]["amountInCart"];
                                    }
                                }
                                if (exist) // the game exist in the cart -> need to update the amount
                                    updateItemAmountAtCart(userName, game, amount + currentAmount, false, callback);
                                else {
                                    DButilsAzure.promiseInsert(dBConnection, 'insert into Carts (userName,gameName,amountInCart) values (' + "'" + userName + "','" + game + "'" + ",'" + amount + "')")
                                        .then(function () {
                                            callback('The cart has been modified');
                                        })
                                }
                            })

                        }
                        else   callback('The item ' + game + ' is not exists');
                    })
            }
            else   callback('The user ' + userName + ' is not exists');
        })
};


// P U T :
let updateItemAmountAtCart = function (userName, game, amount, check, callback) {
    let query = 'select * from [Clients] where userName = ' + "'" + userName + "'";
    if (check) // check if the user exist-> is needed if called from app.js
        DButilsAzure.Select(dBConnection, query, function (ans) {
            if (ans.length > 0) {
                doUpdateItemAmountAtCart(userName, game, amount, check, callback);
            }
            else
                console.log('There are no user ' + userName);
        });
    else
        doUpdateItemAmountAtCart(userName, game, amount, check, callback);
};


let doUpdateItemAmountAtCart = function (userName, game, amount, check, callback) {
    DButilsAzure.promiseUpdate(dBConnection, 'update Carts set amountInCart = ' + amount + ' where userName = ' + "'" + userName + "'" + ' and gameName = ' + "'" + game + "'")
        .then(function () {
            callback('The cart has been modified');
        }).catch(function () {
        callback('The cart has NOT been modified');
    })
};


exports.updateItemAmountAtCart = updateItemAmountAtCart;

// D E L E T E 
exports.deleteItemFromCart = function (userName, gameName, callback) {
    DButilsAzure.promiseSelect(dBConnection, 'select [userName] from [Clients] where userName = ' + "'" + userName + "'")// check if user exists
        .then(function (ans) {
            if (ans.length > 0) {
                DButilsAzure.promiseSelect(dBConnection, 'select  gameName, amountInCart from [Carts] where userName = ' + "'" + userName + "'" + ' and gameName = ' + "'" + gameName + "'")
                    .then(function (ans) {
                        if (ans.length > 0) { //check if user has the game in the cart
                            DButilsAzure.promiseUpdate(dBConnection, 'delete from carts where userName= ' + "'" + userName + "'" + ' and gameName = ' + "'" + gameName + "'")
                                .then(callback('The game ' + gameName + ' deleted Successfully'))
                                .catch(function () {
                                    console.log('There was problem in promise 1 ');
                                })
                        }
                        else (callback('returned: The user doesn\'t have from this item in the cart: ' + gameName));


                    }).catch(function () {
                    console.log('There was a problem in promise 2');
                });

            }
            else (callback('The user is no exists'));
        }).catch(function () {
        console.log('There was problem in promise 1 ');
    })
};

