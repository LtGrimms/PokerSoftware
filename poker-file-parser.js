var fs = require('fs');
var hand_parser = require('./lib/hand-file-parser');
var mysql = require('mysql');

var filename = __dirname + "/" + process.argv[2];

fs.readFile(filename, 'utf8', function(err, data) {
    if (err) {
        console.error(err);
    }

    // Now that we have the data, make a database connection and insert it
    var connection = mysql.createConnection({
        host: '192.168.0.4',
        port: 3306,
        user: 'root',
        password: 'BreakUrBones',
        database: 'poker'
    });


    function insert_object(table, object) {
        connection.query("INSERT INTO " + table + " SET ?", object, function(err, result) {
            if (err) {
                console.error("Could not insert data into " + table + ": ", err);
            } else {
                console.log("Inserted data into " + table + " successfully");
            }
        });
    }

    connection.connect(function(err, result) {
        if (err) {
            console.error("Could not connect to database: " + err);
        }
        console.log("Connected successfully");
    });

    var hands = data.split("\n\n\n\n");
    for (var j = 0; j < hands.length; j++) {
        var i;
        if (!hands[j]) continue;
        var hand = new hand_parser.hand(hands[j]);
        hand.data = hands[j];
        hand = hand.parseHand();
        //console.log(JSON.stringify(hand, null, "\t"));
        console.log("parsed hand: " + hand.hand.number);
        insert_object("hand", hand.hand);
        for (i = 0; i < hand.seats.length; i++) {
            insert_object("seat", hand.seats[i]);
        }
        insert_object("board", hand.board);
        for (i = 0; i < hand.holeCards.length; i++) {
            insert_object("holeCards", hand.holeCards[i]);
        }
        for (i = 0; i < hand.actions.length; i++) {
            insert_object("action", hand.actions[i]);
        }
    }
    connection.end();
});
