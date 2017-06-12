var express = require('express');
var router = express.Router();
let db = require('../DAL/DataAccess');
let bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

// create application/json parser
var jsonParser = bodyParser.json({type: 'application/json'});

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({extended: false});


/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource', 200);
});


router.get('/getUsers', function (req, res) {
    db.getAllUsers(function (result) {
        res.send(result);
    });
});

router.get('/getUserByID', function (req, res) {
    let userName = req.query.userName;  // req query - > /getUser?userName = parameter
    db.getUserByID(userName, function (result) {
        res.send(result, 200);
    })
});

router.get('/recoverPassword', function (req, res) {
    let userName = req.query.userName;  // req query - > /recoverPassword?userName=param&ansfirst=param&ansSec=param
    let ans1 = req.query.ansfirst;
    let ans2 = req.query.ansSec;
    db.recoveryPassword(userName, ans1, ans2, function (result) {
        res.send(result);
    })
});

router.put('/lastLogin', function (req, res, next) {
    let userName = req.query.userName;
    db.updateLastLogin(userName, function (result) {
        let status = (result==='last login is updated') ? 200:406;
        console.log(result);
        res.sendStatus(status);
    })
});

router.put('/setAdmin', function (req, res, next) {
    let userName = req.body.userName;
    db.setAdmin(userName, function (ans) {
        let status = (ans==='The User ' + userName + ' is Admin!') ? '200':'406';
        console.log(ans);
        res.sendStatus(status);
    })
});

router.post('/register', function (req, res, next) {

    let userName = req.body.userName;
    let password = req.body.password;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let country = req.body.country;
    let address = req.body.address;
    let phone = req.body.phone;
    let ansFirstQ = req.body.ansFirstQ;
    let ansSecondQ = req.body.ansSecondQ;
    let categories = req.body.categories; // array

    if (!userName || !password || !firstName || !lastName || !country || !address|| !phone || !ansFirstQ || !ansSecondQ || !categories) {

        res.send({status: "failed", response: "failed to register-missing mandatory field"});
        res.end();
    }
    else if(userName.length<3 || userName.length>8 || !(/^[a-zA-Z]+$/.test(userName)))
    {

        res.send({status: "failed", response: "userName length suppose to be between 3 to 8 and contain only letters"});
        res.end();
    }
    else if(password.length<5 || password.length>10 || !(/^[0-9a-zA-Z]+$/.test(password)))
    {
        res.send({status: "failed", response: "password length suppose to be between 5 to 10 and contains letters or digits only"});
        res.end();
    }

    else {
        db.register(userName, password, firstName, lastName, country, address, phone, ansFirstQ, ansSecondQ,categories, function (result) {
            let status = (result ==='Insertion succeed!') ? 200:406;
            res.status(status).send(result);
        });

    }
});

router.put('/setCurrency', function (req, res, next) {
    let currency = req.body.currency;
    let rate = req.body.rate;
    db.setCurrency(currency,rate, function (ans) {
        let status = (ans==='Rate for currency '+"'"+currency+"'"+' is updated!') ? '200':'406';
        res.status(status).send(ans);
    })
});

router.post('/login', function (req, res, next) {
    let userName = req.body.userName;
    let password = req.body.password;
    db.login(userName, password, function (ans) {
        let status = (ans ==="The password or user name does not correct") ? 406:200;
        res.status(status).send(ans);
    })
});

router.delete('/deleteUser', function (req, res,next) {
    let userName = req.body.userName;
    db.deleteUser(userName, function (ans) {
        let status = (ans==='user name ' + userName + ' deleted Successfully') ? '200':'406';
        res.sendStatus(status);
    })
});

router.get('/getRecomandation', function (req, res) {
    let userName = req.query.userName;  // req query - > /recoverPassword?userName=param&ansfirst=param&ansSec=param
    db.getRecomandation(userName, function (result) {
        res.send(result);
    })
});




module.exports = router;


