var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mysql      = require('mysql');

//configure passport
passport.use('local-login', new LocalStrategy(
    function (username, password, done) {

        getUserByUsername(username, function(err, rows, fields) {
            console.log(username, password);
            if (err) return done(err);

            else if(!rows[0]) return done(null, false);
            var user = rows[0];

            isValidPassword(password, user.password, function(err,isMatch){
                console.log('insideIsValid:  '+ user.username);
                if (err) return done(err);
                if (!isMatch) return done(null, false);
                else return done(null, user);
            });
        })
    }
));

var isValidPassword = function(password, password1,confirmationFunction){
    if(password === password1) {
        console.log('VALID');
        confirmationFunction(null,true);
    } else{
        console.log('INVALID');
        confirmationFunction(null,false);
    }

    //bcrypt.compare(password, this.password, function(err, isMatch) {
    //    if (err) {
    //        return confirmationFunction(err)
    //    };
    //    confirmationFunction(null, isMatch);
    //});
};


passport.serializeUser(function (user , done) {
    done(null, user.costumer_id);
});

passport.deserializeUser(function (id, done) {

    getUserByID(id, function (err, user) {
        done(err, user[0]);
    });
});

var getUserByUsername = function(username, callback){
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '123',
        database : 'testdb'
    });

    connection.connect(function(err){
        if(err){
            console.log("connection error: "+err)
        } else{
            console.log("connection established!");
        }
    });

    connection.query('SELECT * FROM users WHERE username = ?', username, callback);

    connection.end();
};

var getUserByID = function(ID, callback){
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '123',
        database : 'testdb'
    });

    connection.connect(function(err){
        if(err){
            console.log("connection error: "+err)
        } else{
            console.log("connection established!");
        }
    });

    connection.query('SELECT * FROM users WHERE costumer_id = ?', ID, callback);
    connection.end();
};