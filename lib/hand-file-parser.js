var reLib = require('./poker-regex-library');

function addWinnings(regEx, line, seats, sidepot) {
    var match = line.match(regEx);
    var winner = match[1];
    var winnings = match[2];

    for (var i = 0; i < seats.length; i++) {
        if (seats[i].name.localeCompare(winner) === 0) {
            if (!sidepot) {
                seats[i].winnings = winnings;
            } else {
                seats[i].sidepot += winnings;
            }
        }
    }
}

function CreateActionException(message) {
    this.message = message;
}

function createAction(handNumber, name, round, type, amount, currentBetSize, actionNumber) {
    // throw errors here like if amount and/or current bet size are not ints
    if (!isPosInt(amount)) {
        throw new CreateActionException("tried to create action with non-integer bet/raise amount");
    }
    if (!isPosInt(currentBetSize)) {
        throw new CreateActionException("tried to create action with non-integer current bet amount");
    }
    var action = {
        handNumber: handNumber,
        name: name,
        round: round,
        type: type,
        amount: amount,
        currentBetSize: currentBetSize,
        actionNumber: actionNumber
    };
    return action;
}

//from stack-overflow
function isPosInt(value) {
    return !isNaN(value) &&
        parseInt(Number(value), 10) === value &&
        !isNaN(parseInt(value, 10)) &&
        parseInt(value, 10) >= 0;
}

function ParseException(data, message) {
    this.data = data;
    this.message = message;
}

function parseHandTable(data, numberOfPlayers) {
//Parse The Hand Information
    var handNumber = data.match(reLib.handNumber);
    var timeStamp = data.match(reLib.handTimeStamp);
    var tournament = data.match(reLib.handTournamentNumber);
    var smallBlind = data.match(reLib.hadnSmallBlindAmount);
    var bigBlind = data.match(reLib.handBigBlindAmount);

    
    if (!handNumber) {
        throw new ParseException(data, "cound not find hand number");
    }
    if (!timeStamp) {
        throw new ParseException(data, "cound not find timestamp");
    }
    if (!smallBlind) {
        throw new ParseException(data, "could not find smallBlind");
    }
    if (!bigBlind) {
        throw new ParseException(data, "cound not find bigBlind");
    }
    if (!tournament) {
        //No need for error here, this could be a cash game.
        tournament = null;
    }

        var hand = {
        number: handNumber[1],
        timestamp: new Date(timeStamp[1]),
        tournament: tournament[1],
        ante: null,
        smallBlind: parseInt(smallBlind[1], 10),
        bigBlind: parseInt(bigBlind[1], 10),
        numberOfPlayers: numberOfPlayers
    };
    // Correct for eastern time
    hand.timestamp.setHours(hand.timestamp.getHours() - 2);

    if (data.match(reLib.postAnte)) {
        hand.ante = data.match(reLib.postAnte)[2];
    }
    return hand;
}

function parseBoardTable(data, handNumber) {
    var board = {
        handNumber: handNumber,
        flop1: null,
        flop2:null,
        flop3: null,
        turn: null,
        river: null
    };
    
    if (data.match(reLib.flop)){
        board.flop1 = data.match(reLib.flop)[1];
        board.flop2 = data.match(reLib.flop)[2];
        board.flop3 = data.match(reLib.flop)[3];
    }
    if (data.match(reLib.turn)) {
        board.turn = data.match(reLib.turn)[1];
    }
    if (data.match(reLib.river)) {
        board.river = data.match(reLib.river)[1];
    }

    return board;
}

function HoleCardsException(data, message) {
    this.data = data;
    this.message = message;
}

function parsePlayersHoleCards(data, handNumber, endOfActionIndex, showDown) {
    var holeCards = [];  
    var yourHoleCards = {};
    var match = data.match(reLib.yourHoleCards);
    if (!match) {
        throw new HoleCardsException(data, "could not find your hole cards");
    }

    yourHoleCards.handNumber = handNumber;
    yourHoleCards.name = match[1];
    yourHoleCards.card1 = match[2];
    yourHoleCards.card2 = match[3];
    holeCards.push(yourHoleCards);

    if (showDown) {
        var lines = data.split("\n");
        var line = endOfActionIndex;
        for (var line = endOfActionIndex; line < lines.length; line++) {
            if (lines[line].match(reLib.opponentsHoleCards)) {
                var opponentsHoleCards = {};
                var match = lines[line].match(reLib.opponentsHoleCards);
                opponentsHoleCards.handNumber = handNumber;
                opponentsHoleCards.name = match[1];
                opponentsHoleCards.card1 = match[2];
                opponentsHoleCards.card2 = match[3];
                holeCards.push(opponentsHoleCards);
            }
        }
    }


    return holeCards;
}

