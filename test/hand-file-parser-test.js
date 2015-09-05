var should = require('should');
var hand_file_parser = require('../lib/hand-file-parser');

describe('hand-file-parser-test', function() {
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
