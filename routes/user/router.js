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

    utils.request('SELECT ip FROM pdu WHERE uid = ?', [req.session.userdata.uid],
        function(err, rows1, connection){
            if(err) {
                console.error('Error selecting: ' + err.stack);
            } else {
                console.log(rows1);

                var params = [utils.getDate()];
                params.push(rows1[0].ip);
                var ips = "ip = ?";
                for(var i = 1; i < rows1.length; i++){
                    ips += " or ip = ?"
                    params.push(rows1[i].ip)
                }
                console.log(ips);
                console.log(params);


                utils.request('SELECT out1 FROM rilevazioni WHERE date > ? and ('+ips+')', params,
                    function(err, rows, connection){

                        connection.release();
                        console.log("Successf connection.release()");

                        if(err) {
                            console.error('Error selecting: ' + err.stack);
                        } else {
                            var params1 = req.session.userdata;
                            params1.average = utils.getAverageOut1(rows);

                            console.log("--------------userdata--------------");
                            console.log(params1);
                            console.log("--------------userdata--------------");
                        }
                        res.render('home', params1);
                    });
            }
        }
    )
});








// get one user page
//router.get('/:userid', function(req, res, next) {
//
//  console.log('ciaooooo')
//  res.render('userPage');
//});
/** router for /users */
module.exports = router;