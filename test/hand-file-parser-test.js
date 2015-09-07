var should = require('should');
var hand_file_parser = require('../lib/hand-file-parser');
var fs = require('fs');

describe('hand-file-parser-test', function() {
    describe('parse_hand', function() {
        it('should return the correct information', function() {
            var input_hand = fs.readFileSync(__dirname + "/testHands/test-hand1.txt", 'utf8');
            var expected_output = require('./testHands/expected-output-hand1.js');

            var output_hand = hand_file_parser.parse_hand(input_hand);

            output_hand.should.eql(expected_output);
        });

        it('should return the correct information', function() {
            var input_hand = fs.readFileSync(__dirname + "/testHands/test-hand2.txt", 'utf8');
            var expected_output = require('./testHands/expected-output-hand2.js');

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

    describe('isPosInt', function() {
        it('should return true for positive integer values', function() {
            var input = 1;
            var expectedOutput = true;
            var actualOutput = hand_file_parser.isPosInt(input);

            actualOutput.should.eql(expectedOutput);
        });

        it('should return false for non-integer values, particularly strings', function() {
            var input = "1";
            var expectedOutput = false;
            var actualOutput = hand_file_parser.isPosInt(input);

            actualOutput.should.eql(expectedOutput);
        });

        it('should return false for negative-integer values', function() {
            var input = -1;
            var expectedOutput = false;
            var actualOutput = hand_file_parser.isPosInt(input);

            actualOutput.should.eql(expectedOutput);
        });
    });

    describe('createAction', function() {
        it('should create an action object with the correct parameters', function() {
            var handNumber = 1;
            var name = "LtGrimms";
            var round = "flop";
            var type = "bet";
            var amount = 120;
            var currentBetSize = 50;

            var expectedOutput = {handNumber: handNumber, name: name, round: round, type: type, amount: amount, currentBetSize: currentBetSize};

            var actualOutput = hand_file_parser.createAction(handNumber, name, round, type, amount, currentBetSize);

            expectedOutput.should.eql(actualOutput);
        });

        it('should throw an error if hand number is not a positive integer', function() {
            var handNumber = -1;
            var name = "LtGrimms";
            var round = "flop";
            var type = "bet";
            var amount = 120;
            var currentBetSize = 50;

            //how do i make it expect an error?
        });

        it('should throw an error if name is not a string', function() {
            var handNumber = 1;
            var name = 768;
            var round = "flop";
            var type = "bet";
            var amount = 120;
            var currentBetSize = 50;

            //expect error?
        });

        it('should throw an error if round is not a valid round', function() {
            var handNumber = 1;
            var name = "LtGrimms";
            var round = "watermellon";
            var type = "bet";
            var amount = 120;
            var currentBetSize = 50;
            //error?
        });

        it('should throw an error if type is a not a valid type', function() {
            var handNumber = 1;
            var name = "LtGrimms";
            var round = "flop";
            var type = "raise the roof";
            var amount = 120;
            var currentBetSize = 50;
            //error?
        });

        it('should throw an error if amount is not a positive integer', function() {
            var handNumber = 1;
            var name = "LtGrimms";
            var round = "flop";
            var type = "bet";
            var amount = -120;
            var currentBetSize = 50;
            //error
        });

        it('should throw an error if currentBetSize is not a positive integer', function() {
            var handNumber = 1;
            var name = "LtGrimms";
            var round = "flop";
            var type = "bet";
            var amount = 120;
            var currentBetSize = -50;
            //error
        });
    });

    describe('parseHandTable', function() {

    });

    describe('parseBoardTable', function() {

    });

    describe('parsePlayersHoleCards', function() {

    });

    describe('parsePlayersInformation', function() {

    });

    describe('parseActions', function() {

    });

    
});
