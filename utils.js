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

    var average = [ 0 ];
    var counter = 0;


    if(!interval) { // Do month average and return one value

        for( var i = 0; i < rows.length; i++ ) {
            average[0] += rows[i][field];
        }

        // Return average with 2 sig
        return (average[0]/rows.length).toFixed(2);


    } else { // Do average for every 'interval' values, return array

        for( var i = 0 ; i < rows.length; i++ ) {
            if( (i + 1)%interval == 0) {
                counter += 1;
                average.push(0);
            }

            average[counter] += rows[i][field];

        }

        // pass the array and average all values
        for( var j = 0 ; j < average.length - 1; j++ ) {
            average[j] = (average[j]/interval).toFixed(2);
        }
        if( (i + 1)%interval != 0) {
            average[average.length - 1] = (average[average.length - 1] / (rows.length % interval)).toFixed(2);
        }

        return average;
    }

};