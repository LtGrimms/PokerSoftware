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
    var connection = mysql.createConnection({
        host: '192.168.0.4',
        port: 3306,// we will probably have to put the port in here too.. 3306?
        user: 'root', // I don't remember your user name
        password: 'BreakUrBones', // or something
        database: 'poker' // is that what we called it?
    });

    connection.connect(function(err, result) {
        if (err) {
            console.error("Could not connect to database: " + err);
        }
        console.log("Connected successfully");
    });
    // insert hand
    connection.query("INSERT INTO hand SET ?", hand.hand, function(err, result) {
        if (err) {
            console.error("Could not insert data: " + err);
        }
        console.log("inserted hand successfully");
    });
    // insert seats
    var i;
    var seat_inserted_callback = function(err, result) {
        if (err) {
            console.error("Could not insert seat " + i + ", " + err);
        }
        console.log("inserted seat " + i);
    };
    for (i = 0; i < hand.seats.length; i++) {
        connection.query("INSERT INTO seat SET ?", hand.seats[i], seat_inserted_callback);
    }
    // insert board
    connection.query("INSERT INTO board SET ?", hand.board, function(err, result) {
        
    });
    connection.end();
});
