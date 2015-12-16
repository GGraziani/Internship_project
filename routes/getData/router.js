/** @module users/router */
'use strict';

var express = require('express');
var router = express.Router();
var middleware =  require('../middleware');
var utils =  require('../../utils');

//var rootUrl = require("../../config").url;


//supported methods
router.all('/', middleware.supportedMethods('GET, OPTIONS'));

router.get('/:ip', middleware.authorize,function(req, res, next) {
    var params = [utils.getDate(), req.params.ip]

    utils.request('SELECT  date, time, out1 FROM rilevazioni WHERE date > ? and ip = ?', params,
        function(err, rows, connection){
            connection.release();
            if(err) {
                res.json({
                    error : "Database request error!"
                });
            } else {
                var plotData = utils.plotData(rows, 'out1', 24);
                var data = {
                    total24h : plotData[1],
                    instantCons : utils.getInstantConsumption(rows, false),
                };
                res.json(data);
            }
        }
    );
});

/** router for /users */
module.exports = router;