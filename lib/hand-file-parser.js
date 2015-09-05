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
    if (!isInt(amount)) {
        //throw error
    }
    if (!isInt(currentBetSize)) {
        //throw error
    }
    action = {handNumber: handNumber, name: name, round: round, type: type, amount: amount, currentBetSize: currentBetSize};
    return action;
}

//from stack-overflow
function isInt(value) {
    return !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10));
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

    var handNumberRE = /PokerStars Hand #(\d*)/;
    var handTimeStampRE = /(\d{4}\/\d{2}\/\d{2} \d{2}\:\d{2}\:\d{2} ET)/;
    var handTournamentNumberRE = /Tournament #(\d*)/;
    var handSmallBlindAmountRE = /\((\d+)\/\d+\)/;
    var handBigBlindAmountRE = /\(\d+\/(\d+)\)/;
    hand.number = data.match(handNumberRE)[1];
    hand.timeStamp = data.match(handTimeStampRE)[1];
    hand.tournament = data.match(handTournamentNumberRE)[1];
    hand.smallBlindAmount = parseInt(data.match(handSmallBlindAmountRE)[1], 10);
    hand.bigBlindAmount = parseInt(data.match(handBigBlindAmountRE)[1], 10);

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
    
    var flopRE = /\** FLOP \** \[(.{2}) (.{2}) (.{2})\]/;
    var turnRE = /\** TURN \** \[.{8}\] \[(.{2})\]/;
    var riverRE = /\** RIVER \** \[.{11}\] \[(.{2})\]/;
    if (data.match(flopRE)){
        board.flop1 = data.match(flopRE)[1];
        board.flop2 = data.match(flopRE)[2];
        board.flop3 = data.match(flopRE)[3];
    }
    if (data.match(turnRE)) {
        board.turn = data.match(turnRE)[1];
    }
    if (data.match(riverRE)) {
        board.river = data.match(riverRE)[1];
    }
    //console.log(board);

    //Parse Players Hole Cards
    var holeCardsArray = [];
    var yourHoleCards = {};
    var yourHoleCardsRE = /Dealt to (.+) \[(.{2}) (.{2})]/;
    var match = data.match(yourHoleCardsRE);
    yourHoleCards.name = match[1];
    yourHoleCards.card1 = match[2];
    yourHoleCards.card2 = match[3];
    holeCardsArray.push(yourHoleCards);

    
    
    //console.log(holeCardsArray);

    //Parse Players' Information
    var seats = [];
    var buttonPositionRE = /Seat #(\d) is the button/;
    var buttonSeat = parseInt(data.match(buttonPositionRE)[1]);
    var seatsBeforeButton;
