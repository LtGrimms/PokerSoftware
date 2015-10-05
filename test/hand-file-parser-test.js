var errorLib = require('../lib/poker-error-library');
var fs = require('fs');
var hand_file_parser = require('../lib/hand-file-parser');
var reLib = require('../lib/poker-regex-library');
var should = require('should');

var generate_output = true;

var assert_or_save_output = function(data, filename) {
    if (generate_output) {
        fs.writeFileSync(__dirname + filename, "module.exports = " + JSON.stringify(data, null, "\t")); // \t pretty prints
    } else {
        var expected_output = require('.' + filename);
        JSON.parse(JSON.stringify(data)).should.eql(expected_output);
    }
};

describe('hand-file-parser-test', function() {
    describe('parseHand', function() {
        it('should return the correct information', function() {
            var input_hand = fs.readFileSync(__dirname + "/testHands/test-hand1.txt", 'utf8');
            var hand = new hand_file_parser.hand();
            hand.data = input_hand;
            var output_hand = hand.parseHand();

            assert_or_save_output(output_hand, '/testHands/expected-output-hand1.js');
        });

        it('should return the correct information', function() {
            var input_hand = fs.readFileSync(__dirname + "/testHands/test-hand2.txt", 'utf8');
            var hand = new hand_file_parser.hand();
            hand.data = input_hand;
            var output_hand = hand.parseHand();

            assert_or_save_output(output_hand, '/testHands/expected-output-hand2.js');
        });

        it('should return the correct information', function() {
            var input_hand = fs.readFileSync(__dirname + "/testHands/test-hand3.txt", 'utf8');
            var hand = new hand_file_parser.hand();
            hand.data = input_hand;
            var output_hand = hand.parseHand();

            assert_or_save_output(output_hand, '/testHands/expected-output-hand3.js');
        });

        it('should return the correct information', function() {
            var input_hand = fs.readFileSync(__dirname + "/testHands/test-hand4.txt", 'utf8');
            var hand = new hand_file_parser.hand();
            hand.data = input_hand;
            var output_hand = hand.parseHand();

            assert_or_save_output(output_hand, '/testHands/expected-output-hand4.js');
        });

        it('should return the correct information', function() {
            var input_hand = fs.readFileSync(__dirname + "/testHands/test-hand5.txt", 'utf8');
            var hand = new hand_file_parser.hand();
            hand.data = input_hand;
            var output_hand = hand.parseHand();

            assert_or_save_output(output_hand, '/testHands/expected-output-hand5.js');
        });
        
        it('should return the correct information', function() {
            var input_hand = fs.readFileSync(__dirname + "/testHands/test-hand6.txt", 'utf8');
            var hand = new hand_file_parser.hand();
            hand.data = input_hand;
            var output_hand = hand.parseHand();

            assert_or_save_output(output_hand, '/testHands/expected-output-hand6.js');
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
        
        it('should throw an error if the winner is not a member of the seats', function() {
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
            var winner = "LtGrimms";
            var winnings = 20;

            (function() {
                hand.addWinnings(winner, winnings, false);
            }).should.throw(errorLib.addWinningsNoWinnerFound);

        });
    });
    
    describe('isPosInt', function() {
        it('should return true for positive integer values', function() {
            var input = 1;
            var expectedOutput = true;
            var actualOutput = hand_file_parser.isPosInt(input);

            actualOutput.should.eql(expectedOutput);
        });

        it('should work for really big numbers', function() {
            var input = 139421020234;
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
            var inputLine = "LtGrimms: bets 120";
            //var handNumber = 1;
            var name = "LtGrimms";
            //var round = "flop";
            var type = "bet";
            var amount = 120;
            //var currentBetSize = 0;
            //var actionNumber = 1;

            var expectedOutput = new hand_file_parser.action();
            expectedOutput.name = name;
            expectedOutput.type = type;
            expectedOutput.amount = amount;

            var action = new hand_file_parser.action();
            action.createAction(inputLine); 

            action.should.eql(expectedOutput);
        });

    });

    describe('determineCurrentBet', function() {
        it('should leave the current bet unchanged for fold actions', function() {
            var inputLine = "LtGrimms: folds";
            var oldCurrnetBet = 100;

            var expectedOutput = 100;
            var actualOutput = hand_file_parser.determineCurrentBet(inputLine, oldCurrnetBet);

            actualOutput.should.eql(expectedOutput);
        });

        it('should add the raise amount to an old bet', function() {
            var inputLine = "LtGrimms: raises 30 to 50";
            var oldCurrentBet = 20;

            var expectedOutput = 50;
            var actualOutput = hand_file_parser.determineCurrentBet(inputLine, oldCurrentBet);
            
            actualOutput.should.eql(expectedOutput);
            
        });

        it('should add a bet amount to nothing', function() {
            var inputLine = "LtGrimms: bets 13000 and is all-in";
            var oldCurrentBet = 0;

            var expectedOutput = 13000;
            var actualOutput = hand_file_parser.determineCurrentBet(inputLine, oldCurrentBet);

            actualOutput.should.eql(expectedOutput);
        });

        it('should add the small blind amount to nothing', function() {
            var inputLine = "LtGrimms: posts small blind 10";
            var oldCurrentBet = 0;

            var expectedOutput = 10;
            var actualOutput = hand_file_parser.determineCurrentBet(inputLine, oldCurrentBet);

            actualOutput.should.eql(expectedOutput);
        });

        it('should correctly set the current bet at the big blind', function() {
            var inputLine = "LtGrimms: posts big blind 80";
            var oldCurrentBet = 40;

            var expectedOutput = 80;
            var actualOutput = hand_file_parser.determineCurrentBet(inputLine, oldCurrentBet);

            actualOutput.should.eql(expectedOutput);
        });

        it('should corrctly return 0 for ante posting actions', function() {
            var inputLine = "LtGrimms: posts the ante 20";
            var oldCurrentBet = 0;

            var expectedOutput = 0;
            var actualOutput = hand_file_parser.determineCurrentBet(inputLine, oldCurrentBet);

            actualOutput.should.eql(expectedOutput);
        });
    });

    describe('determineActionAmount', function() {
        it('should return 0 for check actions', function() {
            var actionTypeObject = {
                regEx: reLib.check,
                type: 'check'
            };
            var inputLine = "LtGrimms: checks";

            var actualOutput = hand_file_parser.determineActionAmount(actionTypeObject, inputLine);
            var expectedOutput = 0;

            actualOutput.should.eql(expectedOutput);
        });

        it('should return 0 for fold actions', function() {
            var actionTypeObject = {
                regEx: reLib.fold,
                type: 'fold'
            };
            var inputLine = "LtGrimms: folds";

            var expectedOutput = 0;
            var actualOutput = hand_file_parser.determineActionAmount(actionTypeObject,inputLine);

            actualOutput.should.eql(expectedOutput);
        });

        it('should return the correct amount for bet actoins', function() {
            var actionTypeObject = {
                regEx: reLib.bet,
                type: 'bet'
            };
            var inputLine = "LtGrimms: bets 100";

            var expectedOutput = 100;
            var actualOutput = hand_file_parser.determineActionAmount(actionTypeObject,inputLine);

            actualOutput.should.eql(expectedOutput);
        });

        it('should return the correct amount for raise actoins', function() {
            var actionTypeObject = {
                regEx: reLib.raise,
                type: 'raise'
            };
            var inputLine = "LtGrimms: raises 100 to 200";

            var expectedOutput = 200;
            var actualOutput = hand_file_parser.determineActionAmount(actionTypeObject,inputLine);

            actualOutput.should.eql(expectedOutput);
        });
    });

    describe('parseActions', function() {
        it('should parse a series of ante posts and blind posts', function() {
            var line1 = "LtGrimms: posts the ante 20";
            var line2 = "mecco: posts the ante 20";
            var line3 = "johnny boy 50: posts the ante 20";
            var line4 = "anotherPlayer: posts small blind 100";
            var line5 = "lastPlayer: posts big blind 200";
            var inputLines = [line1, line2, line3, line4, line5];

            var expectedHand = new hand_file_parser.hand();
            expectedHand.handInfo.number = 1;
            var action1 = new hand_file_parser.action();
            var action2 = new hand_file_parser.action();
            var action3 = new hand_file_parser.action();
            var action4 = new hand_file_parser.action();
            var action5 = new hand_file_parser.action();
            action1.createAction(line1);
            action2.createAction(line2);
            action3.createAction(line3);
            action4.createAction(line4);
            action5.createAction(line5);

            action1.actionNumber = 1;
            action1.currentBetSize = 0;
            action1.currentPotSize = 0;
            action1.round = "preflop";
            action1.handNumber = 1;
            action2.actionNumber = 2;
            action2.currentBetSize = 0;
            action2.currentPotSize = 20;
            action2.round = "preflop";
            action2.handNumber = 1;
            action3.actionNumber = 3;
            action3.currentBetSize = 0;
            action3.currentPotSize = 40;
            action3.round = "preflop";       
            action3.handNumber = 1;
            action4.actionNumber = 4;
            action4.currentBetSize = 0;
            action4.currentPotSize = 60;
            action4.round = "preflop";       
            action4.handNumber = 1;
            action5.actionNumber = 5;
            action5.currentBetSize = 100;
            action5.currentPotSize = 160;
            action5.round = "preflop";       
            action5.handNumber = 1;

            
            expectedHand.actions.push(action1);
            expectedHand.actions.push(action2);
            expectedHand.actions.push(action3);
            expectedHand.actions.push(action4);
            expectedHand.actions.push(action5);
            
            var actualHand = new hand_file_parser.hand();
            actualHand.handInfo.number = 1;
            actualHand.parseActions(inputLines, 0, 5);

            actualHand.should.eql(expectedHand);
        });

        it('should parse both blind posts followed by anything', function() {
            var line1 = "LtGrimms: posts small blind 75";
            var line2 = "mecco: posts big blind 150";
            var line3 = "johnny boy 50: folds";
            var inputLines = [line1, line2, line3];

            var expectedHand = new hand_file_parser.hand();
            expectedHand.handInfo.number = 1;
            var action1 = new hand_file_parser.action();
            var action2 = new hand_file_parser.action();
            var action3 = new hand_file_parser.action();

            action1.createAction(line1);
            action2.createAction(line2);
            action3.createAction(line3);

            action1.actionNumber = 1;
            action1.currentBetSize = 0;
            action1.currentPotSize = 0;
            action1.round = "preflop";
            action1.handNumber = 1;
            action2.actionNumber = 2;
            action2.currentBetSize = 75;
            action2.currentPotSize = 75;
            action2.round = "preflop";
            action2.handNumber = 1;
            action3.actionNumber = 3;
            action3.currentBetSize = 150;
            action3.currentPotSize = 225;
            action3.round = "preflop";       
            action3.handNumber = 1;
            
            expectedHand.actions.push(action1);
            expectedHand.actions.push(action2);
            expectedHand.actions.push(action3);

            var actualHand = new hand_file_parser.hand();
            actualHand.handInfo.number = 1;
            actualHand.parseActions(inputLines, 0, 3);
            
            actualHand.should.eql(expectedHand);
        });
        
        it('should parse blind posts followed by a raise', function() {
            var line1 = "LtGrimms: posts small blind 75";
            var line2 = "mecco: posts big blind 150";
            var line3 = "johnny boy 50: raises 150 to 300";
            var inputLines = [line1, line2, line3];

            var expectedHand = new hand_file_parser.hand();
            expectedHand.handInfo.number = 1;
            var action1 = new hand_file_parser.action();
            var action2 = new hand_file_parser.action();
            var action3 = new hand_file_parser.action();

            action1.createAction(line1);
            action2.createAction(line2);
            action3.createAction(line3);

            action1.actionNumber = 1;
            action1.currentBetSize = 0;
            action1.currentPotSize = 0;
            action1.round = "preflop";
            action1.handNumber = 1;
            action2.actionNumber = 2;
            action2.currentBetSize = 75;
            action2.currentPotSize = 75;
            action2.round = "preflop";
            action2.handNumber = 1;
            action3.actionNumber = 3;
            action3.currentBetSize = 150;
            action3.currentPotSize = 225;
            action3.round = "preflop";       
            action3.handNumber = 1;
            
            expectedHand.actions.push(action1);
            expectedHand.actions.push(action2);
            expectedHand.actions.push(action3);

            var actualHand = new hand_file_parser.hand();
            actualHand.handInfo.number = 1;
            actualHand.parseActions(inputLines, 0, 3);
            
            actualHand.should.eql(expectedHand);
            
        });

        it('should parse a raise followed by anything', function() {
            var line1 = "whoever: posts big blind 150";
            var line2 = "LtGrimms: raises 150 to 300";
            var line3 = "mecco: raises 400 to 700";
            var inputLines = [line1, line2, line3];

            var expectedHand = new hand_file_parser.hand();
            expectedHand.handInfo.number = 1;
            var action1 = new hand_file_parser.action();
            var action2 = new hand_file_parser.action();
            var action3 = new hand_file_parser.action();

            action1.createAction(line1);
            action2.createAction(line2);
            action3.createAction(line3);

            action1.actionNumber = 1;
            action1.currentBetSize = 0;
            action1.currentPotSize = 0;
            action1.round = "preflop";
            action1.handNumber = 1;
            action2.actionNumber = 2;
            action2.currentBetSize = 150;
            action2.currentPotSize = 150;
            action2.round = "preflop";
            action2.handNumber = 1;
            action3.actionNumber = 3;
            action3.currentBetSize = 300;
            action3.currentPotSize = 450;
            action3.round = "preflop";
            action3.handNumber = 1;
            
            expectedHand.actions.push(action1);
            expectedHand.actions.push(action2);
            expectedHand.actions.push(action3);

            var actualHand = new hand_file_parser.hand();
            actualHand.handInfo.number = 1;
            actualHand.parseActions(inputLines, 0, 3);
            
            actualHand.should.eql(expectedHand);

        });

        it('should parse a bet followed by anything', function() {
            var line1 = "*** FLOP *** [As Jh 4d]";
            var line2 = "LtGrimms: bets 300";
            var line3 = "mecco: calls 300";
            var inputLines = [line1, line2, line3];

            var expectedHand = new hand_file_parser.hand();
            expectedHand.handInfo.number = 1;
            var action1 = new hand_file_parser.action();
            var action2 = new hand_file_parser.action();

            action1.createAction(line2);
            action2.createAction(line3);

            action1.actionNumber = 1;
            action1.currentBetSize = 0;
            action1.currentPotSize = 0;
            action1.round = "flop";
            action1.handNumber = 1;
            action2.actionNumber = 2;
            action2.currentBetSize = 300;
            action2.currentPotSize = 300;
            action2.round = "flop";
            action2.handNumber = 1;
            
            expectedHand.actions.push(action1);
            expectedHand.actions.push(action2);

            var actualHand = new hand_file_parser.hand();
            actualHand.handInfo.number = 1;
            actualHand.parseActions(inputLines, 0, 3);
            
            actualHand.should.eql(expectedHand);            
        });
            
        it('should parse a check followed by anything', function() {
            var line1 = "*** FLOP *** [As Jh 4d]";
            var line2 = "LtGrimms: checks";
            var line3 = "mecco: bets 300";
            var inputLines = [line1, line2, line3];

            var expectedHand = new hand_file_parser.hand();
            expectedHand.handInfo.number = 1;
            var action1 = new hand_file_parser.action();
            var action2 = new hand_file_parser.action();

            action1.createAction(line2);
            action2.createAction(line3);

            action1.actionNumber = 1;
            action1.currentBetSize = 0;
            action1.currentPotSize = 0;
            action1.round = "flop";
            action1.handNumber = 1;
            action2.actionNumber = 2;
            action2.currentBetSize = 0;
            action2.currentPotSize = 0;
            action2.round = "flop";
            action2.handNumber = 1;
            
            expectedHand.actions.push(action1);
            expectedHand.actions.push(action2);

            var actualHand = new hand_file_parser.hand();
            actualHand.handInfo.number = 1;
            actualHand.parseActions(inputLines, 0, 3);
            
            actualHand.should.eql(expectedHand);            
        });

        it('should parse a fold followed by anything', function() {
            var line1 = "Blah: posts big blind 200";
            var line2 = "LtGrimms: folds";
            var line3 = "mecco: calls 200";
            var inputLines = [line1, line2, line3];

            var expectedHand = new hand_file_parser.hand();
            expectedHand.handInfo.number = 1;
            var action1 = new hand_file_parser.action();
            var action2 = new hand_file_parser.action();
            var action3 = new hand_file_parser.action();

            action1.createAction(line1);
            action2.createAction(line2);
            action3.createAction(line3);

            action1.actionNumber = 1;
            action1.currentBetSize = 0;
            action1.currentPotSize = 0;
            action1.round = "preflop";
            action1.handNumber = 1;
            action2.actionNumber = 2;
            action2.currentBetSize = 200;
            action2.currentPotSize = 200;
            action2.round = "preflop";
            action2.handNumber = 1;
            action3.actionNumber = 3;
            action3.currentBetSize = 200;
            action3.currentPotSize = 200;
            action3.round = "preflop";
            action3.handNumber = 1;
            
            expectedHand.actions.push(action1);
            expectedHand.actions.push(action2);
            expectedHand.actions.push(action3);

            var actualHand = new hand_file_parser.hand();
            actualHand.handInfo.number = 1;
            actualHand.parseActions(inputLines, 0, 3);
            
            actualHand.should.eql(expectedHand);            
        });

        
    });

    describe('determineCurrentPot', function() {
        it('should add the proper amount from bet actions', function() {
            var oldPotSize = 100;
            var line = "LtGrimms: bets 50";

            var expectedOutput = 150;
            var actualOutput = hand_file_parser.determineCurrentPot(line, oldPotSize);

            actualOutput.should.eql(expectedOutput);
        });

        it('should add the proper amount from betAllIn actions', function() {
            var oldPotSize = 100;
            var line = "LtGrimms: bets 50 and is all-in";

            var expectedOutput = 150;
            var actualOutput = hand_file_parser.determineCurrentPot(line, oldPotSize);

            actualOutput.should.eql(expectedOutput);            
        });

        it('should add the proper amount from call actions', function() {
            var oldPotSize = 100;
            var line = "LtGrimms: calls 50";

            var expectedOutput = 150;
            var actualOutput = hand_file_parser.determineCurrentPot(line, oldPotSize);

            actualOutput.should.eql(expectedOutput);
        });

        it('should add the proper amount from postBlind actions', function() {
            var oldPotSize = 0;
            var line = "LtGrimms: posts small blind 50";

            var expectedOutput = 50;
            var actualOutput = hand_file_parser.determineCurrentPot(line, oldPotSize);

            actualOutput.should.eql(expectedOutput);
        });

        it('should add the proper amount from postAnte actions', function() {
            var oldPotSize = 200;
            var line = "LtGrimms: posts the ante 50";

            var expectedOutput = 250;
            var actualOutput = hand_file_parser.determineCurrentPot(line, oldPotSize);

            actualOutput.should.eql(expectedOutput);
        });

        it('should add the proper amount from raise actions', function() {
            var oldPotSize = 100;
            var line = "LtGrimms: raises 100 to 150";

            var expectedOutput = 250;
            var actualOutput = hand_file_parser.determineCurrentPot(line, oldPotSize);

            actualOutput.should.eql(expectedOutput);
        });

        it('should add the proper amount from raiseAllIn actions', function() {
            var oldPotSize = 100;
            var line = "LtGrimms: raises 100 to 150";

            var expectedOutput = 250;
            var actualOutput = hand_file_parser.determineCurrentPot(line, oldPotSize);

            actualOutput.should.eql(expectedOutput);
        });

        it('should add the proper amount from fold actions', function() {
            var oldPotSize = 100;
            var line = "LtGrimms: folds";

            var expectedOutput = 100;
            var actualOutput = hand_file_parser.determineCurrentPot(line, oldPotSize);

            actualOutput.should.eql(expectedOutput);
        });

    });

    describe('parseHandTable', function() {
        it('should return the correct hand information', function() {
            var data = "PokerStars Hand #123456: Tournament #789101112, $10 + $1 USD Hold'em No Limit - Level IV (100/200) - 2015/05/05 01:01:01 ET";
            var expectedOutput = {
                number: 123456,
                ante: 0,
                bigBlind: 200,
                numberOfPlayers: null,
                smallBlind: 100,
                timestamp: new Date("2015-05-04 23:01:01.000 -0600"),
                tournament: 789101112
            };
            var hand = new hand_file_parser.hand();
            hand.data = data;

            hand.parseHandTable();

            hand.handInfo.should.eql(expectedOutput);
        });

        it('should return the correct hand information when antes are in play', function() {
            var data = "PokerStars Hand #123456: Tournament #789101112, $10 + $1 USD Hold'em No Limit - Level IV (100/200) - 2015/05/05 01:01:01 ET\nLtGrimms: posts the ante 10";
            var expectedOutput = {
                number: 123456,
                ante: 10,
                bigBlind: 200,
                numberOfPlayers: null,
                smallBlind: 100,
                timestamp: new Date("2015-05-04 23:01:01.000 -0600"),
                tournament: 789101112
            };
            var hand = new hand_file_parser.hand();
            hand.data = data;

            hand.parseHandTable();

            hand.handInfo.should.eql(expectedOutput);
        });
    });

    describe('parseBoardTable', function() {
        it('should return nothing to actions with no board', function() {
            var expectedHand = new hand_file_parser.hand();
            expectedHand.board.handNumber = 1;
            var actualHand = new hand_file_parser.hand();
            actualHand.handInfo.number = 1;

            var line1 = "LtGrimms:posts the ante 20";
            var line2 = "steevo: posts the ante 20";
            var line3 = "LtGrimms: posts small blind 100";
            var line4 = "steevo: posts big blind 200";
            var lines = line1 + "/n" + line2 + "/n" + line3 + "/n" + line4;

            actualHand.data = lines;
            actualHand.parseBoardTable();

            actualHand.board.should.eql(expectedHand.board);
            
        });

        it('should return the correct flop for actions with a flop', function() {
            var expectedHand = new hand_file_parser.hand();
            expectedHand.board.handNumber = 1;
            expectedHand.board.flop1 = 'Jh';
            expectedHand.board.flop2 = '5s';
            expectedHand.board.flop3 = '4c';
            var actualHand = new hand_file_parser.hand();
            actualHand.handInfo.number = 1;

            var line1 = "LtGrimms:posts the ante 20";
            var line2 = "steevo: posts the ante 20";
            var line3 = "LtGrimms: posts small blind 100";
            var line4 = "steevo: posts big blind 200";
            var line5 = "***** FLOP ***** [Jh 5s 4c]";
            var lines = line1 + "/n" + line2 + "/n" + line3 + "/n" + line4 + "/n" + line5;

            actualHand.data = lines;
            actualHand.parseBoardTable();

            actualHand.board.should.eql(expectedHand.board);
            
        });

        it('should return the correct flop and turn for actions with a flop and turn', function() {
            var expectedHand = new hand_file_parser.hand();
            expectedHand.board.handNumber = 1;
            expectedHand.board.flop1 = 'Jh';
            expectedHand.board.flop2 = '5s';
            expectedHand.board.flop3 = '4c';
            expectedHand.board.turn = '7s';
            var actualHand = new hand_file_parser.hand();
            actualHand.handInfo.number = 1;

            var line1 = "LtGrimms:posts the ante 20";
            var line2 = "steevo: posts the ante 20";
            var line3 = "LtGrimms: posts small blind 100";
            var line4 = "steevo: posts big blind 200";
            var line5 = "***** FLOP ***** [Jh 5s 4c]";
            var line6 = "LtGrimms: bets 40";
            var line7 = "steevo: calls 40";
            var line8 = "***** TURN ***** [Jh 5s 4c] [7s]";
            var lines = line1 + "/n" + line2 + "/n" + line3 + "/n" + line4 + "/n" + line5 + "\n" + line6 + "\n" + line7 + "\n" + line8;

            actualHand.data = lines;
            actualHand.parseBoardTable();

            actualHand.board.should.eql(expectedHand.board);
            
        });

        it('should return the correct flop, turn and river for actions with a flop, turn and river', function() {
            var expectedHand = new hand_file_parser.hand();
            expectedHand.board.handNumber = 1;
            expectedHand.board.flop1 = 'Jh';
            expectedHand.board.flop2 = '5s';
            expectedHand.board.flop3 = '4c';
            expectedHand.board.turn = '7s';
            expectedHand.board.river = 'Kd';
            var actualHand = new hand_file_parser.hand();
            actualHand.handInfo.number = 1;

            var line1 = "LtGrimms:posts the ante 20";
            var line2 = "steevo: posts the ante 20";
            var line3 = "LtGrimms: posts small blind 100";
            var line4 = "steevo: posts big blind 200";
            var line5 = "***** FLOP ***** [Jh 5s 4c]";
            var line6 = "LtGrimms: bets 40";
            var line7 = "steevo: calls 40";
            var line8 = "***** TURN ***** [Jh 5s 4c] [7s]";
            var line9 = "LtGrimms: bets 80";
            var line10 = "steevo; calls 80";
            var line11 = "***** RIVER ***** [Jh 5s 4c 7s] [Kd]";
            var lines = line1 + "/n" + line2 + "/n" + line3 + "/n" + line4 + "/n" + line5 + "\n" + line6 + "\n" + line7 + "\n" + line8 + "\n" + line9 + "\n" + line10 + "\n" + line11;

            actualHand.data = lines;
            actualHand.parseBoardTable();

            actualHand.board.should.eql(expectedHand.board);
            
        });

        
    });

    describe('parsePlayersHoleCards', function() {
        it('should parse the correct hole cards for the person playing', function() {
            var expectedHand = new hand_file_parser.hand();
            var actualHand = new hand_file_parser.hand();
            expectedHand.holeCards = [ {
                handNumber: 1,
                name: 'LtGrimms',
                card1: 'As',
                card2: 'Ah'
            }];
            actualHand.handInfo.number = 1;
            actualHand.data = "Dealt to LtGrimms [As Ah]";

            
            actualHand.parsePlayersHoleCards(0);

            actualHand.holeCards.should.eql(expectedHand.holeCards);
        });

        it('should parse the correct hole cards for the opponents if there is a showdown', function() {
            var line1 = "Dealt to LtGrimms [As Ah]\n";
            var line2 = "****** SHOW DOWN *******\n";
            var line3 = "Rocky: shows [Ks Kh]\n";
            var lines = line1 + line2 + line3;
            
            var expectedHand = new hand_file_parser.hand();
            var actualHand = new hand_file_parser.hand();
            expectedHand.holeCards = [ {
                handNumber: 1,
                name: 'LtGrimms',
                card1: 'As',
                card2: 'Ah'
            }, {
                handNumber: 1,
                name: 'Rocky',
                card1: 'Ks',
                card2: 'Kh'
            }];
            actualHand.handInfo.number = 1;
            actualHand.data = lines;
            actualHand.hasShowDown = true;
            
            actualHand.parsePlayersHoleCards(0);

            actualHand.holeCards.should.eql(expectedHand.holeCards);
        });

        it('should parse the correct hole cards when the opponent mucks', function() {
            var line1 = "Dealt to LtGrimms [As Ah]\n";
            var line2 = "***** SHOW DOWN *****\n";
            var line3 = "Seat 7: Rocky mucked [Ks Kh]";
            var lines = line1 + line2 + line3;

            var expectedHand = new hand_file_parser.hand();
            var actualHand = new hand_file_parser.hand();
            expectedHand.holeCards = [ {
                handNumber: 1,
                name: "LtGrimms",
                card1: "As",
                card2: "Ah"
            }, {
                handNumber: 1,
                name: "Rocky",
                card1: "Ks",
                card2: "Kh"
            }];

            actualHand.handInfo.number = 1;
            actualHand.data = lines;
            actualHand.hasShowDown = true;

            actualHand.parsePlayersHoleCards(0);
            actualHand.holeCards.should.eql(expectedHand.holeCards);
           
            
        });
    });

    describe('parseOpponentHoleCards', function() {
        it('should correctly parse hold cards that are displayed in a showdown', function() {
            var line1 = "Dealt to LtGrimms [As Ah]\n";
            var line2 = "***** SHOW DOWN *****\n";
            var line3 = "Rocky: shows [Ks Kh]\n";
            var lines = line1 + line2 + line3;

            var expectedHand = new hand_file_parser.hand();
            var actualHand = new hand_file_parser.hand();
            expectedHand.holeCards = [ {
                handNumber: 1,
                name: "Rocky",
                card1: "Ks",
                card2: "Kh"
            }];

            actualHand.handInfo.number = 1;
            actualHand.data = lines;

            actualHand.parseOpponentHoleCards(0);
            actualHand.holeCards.should.eql(expectedHand.holeCards);
        });

        it('should correctly parse hole cards that are mucked', function() {
            var line1 = "Dealt to LtGrimms [As Ah]\n";
            var line2 = "***** SHOW DOWN *****\n";
            var line3 = "Seat 7: Rocky mucked [Ks Kh]";
            var lines = line1 + line2 + line3;

            var expectedHand = new hand_file_parser.hand();
            var actualHand = new hand_file_parser.hand();
            expectedHand.holeCards = [ {
                handNumber: 1,
                name: "Rocky",
                card1: "Ks",
                card2: "Kh"
            }];

            actualHand.handInfo.number = 1;
            actualHand.data = lines;

            actualHand.parseOpponentHoleCards(0);
            actualHand.holeCards.should.eql(expectedHand.holeCards);
           
        });
    });

    describe.skip('parsePlayersInformation', function() {
        it('should parse the correct player information', function() {
            var input_hand = fs.readFileSync(__dirname + "/testHands/test-hand1.txt", 'utf8');
            var actualHand = new hand_file_parser.hand(input_hand);
            var expectedHand = new hand_file_parser.hand();

        });
        it('should parse the correct player information', function() {

        });

        it('should parse the correct player information', function() {
            
        });
    });

    describe.skip('parseWinnings', function() {
        it('should correctly add winnings to the correct player', function() {

        });

        it('should correctly add winnings to the correct player', function() {

        });
    });
});
