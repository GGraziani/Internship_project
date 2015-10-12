var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var dustjs = require('adaro');
var session = require('express-session');
var passport = require('passport');
var app = express();


//configure passports
require('./passportConfig');

// dustjs view engine setup
app.engine('dust', dustjs.dust());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'dust');

//configure app
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));    // parse application/x-www-form-urlencoded
app.use(bodyParser.json());    // parse application/json
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//passport
app.use(passport.initialize());
app.use(passport.session());


var routers = require('./routes/routers');
app.use('/', routers.user);
app.use('/home', routers.user)
app.use('/login', routers.login);
app.use("/logout",routers.logout);

module.exports = app;