;
    var lines = data.split("\n");
    
    var line = 2;
    var seatRE = /Seat (\d):/;
    var chipsRE = /\((\d*) in chips\)/;
    var nameRE = /Seat \d: (.*) \(\d* in chips\)/;
    while (lines[line].match(/Seat \d: .* \(\d* in chips\)/)) {
        var name = lines[line].match(nameRE)[1];
        var chips = lines[line].match(chipsRE)[1];
        var playerSeat = parseInt(lines[line].match(seatRE)[1]);
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

    var summaryRE = /\*+ SUMMARY \*+/;
    var showDownRE = /\*+ SHOW DOWN \*+/;
    while (!lines[line].match(summaryRE) && !lines[line].match(showDownRE)) {
        line++;
    }
    var endOfActionIndex = line;
    var handEndedInShowDown = lines[endOfActionIndex].match(showDownRE);
    
    if (!handEndedInShowDown) {
        var potWinningsRE = /Seat \d: (.*) (?:\(button\) |\(small blind\) |\(big blind\) )collected \((\d*)\)/;
        while(line < lines.length) {
            if (lines[line].match(potWinningsRE)) {
                var winnersArray = lines[line].match(potWinningsRE);
                var winner = winnersArray[1];
                var winnings = winnersArray[2];
                addWinnings(seats, winner, winnings, false);
            }
            line++;
        }
    } else {
        var potWinningsRE = /(.*) collected (\d*) from (?:main)?pot/;
        var sidepotWinningsRE = /(.*) collected (\d*) from side pot/;
        var opponentsHoleCardsRE = /(.+): shows \[(.{2}) (.{2})\]/;
        while (lines[line].match(summaryRE) == null) {
            if (lines[line].match(potWinningsRE)) {
                var winnersArray = lines[line].match(potWinningsRE);
                var winner = winnersArray[1];
                var winnings = winnersArray[2];
                addWinnings(seats, winner, winnings, false);
            } else if (lines[line].match(sidepotWinningsRE)) {
                var sideWinnersArray = lines[line].match(sidepotWinningsRE);
                var sideWinner = winnersArray[1];
                var sideWinnings = winnersArray[2];
                addWinnings(seats, sideWinner, sideWinnings, true);
            } else if (lines[line].match(opponentsHoleCardsRE)) {
                var opponentsHoleCards = {};
                var match = lines[line].match(opponentsHoleCardsRE);
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
    var postAnteRE = /(.+): posts the ante (\d+)/;
    var postBlindRE = /(.+): posts (?:small blind|big blind) (\d+)/;
    var foldRE = /(.+): folds/;
    var betRE = /(.+): bets (\d+)/;
    var callRE = /(.+): calls (\d+)/;
    var raiseRE = /(.+): raises (\d+) to \d+ (?!(?:and is all-in))/;
    var raiseAllInRE = /(.+): raises (\d+) to \d+ and is all-in/;
    var round = "preflop";
    var currentBetSize = parseInt(hand.bigBlindAmount);
    for (var i = endOfPlayerIndex; i < endOfActionIndex; i++) {
        var action = {};
        if (lines[i].match(postAnteRE)) {
            match = lines[i].match(postAnteRE);
            var name = match[1];
            var amount = parseInt(match[2]);
            action = createAction(hand.number, name, round, "post ante", amount, null);
            actions.push(action);
        } else if (lines[i].match(postBlindRE)) {
            match = lines[i].match(postBlindRE);
            var name = match[1];
            var amount = parseInt(match[2]);
            action = createAction(hand.number, name, round, "post blind", amount, null);
            actions.push(action);
        } else if (lines[i].match(foldRE)) {
            match = lines[i].match(foldRE);
            var name = match[1];
            action = createAction(hand.number, name, round, "fold", null, currentBetSize);
            actions.push(action);
        } else if (lines[i].match(callRE)) {
            match = lines[i].match(callRE);
            var name = match[1];
            var amount = parseInt(match[2]);
            action = createAction(hand.number, name, round, "call", amount, currentBetSize);
            actions.push(action);
        } else if (lines[i].match(betRE)) {
            match = lines[i].match(betRE);
            var name = match[1];
            var betSize = parseInt(match[2]);
            action = createAction(hand.number, name, round, "bet", betSize, currentBetSize);
            actions.push(action);
            currentBetSize = betSize;
        } else if (lines[i].match(raiseRE)) {
            match = lines[i].match(raiseRE);
            var name = match[1];
            var raiseAmount = parseInt(match[2]);
            action = createAction(hand.number, name, round, "raise", raiseAmount, currentBetSize);
            actions.push(action);
            currentBetSize += raiseAmount;
        } else if (lines[i].match(raiseAllInRE)) {
            match = lines[i].match(raiseAllInRE);
            var name = match[1];
            var raiseAmount = parseInt(match[2]);
            action = createAction(hand.number, name, round, "raise all-in", raiseAmount, currentBetSize);
            actions.push(action);
            currentBetSize += raiseAmount;
        } else if (lines[i].match(flopRE)) {
            round = "flop";
        } else if (lines[i].match(turnRE)) {
            round = "turn";
        } else if (lines[i].match(riverRE)) {
            round = "river";
        }
    }
}

module.exports = function(data) {
    // this is where you parse the data
    var hands = data.split("\n\n\n\n");
    var handNumber = 89;

    //hand 41 first showdown in HH20150815 T1292680929 No Limit Hold'em $10 + $1.txt
    //hand 89 first showdown with 2 players showing, same file
    parse_hand(hands[handNumber]);
    

    console.log(hands[handNumber]);


    //console.log(actions);

    console.log(hand);
    console.log(seats);
    console.log(board);
    console.log(holeCardsArray);
    console.log(actions);
};

module.exports.addWinnings = addWinnings;
