/** @module users/router */
'use strict';

var express = require('express');
var router = express.Router();
var middleware =  require('../middleware');
//var rootUrl = require("../../config").url;


//supported methods
router.all('/', middleware.supportedMethods('GET, OPTIONS'));

// get admin page
router.get('/', middleware.authorize,function(req, res, next) {
    res.render('adminPage');
});


// get one user page
//router.get('/:userid', function(req, res, next) {
//
//  console.log('ciaooooo')
//  res.render('userPage');
//});
/** router for /users */
module.exports = router;