function ParsePlayersError(lines, message) {
    this.data = lines;
    this.message = message;
}

function parsePlayersInformation(lines, endOfPlayerIndex, endOfActionIndex, handNumber, showDown) {
    var seats = [];
    var findButtonSeat = lines[1].match(reLib.buttonPosition);

    if (!findButtonSeat) {
        throw new ParsePlayersError(lines, "could not find the button seat");
    }
    
    var buttonSeat = parseInt(lines[1].match(findButtonSeat, 10));
    
    var seatsBeforeButton;

    for (var i = 2; i < endOfPlayerIndex; i++) {
        var name = lines[i].match(reLib.name)[1];
        var chips = lines[i].match(reLib.chips)[1];
        var playerSeat = parseInt(lines[i].match(reLib.seat)[1], 10);
        var seat = {
            handNumber: handNumber,
            name: name,
            chips: chips,
            position: playerSeat,
            winnings: 0,
            sidepot: 0
        };
        
        if (playerSeat === buttonSeat) {
            seatsBeforeButton = seats.length;
        }
        
        seats.push(seat);

    }

    for (var i = 0; i < seats.length; i++) {
        if (i <= seatsBeforeButton) {
            seats[i].position = seats.length - seatsBeforeButton + i;
        } else {
            seats[i].position = i - seatsBeforeButton;
        }
    }

    if (!showDown) {
        // console.log("non-showdown winning entered");
        for (var line = endOfActionIndex; line < lines.length; line++) {
            if (lines[line].match(reLib.potWinnings)) {
                var regEx = reLib.potWinnings;
                addWinnings(regEx, line, seats, false);
            }
        }
    } else {
        //console.log("showdown winning entered");
        for (var line = endOfActionIndex; line < lines.length; line++) {
            if (lines[line].match(reLib.showDownPotWinnings)) {
                var regEx = reLib.showDownPotWinnings;
                addWinnings(regEx, line, seats, false);
            } else if (lines[line].match(reLib.showDownSidepotWinnings)) {
                var regEx = reLib.showDownSidepotWinnings;
                addWinnings(regEx, line, seats, true);
            } 
        }
    }

    return seats;
}

function actionPrep(regEx, line, type, handNumber, round, currentBetSize, actionNumber) {
    var match = line.match(regEx);
    var name = match[1];
    var amount = null;
    if (match.length === 3) {
        amount = match[2];
    }

    var action = createAction(handNumber, name, round, type, amount, currentBetSize, actionNumber);
    return action;

}


function parseActions(lines, endOfPlayerIndex, endOfActionIndex, handNumber, bigBlindAmount) {
    var actions = [];
    var round = "preflop";
    var currentBetSize = parseInt(bigBlindAmount, 10);
    for (var i = endOfPlayerIndex; i < endOfActionIndex; i++) {
        var action = {};
        var actionNumber = 1;
        if (lines[i].match(reLib.postAnte)) {
            action = actionPrep(reLib.postAnte, lines[i], "post ante", handNumber, round, currentBetSize, actionNumber);
            actionNumber++;
            actions.push(action);
        } else if (lines[i].match(reLib.postBlind)) {
            action = actionPrep(reLib.postBlind, lines[i], "post blind", handNumber, round, currentBetSize, actionNumber);
            actionNumber++;
            actions.push(action);
        } else if (lines[i].match(reLib.fold)) {
            action = actionPrep(reLib.fold, lines[i], "fold", handNumber, round, currentBetSize, actionNumber);
            actionNumber++;
            actions.push(action);
        } else if (lines[i].match(reLib.call)) {
            action = actionPrep(reLib.call, lines[i], "call", handNumber, round, currentBetSize, actionNumber);
            actionNumber++;
            actions.push(action);
        } else if (lines[i].match(reLib.bet)) {
            action = actionPrep(reLib.bet, lines[i], "bet", handNumber, round, currentBetSize, actionNumber);
            actionNumber++;
            actions.push(action);
            currentBetSize = action.currentBetSize;
        } else if (lines[i].match(reLib.betAllIn)) {
            action = actionPrep(reLib.betAllIn, lines[i], "bet all-in", handNumber, round, currentBetSize, actionNumber);
            actionNumber++;
            actions.push(action);
            currentBetSize = action.currentBetSize;
        } else if (lines[i].match(reLib.raise)) {
            action = actionPrep(reLib.raise, lines[i], "raise", handNumber, round, currentBetSize, actionNumber);
            actionNumber++;
            actions.push(action);
            currentBetSize += action.amount;
        } else if (lines[i].match(reLib.raiseAllIn)) {
            action = actionPrep(reLib.raiseAllIn, lines[i], "raise all-in", handNumber, round, currentBetSize, actionNumber);
            actionNumber++;
            actions.push(action);
            currentBetSize += action.amount;
        } else if (lines[i].match(reLib.flop)) {
            round = "flop";
            actionNumber = 1;
        } else if (lines[i].match(reLib.turn)) {
            round = "turn";
            actionNumber = 1;
        } else if (lines[i].match(reLib.river)) {
            round = "river";
            actionNumber = 1;
        }
    }

    return actions;
}

