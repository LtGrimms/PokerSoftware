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
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10)) &&
        parseInt(value) >= 0;
}

function parse_hand(data) {
    //Parse The Hand Information
    var hand = {
        number: null,
        timeStamp: null,
        tournament: null,
        smallBlindAmount: null,
        bigBlindAmount: null
    };

    hand.number = data.match(reLib.handNumber)[1];
    hand.timeStamp = data.match(reLib.handtimeStamp)[1];
    hand.tournament = data.match(reLib.handTournamentNumber)[1];
    hand.smallBlindAmount = parseInt(data.match(reLib.handSmallBlindAmount)[1], 10);
    hand.bigBlindAmount = parseInt(data.match(reLib.handBigBlindAmount)[1], 10);

    //console.log(hand);


    //Parse The Board
    var board = {
        handNumber: hand.number,
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
    //console.log(board);

    //Parse Players Hole Cards
    var holeCardsArray = []; // Don't code the variable type into it's name. What if you changed your mind and decided a
    // vector or linked-list would be better than an aray later-on?
    var yourHoleCards = {};
    var match = data.match(reLib.yourHoleCards);
    yourHoleCards.name = match[1];
    yourHoleCards.card1 = match[2];
    yourHoleCards.card2 = match[3];
    holeCardsArray.push(yourHoleCards);



    //console.log(holeCardsArray);

    //Parse Players' Information
    var seats = [];
    var buttonSeat = parseInt(data.match(reLib.buttonPosition)[1], 10);
    var seatsBeforeButton;

    var lines = data.split("\n");

    var line = 2;
    while (lines[line].match(reLib.playerInformation)) {
        var name = lines[line].match(reLib.name)[1];
        var chips = lines[line].match(reLib.chips)[1];
        var playerSeat = parseInt(lines[line].match(reLib.seat)[1], 10);
        var seat = {
            handNumber: hand.number,
            name: name,
            chips: chips,
            position: playerSeat,
            winnings: null,
            sidepots: null
        };
        seats.push(seat);

        if (playerSeat === buttonSeat) {
            seatsBeforeButton = seats.length - 1;
        }
        line++;
    }

    for (var i = 0; i < seats.length; i++) {
        if (i <= seatsBeforeButton) {
            seats[i].position = seats.length - seatsBeforeButton + i;
        } else {
            seats[i].position = i - seatsBeforeButton;
        }
    }
    var endOfPlayerIndex = line;

    while (!lines[line].match(reLib.summary) && !lines[line].match(reLib.showDown)) {
        line++;
    }
    var endOfActionIndex = line;
    var handEndedInShowDown = lines[endOfActionIndex].match(reLib.showDown);
    
    if (!handEndedInShowDown) {
        while(line < lines.length) {
            if (lines[line].match(reLib.potWinnings)) {
                var winnersArray = lines[line].match(reLib.potWinnings);
                var winner = winnersArray[1];
                var winnings = winnersArray[2];
                addWinnings(seats, winner, winnings, false);
            }
            line++;
        }
    } else {
        while (lines[line].match(reLib.summary) == null) {
            if (lines[line].match(reLib.showDownPotWinnings)) {
                var winnersArray = lines[line].match(reLib.showDownPotWinnings);
                var winner = winnersArray[1];
                var winnings = winnersArray[2];
                addWinnings(seats, winner, winnings, false);
            } else if (lines[line].match(reLib.showDownSidepotWinningsRE)) {
                var sideWinnersArray = lines[line].match(reLib.showDownSidepotWinnings);
                var sideWinner = winnersArray[1];
                var sideWinnings = winnersArray[2];
                addWinnings(seats, sideWinner, sideWinnings, true);
            } else if (lines[line].match(reLib.opponentsHoleCards)) {
                var opponentsHoleCards = {};
                var match = lines[line].match(reLib.opponentsHoleCards);
                opponentsHoleCards.name = match[1];
                opponentsHoleCards.card1 = match[2];
                opponentsHoleCards.card2 = match[3];
                holeCardsArray.push(opponentsHoleCards);
            }
            line++;
        }
    }

    //console.log(seats);

    //Parse Actions
    var actions = [];
    var round = "preflop";
    var currentBetSize = parseInt(hand.bigBlindAmount); // radix missing
    for (var i = endOfPlayerIndex; i < endOfActionIndex; i++) {
        var action = {};
        if (lines[i].match(reLib.postAnte)) {
            match = lines[i].match(reLib.postAnte);
            var name = match[1];
            var amount = parseInt(match[2]);
            action = createAction(hand.number, name, round, "post ante", amount, null);
            actions.push(action);
        } else if (lines[i].match(reLib.postBlind)) {
            match = lines[i].match(reLib.postBlind);
            var name = match[1];
            var amount = parseInt(match[2]);
            action = createAction(hand.number, name, round, "post blind", amount, null);
            actions.push(action);
        } else if (lines[i].match(reLib.fold)) {
            match = lines[i].match(reLib.fold);
            var name = match[1];
            action = createAction(hand.number, name, round, "fold", null, currentBetSize);
            actions.push(action);
        } else if (lines[i].match(reLib.call)) {
            match = lines[i].match(reLib.call);
            var name = match[1];
            var amount = parseInt(match[2]);
            action = createAction(hand.number, name, round, "call", amount, currentBetSize);
            actions.push(action);
        } else if (lines[i].match(reLib.bet)) {
            match = lines[i].match(reLib.bet);
            var name = match[1];
            var betSize = parseInt(match[2]);
            action = createAction(hand.number, name, round, "bet", betSize, currentBetSize);
            actions.push(action);
            currentBetSize = betSize;
        } else if (lines[i].match(reLib.raise)) {
            match = lines[i].match(reLib.raise);
            var name = match[1];
            var raiseAmount = parseInt(match[2]);
            action = createAction(hand.number, name, round, "raise", raiseAmount, currentBetSize);
            actions.push(action);
            currentBetSize += raiseAmount;
        } else if (lines[i].match(reLib.raiseAllIn)) {
            match = lines[i].match(reLib.raiseAllIn);
            var name = match[1];
            var raiseAmount = parseInt(match[2]);
            action = createAction(hand.number, name, round, "raise all-in", raiseAmount, currentBetSize);
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

    return {
        hand: hand,
        seats: seats,
        board: board,
        holeCards: holeCardsArray,
        actions: actions
    };
}

module.exports = function(data) {
    // this is where you parse the data
    var hands = data.split("\n\n\n\n");
    var handNumber = 89;

    //hand 41 first showdown in HH20150815 T1292680929 No Limit Hold'em $10 + $1.txt
    //hand 89 first showdown with 2 players showing, same file
    var hand = parse_hand(hands[handNumber]);

    console.log(hands[handNumber]);

    //console.log(actions);

    console.log(hand.hand);
    console.log(hand.seats);
    console.log(hand.board);
    console.log(hand.holeCards);
    console.log(hand.actions);
    return hand;
};

module.exports.addWinnings = addWinnings;
module.exports.parse_hand = parse_hand;
