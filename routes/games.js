var express = require('express');
var router = express.Router();
let db = require('../DAL/DataAccess');

router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/topfivegames', function (req, res) {
    db.getTopFiveGames(function (result) {
        res.send(result);
    });
});

router.get('/getAll_Items', function (req, res) {
    db.getAll_Items(function (result) {
        res.send(result);
    });
});

router.get('/getCategories', function (req, res) {
    db.getCategories(function (result) {
        res.send(result);
    });
});

router.get('/getLastMonthItems', function (req, res) {
    db.getLastMonthItems(function (result) {
        res.send(result);
    });
});

router.get('/getItemByID', function (req, res) {
    let gameName = req.query.gameName;  // req query /getItemByID?gameName=param
    db.getItemByID(gameName,function (result) {
        res.send(result);

    })
});

router.get('/getItemsByCategory', function (req, res) {
    let category = req.query.category;  // req query /getItemsByCategory?category=param
    db.getItemsByCategory(category,function (result) {
        res.send(result);
    })
});

router.get('/getStorage', function (req, res) {
    db.getStorage(function (result) {
        res.send(result);
    })
});



router.put('/updateAmount',function (req,res,next) {
    let gameName = req.body.gameName;
    let StokeAmount = req.body.StokeAmount;
    db.updateStorageAmount(gameName,StokeAmount,function (result){
        let status = (result==="The storage updated") ? 200:406;
        res.status(status).send(result);
    })
});

router.post('/addGame',function (req,res,next) {
    let gameName = req.body.gameName;
    let desc = req.body.description;
    let picPath = req.body.picPath;
    let publisher = req.body.publisher;
    let price = req.body.price;
    let stokeAmount = req.body.stokeAmount;
    let category = req.body.category;
    db.addItem(gameName,desc,picPath,publisher,price,stokeAmount,category,function (result) {
        let status = (result ==='Insertion completed') ? 200:406;
        res.status(status).send(result);

    })
});

/*
 router.use('/removeItem',function (req,res,next) {
 let gameName = req.query.gameName;
 db.removeItem(gameName,function (result) {
 res.send(result);
 })
 });
 */
router.delete('/deleteGame', function (req, res,next) {
    let gameName = req.body.gameName;
    db.deleteGame(gameName, function (ans) {
        let status = (ans==='game ' + gameName + ' deleted Successfully') ? '200':'406';
        res.sendStatus(status);
    })
});

module.exports = router;