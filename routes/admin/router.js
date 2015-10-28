/** @module users/router */
'use strict';

var express = require('express');
var router = express.Router();
var middleware =  require('../middleware');
//var rootUrl = require("../../config").url;


//supported methods
router.all('/', middleware.supportedMethods('GET, OPTIONS'));

// get admin page
router.get('/', middleware.authorizeAdmin,function(req, res, next) {
    //console.log(req.session.passport);
    var userdata = req.session.userdata;
    console.log("userdata admin mode")
    console.log(req.session.userdata)
    console.log("--------------userdata--------------")
    res.render('home', userdata);
});



// get one user page
//router.get('/:userid', function(req, res, next) {
//
//  console.log('ciaooooo')
//  res.render('userPage');
//});
/** router for /users */
module.exports = router;