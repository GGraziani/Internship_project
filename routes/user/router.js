/** @module users/router */
'use strict';

var express = require('express');
var router = express.Router();
var middleware =  require('../middleware');
var utils =  require('../../utils');

//var rootUrl = require("../../config").url;


//supported methods
router.all('/', middleware.supportedMethods('GET, OPTIONS'));

// get user page
router.get('/', middleware.authorize,function(req, res, next) {
    res.redirect('/home');
});
router.get('/home', middleware.authorize,function(req, res, next) {


    console.log("userdata user mode");
    console.log(req.session.userdata);
    console.log("--------------userdata--------------");
    var current_date = new Date();
    var current_year = 1900 + current_date.getYear();
    var current_month = 0 + '' + 9;

    var db_date = current_year + '' + current_month + '' + 0 + '' + 0;

    utils.request('SELECT out1 FROM rilevazioni WHERE date > ? and hostname = ?', [db_date, req.session.userdata.company],
        function(err, rows, connection){

            if(err) {
                console.error('Error selecting: ' + err.stack);
            } else {
                connection.release();
                console.log("Successf connection.release();ul query");


                var average = 0;
                for(var i = 0; i < rows.length; i++) {
                    average += rows[i].out1;
                }
            average = (average/rows.length).toFixed(2);
            req.session.userdata.average = average;
        }
        res.render('home', req.session.userdata);
    });

});






// get one user page
//router.get('/:userid', function(req, res, next) {
//
//  console.log('ciaooooo')
//  res.render('userPage');
//});
/** router for /users */
module.exports = router;