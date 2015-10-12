/** @module users/router */
'use strict';

var express = require('express');
var router = express.Router();
var middleware =  require('../middleware');
var mysql      = require('mysql');
var passport = require('passport');
require('../../passportConfig');


//supported methods
router.all('/', middleware.supportedMethods('GET, POST'));

router.get('/', function(req, res, next) {
  res.render('login');
});

//router.post('/', passport.authenticate('local-login', { successRedirect: '/', failureRedirect: '/login' }));

router.post('/', function(req,res){
    console.log(req.form)

    passport.authenticate('local-login',
        { failureRedirect: '/login' }, function(err, user) {
            req.logIn(user, function(err) {
                res.redirect('/home')
            });
        })(req, res);

    }
);
module.exports = router;