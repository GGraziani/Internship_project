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


// Build the right DB query format
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

//module.exports.getAverage = function(rows, field, interval) {
//
//    var temp = 0;
//
//
//    if(!interval) { // Do month average and return one value.
//
//        for( var i = 0; i < rows.length; i++ ) {
//            temp += rows[i][field];
//        }
//        // Return average with 2 sig
//        return (temp/rows.length).toFixed(2);
//
//
//    } else { // Do average for every 'interval' values, return array.
//
//        var average = [];
//
//        for( var i = 0 ; i < rows.length; i++ ) {
//            temp += rows[i][field];
//            console.log(rows[i]);
//            if( (i + 1)%interval == 0) {
//
//                temp = temp/interval;
//                average.push( [new Date(getDate(rows[i].date)),temp.toFixed(2)] );
//
//            }
//        }
//
//        // If array.length() isn't divisible by interval divide the last member properly.
//
//        if( (i + 1)%interval != 0) {
//
//            console.log("--" ,rows.length, interval, rows.length % interval);
//            temp = temp / (rows.length % interval);
//            average.push( [new Date(getDate(rows[i-1].date)),temp.toFixed(2)] );
//        }
//
//        return average;
//    }
//
//};

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
                startTime.setHours(interval/2)
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

function getDate(date,time){
    date = date.toString();
    //console.log("time")
    //console.log(time)
    time = time.toString();

    return new Date(parseInt(date.substring(0, 4)),parseInt(date.substring(4, 6)),parseInt(date.substring(6, 8)),parseInt(time.substring(0, 2)),parseInt(time.substring(2, 4)));
}