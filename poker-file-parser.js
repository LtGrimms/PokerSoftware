var fs = require('fs');
var hand_parser = require('./lib/hand-file-parser');

var filename = __dirname + "/" + process.argv[2];

fs.readFile(filename, 'utf8', function(err, data) {
    if (err) {
        console.error(err);
    }
    hand_parser(data);
});
