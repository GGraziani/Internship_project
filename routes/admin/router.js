/** @module users/router */
'use strict';

var express = require('express');
var router = express.Router();
var middleware =  require('../middleware');
var utils =  require('../../utils');
var xmlbuilder = require('xmlbuilder');
//var rootUrl = require("../../config").url;


//supported methods
router.all('/', middleware.supportedMethods('GET, OPTIONS'));

// get admin page
router.get('/', middleware.authorizeAdmin, function(req, res, next) {
    console.log("userdata admin mode");
    console.log(req.session.userdata);
    console.log("--------------userdata--------------");
    res.render('home', req.session.userdata);
});

//Does all the queries and operations necessary for billing a client
router.post('/billing', middleware.authorizeAdmin, function(req, res) {
    // TODO check authorizations
    utils.request('SELECT uid, price, included FROM users WHERE company = ?', [req.body.company], function(errQ1, rowsQ1, connectionQ1) {

        // Free connection back to the pool
        connectionQ1.release();

        if (errQ1) {
            console.error('Error selecting: ' + err.stack);
        } else {
            utils.request('SELECT ip FROM pdu WHERE uid = ?', [rowsQ1[0].uid],
                function (errQ2, rowsQ2, connectionQ2) {

                    // Free connection back to the pool
                    connectionQ2.release();

                    if (errQ2) {
                        console.error('Error selecting: ' + err.stack);
                    } else {

                        var dateStart = req.body.dateStart;
                        var dateEnd = req.body.dateEnd;
                        var paramsQ1 = [dateStart, dateEnd];
                        // pushing all the ips into the rilevazioni query
                        paramsQ1.push(rowsQ2[0].ip);
                        var ips = "ip = ?";
                        for (var i = 1; i < rowsQ2.length; i++) {
                            ips += " OR ip = ?";
                            paramsQ1.push(rowsQ2[i].ip)
                        }

                        utils.request('SELECT out1, ip FROM rilevazioni WHERE date BETWEEN ? AND ? AND (' + ips + ')', paramsQ1,
                            function (errQ3, rowsQ3, connectionQ3) {

                                connectionQ3.release();
                                //
                                //console.log('------------->billing = ', utils.billing(rowsQ3, rowsQ1[0].included, rowsQ1[0].price));
                                //
                                //res.json({billing: utils.billing(rowsQ3, rowsQ1[0].included, rowsQ1[0].price)[0]});


                                var billing = 0;
                                var bill = [];
                                var ip = "";

                                for (var j = 0; j < rowsQ2.length; j++) {


                                    ip = rowsQ2[j].ip;

                                    for (var x = 0; x < rowsQ3.length; x++) {

                                        if (ip == rowsQ3[x].ip && rowsQ3[x].out1 > rowsQ1[0].included) {

                                            bill.push(rowsQ3[x])

                                        }

                                    }

                                    var gg = parseInt(utils.billing(bill, rowsQ1[0].included, rowsQ1[0].price)[0]);
                                    billing += parseInt(utils.billing(bill, rowsQ1[0].included, rowsQ1[0].price)[0]);
                                    console.log('------------->billing = ', utils.billing(bill, rowsQ1[0].included, rowsQ1[0].price));
                                }

                                console.log(billing);
                                res.json({'billing': billing + ".00"});

                        });
                    }
                }
            )
        }
    });
});

