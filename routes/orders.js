var express = require('express');
var router = express.Router();
let db = require('../DAL/DataAccess');

router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});


router.get('/getAllOrders', function (req,res) {
    db.getAllOrders(function (result) {
        res.send(result);
    });
});

router.get('/getOrderInfo', function (req, res) {
    let orderID = req.query.orderID;  // req query - > /getCartInfo?orderID = parameter
    db.getOrderInfo(orderID,function (result) {
        res.send(result);
    })
});


router.get('/getUserOrders', function (req, res) {
    let userName = req.query.userName;  // req query - > /getCartInfo?orderID = parameter
    db.getUserOrders(userName,function (result) {
        res.send(result);
    })
});

router.get('/getOrdersGames', function (req, res) {
    let orderID = req.query.orderID;  // req query - > /getCartInfo?orderID = parameter
    db.getOrdersGames(orderID,function (result) {
        res.send(result);
    })
});


router.put('/confirmNewOrder', function (req,res,next) {
    let userName = req.query.userName;
    let currency = req.query.currency;
    let shipDate = req.query.shipDate;

    db.confirmNewOrder(userName,currency,shipDate,function (result) {
        let status = (result ==='The order is done and update the carts') ? 200:406;
        res.status(status).send(result);
    })
});


module.exports = router;