function HandParsingException(data, message) {
    this.data = data;
    this.message = message;
}

function parse_hand(data) {
    var lines = data.split("\n");
    var line = 0;
    var numberOfPlayers = 0;

    
    while (!lines[line].match(reLib.playerInformation)) {
        line++;
    }

    if (line != 2) {
        throw new HandParsingException(data, "Player information started on unexpected line, perhaps PokerStars has changed thier output format");
    }
    
    while (lines[line].match(reLib.playerInformation)) {
        line++;
        numberOfPlayers++;
    }
    var endOfPlayerIndex = line;
    
    while (!lines[line].match(reLib.summary) && !lines[line].match(reLib.showDown)) {
        line++;
    }
    var endOfActionIndex = line;
    var handEndedInShowDown = (!lines[endOfActionIndex].match(reLib.showDown));

    
    //Parse The Hand Information
    var hand = parseHandTable(data, numberOfPlayers); 

    //Parse The Board
    var board = parseBoardTable(data, hand.number);
    //console.log(board);

    //Parse Players Hole Cards
    var holeCards = parsePlayersHoleCards(data, hand.number, endOfActionIndex, handEndedInShowDown);

    //Parse Players' Information    
    var seats = parsePlayersInformation(lines, endOfPlayerIndex, endOfActionIndex, hand.number, handEndedInShowDown);

    //Parse Actions
    var actions = parseActions(lines, endOfPlayerIndex, endOfActionIndex, hand.number, hand.bigBlind);

    return {
        hand: hand,
        seats: seats,
        board: board,
        holeCards: holeCards,
        actions: actions
    };
}

module.exports = function(data) {
    // this is where you parse the data
    // var hands = data.split("\n\n\n\n");
    // var handNumber = 0;
    //hand 41 first showdown in HH20150815 T1292680929 No Limit Hold'em $10 + $1.txt
    //hand 89 first showdown with 2 players showing, same file
    var hand;
    try {
        hand = parse_hand(data);
    } catch (err) {
        console.error(err.message);
        console.error(err.stack);
        console.error("data: ");
        console.error(data);
        throw err;
    }

    // console.log(hands[handNumber]);

    //console.log(actions);

    // console.log("*******HAND INFO********* \n");
    // console.log(hand.hand);
    // console.log("*******PLAYER INFO********* \n");
    // console.log(hand.seats);
    // console.log("*******BOARD INFO******** \n");
    // console.log(hand.board);
    // console.log("*******HOLE CARDS******** \n");
    // console.log(hand.holeCards);
    // console.log("*******ACTIONS********* \n");
    // console.log(hand.actions);
    return hand;
};

module.exports.addWinnings = addWinnings;
module.exports.parse_hand = parse_hand;
module.exports.isPosInt = isPosInt;
module.exports.createAction = createAction;
module.exports.parseHandTable = parseHandTable;
module.exports.parseBoardTable = parseBoardTable;
module.exports.parsePlayersHoleCards = parsePlayersHoleCards;
module.exports.parsePlayersInformation = parsePlayersInformation;
module.exports.parseActions = parseActions;
