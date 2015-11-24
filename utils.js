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

    return current_year + '' + current_month + '' + 0 + '' + 0;
};



module.exports.getAverage = function(rows, field, interval) {
    var temp = 0;


    if(!interval) { // Do month average and return one value.

        for( var i = 0; i < rows.length; i++ ) {
            temp += rows[i][field];
        }
        // Return average with 2 sig
        return (temp/rows.length)


    } else { // Does average for every 'interval' values, return array.

        var average = [];
        var counter = 0;
        var startTime = getDate(rows[0].date,rows[0].time);
        var actualTime;

        for( var i = 0 ; i < rows.length; i++ ) {

            actualTime = getDate(rows[i].date, rows[i].time);
            if((Math.abs(startTime.getTime()-actualTime.getTime())/(1000*3600)) < interval){
                temp += rows[i][field];
                counter +=1;
                if(i+1 >= rows.length){
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
                startTime = getDate(rows[i].date,rows[i].time);
                temp = rows[i][field];
                counter = 1;
            }
        }
        return average;
    }
};

module.exports.plotData = function(rows, field, interval) {
    var temp = 0;
    var i_avg = [];
    var i_sum = [];


    var counter = 0;
    var counter2 = 0;
    var startTime = getDate(rows[0].date,rows[0].time);
    var actualTime;

    for( var i = 0; i < rows.length; i++){

        actualTime = getDate(rows[i].date, rows[i].time);
        if((Math.abs(startTime.getTime()-actualTime.getTime())/(1000*3600)) < interval){
            temp += rows[i][field];
            counter +=1;

            if(i > 0 && rows[i].time != rows[i-1].time){
                counter2+=1
            }

            if(i+1 >= rows.length){

                var date = getDate(rows[i].date, (interval/2)+"00").getTime();


                i_avg.push([
                    date,
                    temp/counter
                ]);

                i_sum.push([
                    date,
                    temp/counter2
                ]);

            }
        } else{
            startTime.setHours(interval/2);

            i_avg.push([
                startTime.getTime(),
                temp/counter
            ]);

            i_sum.push([
                startTime.getTime(),
                temp/counter2
            ]);

            startTime = getDate(rows[i].date,rows[i].time);
            temp = rows[i][field];
            counter = 1;
            counter2 = 1
        }
    }
    return [i_avg, i_sum];
};

module.exports.getInstantConsumption = function(rows, sum) {

    if(!sum){
        return rows[rows.length-1].out1;
    } else{
        var interval = rows[rows.length-1].time;
        var temp = 0;
        var i = rows.length-1;
        while(rows[i].time == interval){
            temp+= rows[i].out1;
            i--;
        }
        var diff = rows.length - (i+1);
        return [temp, diff];
    }

}


function getDate(date,time){
    date = date.toString();
    time = time.toString();

    return new Date(parseInt(date.substring(0, 4)),parseInt(date.substring(4, 6)),parseInt(date.substring(6, 8)),parseInt(time.substring(0, 2)),parseInt(time.substring(2, 4)));
}