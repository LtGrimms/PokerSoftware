var should = require('should');
var hand_file_parser = require('../lib/hand-file-parser');
var fs = require('fs');
var reLib = require('../lib/poker-regex-library');

describe('hand-file-parser-test', function() {
    describe.skip('parseHand', function() {
        it('should return the correct information', function() {
            var input_hand = fs.readFileSync(__dirname + "/testHands/test-hand1.txt", 'utf8');
            var expected_output = require('./testHands/expected-output-hand1.js');

            var hand = new hand_file_parser.hand();
            hand.data = input_hand;
            var output_hand = hand.parseHand();

            output_hand.should.eql(expected_output);
        });

        it('should return the correct information', function() {
            var input_hand = fs.readFileSync(__dirname + "/testHands/test-hand2.txt", 'utf8');
            var expected_output = require('./testHands/expected-output-hand2.js');

            var hand = new hand_file_parser.hand();
            hand.data = input_hand;
            var output_hand = hand.parseHand();

            output_hand.should.eql(expected_output);
        });
    });

    describe('addWinnings', function() {
        it('should add the winnings to the seat with the name of the winner and no others if sidepot is false', function() {
            var hand = new hand_file_parser.hand();
            hand.seats = [
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
            var expected_output = JSON.parse(JSON.stringify(hand.seats));
            expected_output[1].winnings = 20;

            hand.addWinnings(winner, winnings);

            hand.seats.should.eql(expected_output);
        });

        it('should add the winnings to the sidepot of the winner if sidepot is true', function() {
            var hand = new hand_file_parser.hand();
            hand.seats = [
                {
                    name: "person1",
                    sidepot: 0
                }, {
                    name: "person2",
                    sidepot: 0
                }, {
                    name: "person3",
                    sidepot: 0
                }
            ];
            var winner = "person2";
            var winnings = 20;
            var expected_output = JSON.parse(JSON.stringify(hand.seats));
            expected_output[1].sidepot = 20;

            hand.addWinnings(winner, winnings, true);

            hand.seats.should.eql(expected_output);
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

            var expectedOutput = {
                actionNumber: 1,
                handNumber: handNumber,
                name: name,
                round: round,
                type: type,
                amount: amount,
                currentBetSize: currentBetSize
            };

            var actualOutput = hand_file_parser.createAction(handNumber, name, round, type, amount, currentBetSize, 1);

            actualOutput.should.eql(expectedOutput);
        });

        it('should throw an error if hand number is not a positive integer', function() {
            var handNumber = -1;
            var name = "LtGrimms";
            var round = "flop";
            var type = "bet";
            var amount = 120;
            var currentBetSize = 50;

            (function() {
                hand_file_parser.createAction(handNumber, name, round, type, amount, currentBetSize, 1);
            }).should.throw("handNumber should be a positive integer");
        });

        it('should throw an error if name is not a string', function() {
            var handNumber = 1;
            var name = 768;
            var round = "flop";
            var type = "bet";
            var amount = 120;
            var currentBetSize = 50;

            (function() {
                hand_file_parser.createAction(handNumber, name, round, type, amount, currentBetSize, 1);
            }).should.throw("name must be a string");
        });

        it('should throw an error if amount is not a positive integer', function() {
            var handNumber = 1;
            var name = "LtGrimms";
            var round = "flop";
            var type = "bet";
            var amount = -120;
            var currentBetSize = 50;

            (function() {
                hand_file_parser.createAction(handNumber, name, round, type, amount, currentBetSize, 1);
            }).should.throw("tried to create action with non-integer bet/raise amount -120");
        });

        it('should throw an error if currentBetSize is not a positive integer', function() {
            var handNumber = 1;
            var name = "LtGrimms";
            var round = "flop";
            var type = "bet";
            var amount = 120;
            var currentBetSize = -50;

            (function() {
                hand_file_parser.createAction(handNumber, name, round, type, amount, currentBetSize, 1);
            }).should.throw("tried to create action with non-integer current bet amount");
        });
    });

    describe('parseHandTable', function() {
        it('should return the correct hand information', function() {
            var data = "PokerStars Hand #123456: Tournament #789101112, $10 + $1 USD Hold'em No Limit - Level IV (100/200) - 2015/05/05 01:01:01 ET\nLtGrimms: posts the ante";
            var expectedOutput = {
                number: "123456",
                ante: null,
                bigBlind: 200,
                numberOfPlayers: null,
                smallBlind: 100,
                timestamp: new Date("2015-05-04 23:01:01.000 -0600"),
                tournament: '789101112'
            };
            var hand = new hand_file_parser.hand();
            hand.data = data;

            hand.parseHandTable();

            hand.handInfo.should.eql(expectedOutput);
        });
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
