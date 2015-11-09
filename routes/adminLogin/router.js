/** @module users/router */
'use strict';

var express = require('express');
var router = express.Router();
var middleware =  require('../middleware');

var passport = require('passport');
require('../../passportConfig');


//supported methods
router.all('/', middleware.supportedMethods('GET, POST'));

router.get('/', function(req, res, next) {
    res.render('login', { router : "/admin/login"});
});

//router.post('/', passport.authenticate('local-login', { successRedirect: '/admin', failureRedirect: '/admin/login' }));


router.post('/', function(req,res,next){
        passport.authenticate('admin-local-login',
            function(err, user, info) {
                if(err) {
                    return next(err);
                }
                if (!user){
                    return res.render('login',
                        {
                            message: info.message,
                            router : "/admin/login"
                        })
                }
                req.session.userdata = {
                    uid : user.uid,
                    username: user.username,
                    email : user.email,
                    permissions : user.permissions
                };

                req.logIn(user, function(err) {
                    if(err) return next(err);
                    res.redirect('/admin')
                });
            })(req, res, next);

    }
);
module.exports = router;