var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require("bcrypt");
var utils =  require('./utils');

var user_strategy = new LocalStrategy(

    function (username, password, done) {
        console.log("username: "+username);
        console.log("password: "+password);

        getUserByUsername( username, 'users', function ( err, rows ) {
            if (err) return done(err);
            else if(!rows[0]) return done(null, false, { message: 'Access denied: Invalid username or password' });
            var user = rows[0];

            isValidPassword(password, user.password, function(err,isMatch){
                if (err) return done(err);
                if (!isMatch) return done(null, false);
                else return done(null, user);
            });
        })
    }
);

var admin_strategy = new LocalStrategy(
    function (username, password, done) {
        console.log("username: "+username);
        console.log("password: "+password);

        getUserByUsername( username, "admins", function( err, rows ) {
            if (err) return done(err);
            else if(!rows[0]) return done(null, false, { message: 'Access denied: Invalid username or password' });
            var user = rows[0];

            isValidPassword(password, user.password, function(err,isMatch){
                if (err) return done(err);
                if (!isMatch) return done(null, false);
                else return done(null, user);
            });
        })
    }
);

//configure passport
passport.use('local-login', user_strategy);
passport.use('admin-local-login', admin_strategy);

var isValidPassword = function(password, password1,confirmationFunction){

    bcrypt.compare(password, password1, function(err, isMatch) {
        if (err) {
            return confirmationFunction(err)
        }
        confirmationFunction(null, isMatch);
    });
};


passport.serializeUser(function (user , done) {
    console.log("serialize");
    console.log(user);

    done(null, user.uid);
});

passport.deserializeUser(function (id, done) {

    getUserByID(id, "users", function (err, user) {
        console.log(user[0]);
        if(!user[0]){
            getUserByID(id, "admins", function (err, user) {
                console.log("deserialize");
                console.log(user);
                done(err, user[0]);
            });
        } else{
            console.log("deserialize");
            console.log(user);
            done(err, user[0]);
        }
    });
});

var getUserByUsername = function(username, table, callback){


    // Commented old way for restoring, now does query with pool with connection from utils,js

    utils.request( 'SELECT * FROM ' + table + ' WHERE username = ?', [username], function(err, rows, connection) {
        connection.release();
        callback(err, rows)
    });


    //var connection = mysql.createConnection({
    //    host     : 'localhost',
    //    user     : 'moresi',
    //    password : 'moresi',
    //    database : 'test_moresi'
    //});
    //
    //connection.connect(function(err){
    //    if(err){
    //        console.log("connection error: "+err)
    //    } else{
    //        console.log("connection established!");
    //    }
    //});

    //connection.query('SELECT * FROM '+table+' WHERE username = ?', username, callback);
    //
    //connection.end();
};

var getUserByID = function(ID, table, callback){


    // Commented old way for restoring, now does query with pool with connection from utils,js

    utils.request( 'SELECT * FROM ' + table + ' WHERE uid = ?', [ID], function(err, rows, connection) {
        connection.release();
        callback(err, rows)
    });
};