var mysql = require('mysql');

// establishing connection with database.

var pool = mysql.createPool( {

    connectionLimit : 100,
    host            : 'localhost',
    user            : 'moresi',
    password        : 'moresi',
    database        : 'test_moresi'

});

// connected to DB as user moresi.


// function for sending query through the pool
module.exports.request = function(query, params, callback) {
    pool.getConnection(function (err, connection) {

        if (!err) {

            pool.on('enqueue', function () {
                console.log('Waiting for available connection slot');
            });

            console.log('Connected as id ' + connection.threadId);

            console.log(query, params);

            connection.query( query, params, function(err, rows) {
                callback(err, rows, connection);
            });
        }
    });
};

module.exports.getDate = function(){

    var current_date = new Date();
    var current_year = 1900 + current_date.getYear();
    var current_month = 0 + '' + 9;

    return current_year + '' + current_month + '' + 0 + '' + 0;;
};

//module.exports.getAverageOut1 = function(rows){
//
//    var average = 0;
//    for(var i = 0; i < rows.length; i++) {
//        average += rows[i]['out1'];
//    }
//    return (average/rows.length).toFixed(2);
//};

module.exports.getAverage = function(rows, field, interval) {

    var temp = 0;


    if(!interval) { // Do month average and return one value.

        for( var i = 0; i < rows.length; i++ ) {
            temp += rows[i][field];
        }
        // Return average with 2 sig
        return (temp/rows.length).toFixed(2);


    } else { // Do average for every 'interval' values, return array.

        var average = [];

        for( var i = 0 ; i < rows.length; i++ ) {
            temp += rows[i][field];

            if( (i + 1)%interval == 0) {
                temp = temp/interval;
                average.push( temp.toFixed(2) );
            }
        }

        // If array.length() isn't divisible by interval divide the last member properly.

        if( (i + 1)%interval != 0) {

            console.log("--" ,rows.length, interval, rows.length % interval);
            temp = temp / (rows.length % interval);
            average.push( temp.toFixed(2) );
        }

        return average;
    }

};