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

router.get('/', function(req, res) {
  req.logout();
  console.log(req.session.passport);
  res.redirect(303,'/login');
});


module.exports = router;