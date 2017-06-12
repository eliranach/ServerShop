var express = require('express');
var router = express.Router();
let db = require('../DAL/DataAccess');

router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/getCartInfo', function (req, res) {
    let userName = req.query.userName;  // req query - > /getCartInfo?userName = parameter
    db.getCartInfo(userName,function (result) {
        res.send(result);
    })
});

router.post('/addToCart', function (req,res,next) {
    let userName = req.body.userName;
    let game = req.body.game;
    let amount = req.body.amount;
    if (!userName || !game || !amount || !(parseInt(amount)) ||amount <= 0) {
        res.status(406).send('The receive data illegal');
        res.end();
    }
    else {
        db.addToCart(userName, game, amount, function (result) {
            let status = (result ==='The cart has been modified') ? 200:406;
            res.status(status).send(result);
        });

    }
});

router.put('/updateItemAmountAtCart', function (req,res,next) {
    let userName = req.body.userName;
    let game = req.body.game;
    let amount = req.body.amount;
    if (!userName || !game || !amount || !(parseInt(amount)) ||amount <= 0) {
        res.status(406).send('The receive data illegal');
        res.end();
    }
    else {
        db.updateItemAmountAtCart(userName, game, amount, true, function (result) {
            let status = (result ==='The cart has been modified') ? 200:406;
            res.status(status).send(result);
        });

    }
});


router.delete('/deleteItemFromCart', function (req, res,next) {
    let userName = req.body.userName;
    let game = req.body.game;
    db.deleteItemFromCart(userName,game , function (ans) {
        let status = (ans==='The game ' + game + ' deleted Successfully') ? '200':'406';
        res.sendStatus(status);
    })
});

module.exports = router;

