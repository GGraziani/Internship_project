/** @module users/router */
'use strict';

var express = require('express');
var router = express.Router();
var middleware =  require('../middleware');
//var rootUrl = require("../../config").url;


//supported methods
router.all('/', middleware.supportedMethods('GET, OPTIONS'));

// get user page
router.get('/', middleware.authorize,function(req, res, next) {
    res.redirect('/home');
});
router.get('/home', middleware.authorize,function(req, res, next) {

    var userdata = req.session.userdata;
    console.log("userdata user mode")
    console.log(req.session.userdata)
    console.log("--------------userdata--------------")
    res.render('home', userdata);

    //res.render('home');
});


// get one user page
//router.get('/:userid', function(req, res, next) {
//
//  console.log('ciaooooo')
//  res.render('userPage');
//});
/** router for /users */
module.exports = router;