// return a xml file with all billing from each company last month
router.post('/xml-billing', middleware.authorizeAdmin, function(req, res) {
    // TODO check authorizations
    var params = utils.getBillingDate();
    var xml = xmlbuilder.create('Fatturazione');
    utils.request('SELECT uid, company, included, price FROM users', [], function(errQ1, rowsQ1, connectionQ1){

        connectionQ1.release();
        if(errQ1) {
            console.error('Error selecting: ' + err.stack);
        } else {

            //console.log(rowsQ1);

            utils.request('SELECT uid, ip FROM pdu', [], function (errQ2, rowsQ2, connectionQ2) {

                connectionQ2.release();
                if(errQ2) {
                    console.error('Error selecting: ' + err.stack);
                } else {

                    //console.log(rowsQ2);

                    utils.request('SELECT ip, out1 FROM rilevazioni WHERE date BETWEEN ? AND ?', params,
                        function(errQ3, rowsQ3, connectionQ3) {

                            connectionQ3.release();
                            if (errQ3) {
                                console.error('Error selecting: ' + err.stack);
                            } else {
                                console.log('done');
                            }


                            for (var i = 0; i < rowsQ1.length; i++) {

                                var billing = 0;
                                var bill = [];
                                var ip = "";

                                for (var j = 0; j < rowsQ2.length; j++) {


                                    if (rowsQ1[i].uid == rowsQ2[j].uid) {
                                        ip = rowsQ2[j].ip;
                                        console.log(rowsQ1[i].uid + " " + rowsQ2[j].uid + " " + rowsQ2[j].ip);

                                        for (var x = 0; x < rowsQ3.length; x++) {

                                            if (ip == rowsQ3[x].ip && rowsQ3[x].out1 > rowsQ1[i].included) {

                                                bill.push(rowsQ3[x])

                                            }

                                        }

                                        var gg = parseInt(utils.billing(bill, rowsQ1[i].included, rowsQ1[i].price)[0]);
                                        billing += parseInt(utils.billing(bill, rowsQ1[i].included, rowsQ1[i].price)[0]);
                                        console.log('------------->billing = ', utils.billing(bill, rowsQ1[i].included, rowsQ1[i].price));
                                    }

                                }

                                xml.ele('Company', {'Name': rowsQ1[i].company}, 'Conto fatturazione : ' + billing + ".00 euro");

                            }
                            var xmlString = xml.end({pretty: true, indent: '  ', newline: '\n'});
                            console.log(xmlString);

                            res.json({'Fatturazione' : xmlString});

                        })

                }

            });
        }




        // 10 parallel query to avoid too much overhead
        //for(var i = 0; i < rowsQ1.length; i += 10) {
        //
        //    if((i + 10) > rowsQ1.length) {
        //
        //        for (var j = 0; j < rowsQ1.length - i; j++) {
        //            console.log(rowsQ1[i + j].company + ' ' + i + ' ' + j);
        //            utils.request('SELECT ip FROM pdu WHERE uid = ?', rowsQ1[i + j].uid, function (errQ2, rowsQ2, connectionQ2) {
        //                connectionQ2.release();
        //                var ips = "ip = ?";
        //                for (var x = 0; x < rowsQ2.length; x++) {
        //                    ips += " OR ip = ?";
        //                    params.push(rowsQ2[x].ip)
        //                }
        //                console.log(rowsQ1[i + j] + ' ' + i + ' ' + j);
        //                utils.request('SELECT out1 FROM rilevazioni WHERE (date > ? AND date < ?)  AND (' + ips + ')', params,
        //                    function (errQ3, rowsQ3, connectionQ3) {
        //                        var index = i + j;
        //                        console.log(i + j + ' ' + index);
        //
        //                        connectionQ3.release();
        //                        xml.ele(rowsQ1[index].company, {'type': 'Company'}, utils.billing(rowsQ3, rowsQ1[index].included, rowsQ1[index].price));
        //                        console.log(xml);
        //                    })
        //            });
        //
        //        }
        //
        //
        //    } else {
        //
        //        for (var j = 0; j < 10; j++) {
        //            console.log(rowsQ1[i + j]);
        //            utils.request('SELECT ip FROM pdu WHERE uid = ?', rowsQ1[i + j].uid, function (errQ2, rowsQ2, connectionQ2) {
        //                connectionQ2.release();
        //                var ips = "ip = ?";
        //                for (var x = 1; x < rowsQ2.length; x++) {
        //                    ips += " OR ip = ?";
        //                    params.push(rowsQ2[x].ip)
        //                }
        //                utils.request('SELECT out1 FROM rilevazioni WHERE (date > ? AND date < ?)  AND (' + ips + ')', params,
        //                    function (errQ3, rowsQ3, connectionQ3) {
        //                        connectionQ3.release();
        //                        xml.ele(rowsQ1[i + j].company, {'type': 'Company'}, utils.billing(rowsQ3, rowsQ1[i + j].included, rowsQ1[i + j].price));
        //                        console.log(xml);
        //                    })
        //            });
        //
        //        }
        //    }
        //}
    });
});

// router for /users
module.exports = router;