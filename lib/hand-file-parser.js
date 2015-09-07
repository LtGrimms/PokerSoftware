var reLib = require('./poker-regex-library');

function addWinnings(seats, winner, winnings, sidepot) {
    for (var i = 0; i < seats.length; i++) {
        if (seats[i].name.localeCompare(winner) === 0) {
            if (!sidepot) {
                seats[i].winnings = winnings;
            } else {
                seats[i].sidepots += winnings;
            }
        }
    }
}

function createAction(handNumber, name, round, type, amount, currentBetSize) {
    // throw errors here like if amount and/or current bet size are not ints
    if (!isPosInt(amount)) {
        //throw error
    }
    if (!isPosInt(currentBetSize)) {
        //throw error
    }
    var action = {handNumber: handNumber, name: name, round: round, type: type, amount: amount, currentBetSize: currentBetSize};
    return action;
}

//from stack-overflow
function isPosInt(value) {
    return !isNaN(value) &&
        parseInt(Number(value)) === value &&
        !isNaN(parseInt(value, 10)) &&
        parseInt(value) >= 0;
}

function parseHandTable(data, numberOfPlayers) {
//Parse The Hand Information
    var hand = {
        number: data.match(reLib.handNumber)[1],
        timeStamp: data.match(reLib.handTimeStamp)[1],
        tournament: data.match(reLib.handTournamentNumber)[1],
        anteAmount: null,
        smallBlindAmount: parseInt(data.match(reLib.handSmallBlindAmount)[1], 10),
        bigBlindAmount: parseInt(data.match(reLib.handBigBlindAmount)[1], 10),
        numberOfPlayers: numberOfPlayers
    };

    if (data.match(reLib.postAnte)) {
        hand.anteAmount = data.match(reLib.postAnte)[2];
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

function parsePlayersHoleCards(data, handNumber, endOfActionIndex, showDown) {
    var holeCards = [];  
    var yourHoleCards = {};
    var match = data.match(reLib.yourHoleCards);
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

function parsePlayersInformation(lines, endOfPlayerIndex, endOfActionIndex, handNumber, showDown) {
    var seats = [];
    var buttonSeat = parseInt(lines[1].match(reLib.buttonPosition)[1], 10);
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
            winnings: null,
            sidepots: null
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
        console.log("non-showdown winning entered");
        for (var line = endOfActionIndex; line < lines.length; line++) {
            if (lines[line].match(reLib.potWinnings)) {
                var match = lines[line].match(reLib.potWinnings);
                var winner = match[1];
                var winnings = match[2];
                addWinnings(seats, winner, winnings, false);
            }
        }
    } else {
        //console.log("showdown winning entered");
        for (var line = endOfActionIndex; line < lines.length; line++) {
            if (lines[line].match(reLib.showDownPotWinnings)) {
                console.log("potWinnings match on: " + lines[line]);
                var match = lines[line].match(reLib.showDownPotWinnings);
                var winner = match[1];
                var winnings = match[2];
                //console.log("pot of " + winnings + " assigned to " + winner);
                addWinnings(seats, winner, winnings, false);
            } else if (lines[line].match(reLib.showDownSidepotWinnings)) {
                var match = lines[line].match(reLib.showDownSidepotWinnings);
                var sideWinner = match[1];
                var sideWinnings = match[2];
                addWinnings(seats, sideWinner, sideWinnings, true);
            } 
        }
    }

    return seats;
}

function parseActions(lines, endOfPlayerIndex, endOfActionIndex, handNumber, bigBlindAmount) {
    var actions = [];
    var round = "preflop";
    var currentBetSize = parseInt(bigBlindAmount, 10);
    for (var i = endOfPlayerIndex; i < endOfActionIndex; i++) {
        var action = {};
        if (lines[i].match(reLib.postAnte)) {
            var match = lines[i].match(reLib.postAnte);
            var name = match[1];
            var amount = parseInt(match[2]);
            action = createAction(handNumber, name, round, "post ante", amount, null);
            actions.push(action);
        } else if (lines[i].match(reLib.postBlind)) {
            var match = lines[i].match(reLib.postBlind);
            var name = match[1];
            var amount = parseInt(match[2]);
            action = createAction(handNumber, name, round, "post blind", amount, null);
            actions.push(action);
        } else if (lines[i].match(reLib.fold)) {
            var match = lines[i].match(reLib.fold);
            var name = match[1];
            action = createAction(handNumber, name, round, "fold", null, currentBetSize);
            actions.push(action);
        } else if (lines[i].match(reLib.call)) {
            var match = lines[i].match(reLib.call);
            var name = match[1];
            var amount = parseInt(match[2]);
            action = createAction(handNumber, name, round, "call", amount, currentBetSize);
            actions.push(action);
        } else if (lines[i].match(reLib.bet)) {
            var match = lines[i].match(reLib.bet);
            var name = match[1];
            var betSize = parseInt(match[2]);
            action = createAction(handNumber, name, round, "bet", betSize, currentBetSize);
            actions.push(action);
            currentBetSize = betSize;
        } else if (lines[i].match(reLib.betAllIn)) {
            var match = lines[i].match(reLib.bet);
            var name = match[1];
            var betSize = parseInt(match[2]);
            action = createAction(handNumber, name, round, "bet all-in", betSize, currentBetSize);
            actions.push(action);
            currentBetSize = betSize;
        } else if (lines[i].match(reLib.raise)) {
            var match = lines[i].match(reLib.raise);
            var name = match[1];
            var raiseAmount = parseInt(match[2]);
            action = createAction(handNumber, name, round, "raise", raiseAmount, currentBetSize);
            actions.push(action);
            currentBetSize += raiseAmount;
        } else if (lines[i].match(reLib.raiseAllIn)) {
            match = lines[i].match(reLib.raiseAllIn);
            var name = match[1];
            var raiseAmount = parseInt(match[2]);
            action = createAction(handNumber, name, round, "raise all-in", raiseAmount, currentBetSize);
            actions.push(action);
            currentBetSize += raiseAmount;
        } else if (lines[i].match(reLib.flop)) {
            round = "flop";
        } else if (lines[i].match(reLib.turn)) {
            round = "turn";
        } else if (lines[i].match(reLib.river)) {
            round = "river";
        }
    }

    return actions;
}

function parse_hand(data) {
    var lines = data.split("\n");
    var line = 2;
    while (lines[line].match(reLib.playerInformation)) {
        line++;
    }
    var endOfPlayerIndex = line;
    var numberOfPlayers = line - 2;
    
    while (!lines[line].match(reLib.summary) && !lines[line].match(reLib.showDown)) {
        line++;
    }
    var endOfActionIndex = line;
    var handEndedInShowDown = (lines[endOfActionIndex].match(reLib.showDown) != null);

    
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
    var actions = parseActions(lines, endOfPlayerIndex, endOfActionIndex, hand.number, hand.bigBlindAmount);

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
    var hands = data.split("\n\n\n\n");
    var handNumber = 0;
    //hand 41 first showdown in HH20150815 T1292680929 No Limit Hold'em $10 + $1.txt
    //hand 89 first showdown with 2 players showing, same file
    var hand = parse_hand(hands[handNumber]);

    // console.log(hands[handNumber]);

    //console.log(actions);

    console.log("*******HAND INFO********* \n");
    console.log(hand.hand);
    console.log("*******PLAYER INFO********* \n");
    console.log(hand.seats);
    console.log("*******BOARD INFO******** \n");
    console.log(hand.board);
    console.log("*******HOLE CARDS******** \n");
    console.log(hand.holeCards);
    console.log("*******ACTIONS********* \n");
    console.log(hand.actions);
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
