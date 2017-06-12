var express = require('express');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');

// server definition
var app = express();
var port = 5001;


// routes dBconfig - API
let index = require('./routes/index');
let users = require('./routes/users');
let games = require('./routes/games');
let cart = require('./routes/cart');
let orders = require('./routes/orders');

// TODO clean
// // view engine setup
 app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());


app.use('/', index);
app.use('/users', users);
app.use('/games', games);
app.use('/cart', cart);
app.use('/orders', orders);

// App_start() - server listening
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});

// error handling

// Data base connection fail
let connected = require('./DAL/DataAccess').connected;
app.use(function (req, res, next) {
    if (connected)
        next();
    else
        res.status(503).send('connection to data base fail');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
