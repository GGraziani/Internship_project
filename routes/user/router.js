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
    res.render('home', req.session.userdata);

    //utils.request('SELECT ip FROM pdu WHERE uid = ?', [req.session.userdata.uid],
    //    function(errQ1, rowsQ1, connectionQ1){
    //
    //        connectionQ1.release();
    //        if(errQ1) {
    //            console.error('Error selecting: ' + err.stack);
    //        } else {
    //
    //            var paramsQ1 = [utils.getDate()];
    //            paramsQ1.push(rowsQ1[0].ip);
    //            var ips = "ip = ?";
    //            for( var i = 1; i < rowsQ1.length; i++ ){
    //                ips += " or ip = ?";
    //                paramsQ1.push(rowsQ1[i].ip)
    //            }
    //
    //            console.log(ips);
    //            console.log(paramsQ1);
    //
    //            utils.request('SELECT out1 FROM rilevazioni WHERE date > ? and (' + ips + ')', paramsQ1,
    //                function(errQ2, rowsQ2, connectionQ2){
    //
    //                    connectionQ2.release();
    //                    console.log("Successful connection.release()");
    //
    //                    if(errQ2) {
    //                        console.error('Error selecting: ' + err.stack);
    //                    } else {
    //                        req.session.userdata.averageMonth = utils.getAverage(rowsQ2, 'out1');
    //                        req.session.userdata.average12h = utils.getAverage(rowsQ2, 'out1', 72);
    //
    //                        console.log("--------------userdata--------------");
    //                        console.log(req.session.userdata);
    //                        console.log("--------------userdata--------------");
    //                    }
    //                    res.render('home', req.session.userdata);
    //                });
    //
    //
    //        }
    //    }
    //)
});

router.get('/dashboard', middleware.authorize,function(req, res, next) {
    utils.request('SELECT ip FROM pdu WHERE uid = ?', [req.session.userdata.uid],
        function(errQ1, rowsQ1, connectionQ1){

            connectionQ1.release();
            if(errQ1) {
                console.error('Error selecting: ' + err.stack);
            } else {

                var paramsQ1 = [utils.getDate()];
                paramsQ1.push(rowsQ1[0].ip);
                var ips = "ip = ?";
                for( var i = 1; i < rowsQ1.length; i++ ){
                    ips += " or ip = ?";
                    paramsQ1.push(rowsQ1[i].ip)
                }

                console.log(ips);
                console.log(paramsQ1);

                utils.request('SELECT  date, time, out1 FROM rilevazioni WHERE date > ? and (' + ips + ')', paramsQ1,
                    function(errQ2, rowsQ2, connectionQ2){

                        connectionQ2.release();
                        console.log("Successful connection.release()");

                        if(errQ2) {
                            console.error('Error selecting: ' + err.stack);
                        } else {
                            var data = {
                                averageMonth : utils.getAverage(rowsQ2, 'out1'),
                                average24h : utils.getAverage(rowsQ2, 'out1', 24)
                            }
                            res.json(data);
                        }

                    });


            }
        }
    )

});

/** router for /users */
module.exports = router;