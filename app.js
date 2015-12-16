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


// login pages
app.use('/admin/login', routers.adminLogin);
app.use('/login', routers.login);

// logout
app.use("/logout",routers.logout);

// users routes
app.use('/', routers.user);
app.use('/home', routers.user);
app.use('/dashboard', routers.user);
app.use('/getData', routers.getData);


// admin routes
app.use('/admin', routers.admin);



//var index = require("./routes/user/router.js");
//var home = require("./routes/user/router.js");
//
//var login = require("./routes/login/router.js");
//var logout = require("./routes/logout/router.js");
//
//var adminLogin = require("./routes/adminLogin/router.js");
//var admin = require("./routes/admin/router.js");
//
//app.use('/', index);
//app.use('/home', home);
//app.use('/login', login);
//app.use("/logout",logout);
//
//
//app.use('/admin/login', adminLogin);
//app.use('/admin', admin);

module.exports = app;