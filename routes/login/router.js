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

//router.post('/', passport.authenticate('local-login', { successRedirect: '/home', failureRedirect: '/login' }));

router.post('/', function(req,res,next){
    passport.authenticate('local-login',
        function(err, user, info) {
            console.log(info)
            if(err) {
                return next(err);
            }
            if (!user){
                return res.render('login', { message: info.message })
            }
            req.session.userdata = {
                uid : user.uid,
                username: user.username,
                email : user.email,
                company : user.company,
            };
            req.logIn(user, function(user,err) {

                if(err) return next(err);
                res.redirect('/home')
            });
        })(req, res, next);

    }
);
module.exports = router;