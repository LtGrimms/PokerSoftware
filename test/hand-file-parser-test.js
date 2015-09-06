var should = require('should');
var hand_file_parser = require('../lib/hand-file-parser');
var fs = require('fs');

describe('hand-file-parser-test', function() {
    describe('parse_hand', function() {
        it('should return the correct information', function() {
            var input_hand = fs.readFileSync(__dirname + "/test-hand.txt", 'utf8');
            var expected_output = require('./expected-output-hand.js');

            var output_hand = hand_file_parser.parse_hand(input_hand);

            output_hand.should.eql(expected_output);
        });
    });

    describe('addWinnings', function() {
        it('should add the winnings to the seat with the name of the winner and no others if sidepot is false', function() {
            var seats = [
                {
                    name: "person1"
                }, {
                    name: "person2"
                }, {
                    name: "person3"
                }
            ];
            var winner = "person2";
            var winnings = 20;
            var expected_output = JSON.parse(JSON.stringify(seats));
            expected_output[1].winnings = 20;

            hand_file_parser.addWinnings(seats, winner, winnings);

            seats.should.eql(expected_output);
        });

        it('should add the winnings to the sidepot of the winner if sidepot is true', function() {
            var seats = [
                {
                    name: "person1",
                    sidepots: 0
                }, {
                    name: "person2",
                    sidepots: 0
                }, {
                    name: "person3",
                    sidepots: 0
                }
            ];
            var winner = "person2";
            var winnings = 20;
            var expected_output = JSON.parse(JSON.stringify(seats));
            expected_output[1].sidepots = 20;

            hand_file_parser.addWinnings(seats, winner, winnings, true);

            seats.should.eql(expected_output);
        });
    });
});