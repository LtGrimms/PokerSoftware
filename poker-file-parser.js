var fs = require('fs');
var hand_parser = require('./lib/hand-file-parser');
var mysql = require('mysql');

var filename = __dirname + "/" + process.argv[2];

fs.readFile(filename, 'utf8', function(err, data) {
    if (err) {
        console.error(err);
    }
    var hand = hand_parser(data);

    // Now that we have the data, make a database connection and insert it
    // (Just getting this working for one hand for now - will have to put it in a loop later)
    // var connection = mysql.createConnection({
    //     host: 'localhost', // we will probably have to put the port in here too.. 3306?
    //     user: '', // I don't remember your user name
    //     password: 'bone crusher', // or something
    //     database: 'poker' // is that what we called it?
    // });

    // connection.connect();

    // // do some inserting and stuff
    // connection.query(hand, function(err, rows, fields) {
    //     console.error(err);
    //     console.log(rows);
    //     console.log(fields);
    //     connection.end();
    // });
});
