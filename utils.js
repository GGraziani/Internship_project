var mysql = require('mysql');

// establishing connection with database.

var pool = mysql.createPool( {

    connectionLimit : 100,
    host            : 'localhost',
    user            : 'moresi',
    password        : 'moresi',
    database        : 'test_moresi'

});

pool.on('enqueue', function () {
    console.log('Waiting for available connection slot');
});

// connected to DB as user moresi.


// function for sending query through the pool
module.exports.request = function(query, params, callback) {
    pool.getConnection(function (err, connection) {

        if (!err) {

            console.log('Connected as id ' + connection.threadId);

            console.log(query, params);

            connection.query( query, params, function(err, rows) {
                callback(err, rows, connection);
            });
        }
    });
};


// Build the right DB query format
module.exports.getDate = function(){

    var current_date = new Date();
    // taking one less year because of the outdated db
    var current_year = 1900 + current_date.getYear() - 1;
    var current_month = '';
    if (current_date.getMonth() < 9) {
        current_month = 0 + '' + (current_date.getMonth() + 1);
    } else {
        current_month = current_date.getMonth() + 1;
    }

    return current_year + '' + current_month + '' + 0 + '' + 0;
};

module.exports.getBillingDate = function() {
    //var current_date = new Date();
    //// taking one less year because of the outdated db
    //var current_year = 1900 + current_date.getYear() - 1;
    //var current_month = '';
    //if (current_date.getMonth() == 0) { // January -> bill December
    //    current_month = 12;
    //    current_year -= 1;
    //} else {
    //    current_month = current_date.getMonth()
    //}
    //var startBilling = current_year + '' + current_month + '' + 0 + '' + 0;
    //var endBilling = current_year + '' + (current_month + 1) + '' + 0 + '' + 0;
    //return [startBilling, endBilling];

    return ["20150500", "20150600"]
};

module.exports.getAverage = function(rows, field, interval) {
    var temp = 0;


    if(!interval) { // Do month average and return one value.

        for( var i = 0; i < rows.length; i++ ) {
            temp += rows[i][field];
        }
        // Return average with 2 sig
        return (temp/rows.length).toFixed(2);


    } else { // Does average for every 'interval' values, return array.

        var average = [];
        var counter = 0;
        var startTime = getDate(rows[0].date,rows[0].time);
        console.log("-----------------START-----------------"+startTime);
        var actualTime;

        for( var i = 0 ; i < rows.length; i++ ) {

            actualTime = getDate(rows[i].date, rows[i].time);
            if((Math.abs(startTime.getTime()-actualTime.getTime())/(1000*3600)) < interval){
                temp += rows[i][field];
                counter +=1;
                if(i+1 >= rows.length){
                    console.log("endARRAY");
                    average.push([
                        getDate(rows[i].date, (interval/2)+"00").getTime(),
                        temp/counter
                    ]);
                }
            } else{
                startTime.setHours(interval/2);
                average.push([
                    startTime.getTime(),
                    temp/counter
                ]);
                if(i+1 < rows.length){
                    startTime = getDate(rows[i].date,rows[i].time);
                    temp = rows[i][field];
                    counter = 1;
                }

            }
        }
        return average;
    }

};

//internal getDate
function getDate(date,time){

    date = date.toString();
    time = time.toString();

    return new Date(parseInt(date.substring(0, 4)), parseInt(date.substring(4, 6)),
        parseInt(date.substring(6, 8)), parseInt(time.substring(0, 2)), parseInt(time.substring(2, 4)));
}


// functions that given the rilevations passed how much it has consumed over his limit
module.exports.notPayed = function(rilevations, paid) {
    var overConsumed = 0;
    for(var i = 0; i < rilevations.length; i++) {
        if(rilevations[i].out1 > paid) {
            overConsumed += (rilevations[i].out1 - paid);
        }
    }
    return overConsumed.toFixed(2);
};

// gives out the billing
module.exports.billing = function(rilevations, paid, price) {
    var bill = 0;
    var more = 0;
    for(var i = 0; i < rilevations.length; i++) {
        if(rilevations[i].out1 > paid) {
            more += rilevations[i].out1 - paid;
            bill += (rilevations[i].out1 - paid)*price;
        }
    }
    return [bill.toFixed(2), more.toFixed(2)];
};