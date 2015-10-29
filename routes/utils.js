var mysql = require('mysql');

// establishing connection with database.

var pool = mysql.createPool( {
    host     : 'localhost',
    user     : 'moresi',
    password : 'moresi',
    database : 'test_moresi'
});

// connected to DB as user moresi.

module.exports.request = function(query, params, callback) {
    pool.getConnection(function (err, connection) {

        if (!err) {

            pool.on('enqueue', function () {
                console.log('Waiting for available connection slot');
            });

            console.log('Connected as id ' + connection.threadId);

            connection.query(query, params, callback);
            connection.release();

        }
    });
}