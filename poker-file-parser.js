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
            connection.end();
            return;
        }
        connection.query("", hand, function(err, result) {
            if (err) {
                console.error("Could not insert data: " + err);
                connection.end();
                return;
            }
            connection.end();
        });
    });
});
