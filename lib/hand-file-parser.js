var reLib = require('./poker-regex-library');

var playerInformationStart = 2;

function hand(data) {
    this.data = data;
    this.handInfo = {
        number: null,
        timestamp: null,
        tournament: null,
        ante: null,
        smallBlind: null,
        bigBlind: null,
        numberOfPlayers: null
    };
    this.actions = [];
    this.seats = [];
    this.board = {
        handNumber: null,
        flop1: null,
        flop2:null,
        flop3: null,
        turn: null,
        river: null
    };
    this.holeCards = [];
    this.hasShowDown = false;

    if (data) {
        this.parseHand();
    }
}

hand.prototype.addWinnings = function(winner, winnings, sidepot) {
    for (var i = 0; i < this.seats.length; i++) {
        if (this.seats[i].name.localeCompare(winner) === 0) {
            if (!sidepot) {
                this.seats[i].winnings = winnings;
            } else {
                this.seats[i].sidepot += winnings;
            }
        }
    }
};

hand.prototype.addWinningsSidepot = function(winner, winnings) {
    this.addWinnings(winner, winnings, true);
};

hand.prototype.addWinningsNoSidepot = function(winner, winnings) {
    this.addWinnings(winner, winnings, false);
};

function createAction(handNumber, name, round, type, amount, currentBetSize, actionNumber) {
    // throw errors here like if amount and/or current bet size are not ints
    if (!isPosInt(handNumber)) {
        throw new Error("handNumber should be a positive integer");
    }
    if (typeof name !== 'string') {
        throw new Error("name must be a string");
    }
    if (amount && !isPosInt(amount)) {
        throw new Error("tried to create action with non-integer bet/raise amount " + amount);
    }
    if (!isPosInt(currentBetSize)) {
        throw new Error("tried to create action with non-integer current bet amount");
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

hand.prototype.parseHandTable = function() {
    var handNumber = this.data.match(reLib.handNumber);
    var timeStamp = this.data.match(reLib.handTimeStamp);
    var tournament = this.data.match(reLib.handTournamentNumber);
    var smallBlind = this.data.match(reLib.handSmallBlindAmount);
    var bigBlind = this.data.match(reLib.handBigBlindAmount);

    if (!handNumber) {
        throw new Error("cound not find hand number");
    }
    if (!timeStamp) {
        throw new Error("cound not find timestamp");
    }
    if (!smallBlind) {
        throw new Error("could not find smallBlind");
    }
    if (!bigBlind) {
        throw new Error("cound not find bigBlind");
    }

    this.handInfo.number = handNumber[1];
    this.handInfo.timestamp = new Date(timeStamp[1]);
    this.handInfo.tournament = tournament ? tournament[1] : null;
    this.handInfo.ante = null;
    this.handInfo.smallBlind = parseInt(smallBlind[1], 10);
    this.handInfo.bigBlind = parseInt(bigBlind[1], 10);

    // Correct for eastern time
    this.handInfo.timestamp.setHours(this.handInfo.timestamp.getHours() - 2);

    var ante = this.data.match(reLib.postAnte);
    if (ante) {
        this.handInfo.ante = ante;
    }
};

hand.prototype.parseBoardTable = function() {
    this.board.handNumber = this.handInfo.number;

    if (this.data.match(reLib.flop)){
        this.board.flop1 = this.data.match(reLib.flop)[1];
        this.board.flop2 = this.data.match(reLib.flop)[2];
        this.board.flop3 = this.data.match(reLib.flop)[3];
    }
    if (this.data.match(reLib.turn)) {
        this.board.turn = this.data.match(reLib.turn)[1];
    }
    if (this.data.match(reLib.river)) {
        this.board.river = this.data.match(reLib.river)[1];
    }
};

hand.prototype.parseOpponentHoleCards = function(endOfActionIndex) {
    var lines = this.data.split("\n");
    for (var line = endOfActionIndex; line < lines.length; line++) {
        var match = lines[line].match(reLib.opponentsHoleCards);
        if (match) {
            var opponentsHoleCards = {};
            opponentsHoleCards.handNumber = this.handInfo.number;
            opponentsHoleCards.name = match[1];
            opponentsHoleCards.card1 = match[2];
            opponentsHoleCards.card2 = match[3];
            this.holeCards.push(opponentsHoleCards);
        }
    }
};

hand.prototype.parsePlayersHoleCards = function(endOfActionIndex) {
    var yourHoleCards = {};
    var match = this.data.match(reLib.yourHoleCards);
    if (!match) {
        throw new Error("could not find your hole cards");
    }

    yourHoleCards.handNumber = this.handInfo.number;
    yourHoleCards.name = match[1];
    yourHoleCards.card1 = match[2];
    yourHoleCards.card2 = match[3];
    this.holeCards.push(yourHoleCards);

    if (this.hasShowDown) {
        this.parseOpponentHoleCards(endOfActionIndex);
    }
};

hand.prototype.setSeatPosition = function(seatsBeforeButton) {
    for (var i = 0; i < this.seats.length; i++) {
        if (i <= seatsBeforeButton) {
            this.seats[i].position = this.seats.length - seatsBeforeButton + i;
        } else {
            this.seats[i].position = i - seatsBeforeButton;
        }
    }
};

hand.prototype.parseWinnings = function(lines, endOfPlayerIndex, endOfActionIndex) {
    for (var line = endOfActionIndex; line < lines.length; line++) {
        var pot_winnings_match = lines[line].match(reLib.potWinnings);
        var show_down_pot_match = lines[line].match(reLib.showDownPotWinnings);
        var show_down_sidepot_match = lines[line].match(reLib.showDownSidepotWinnings);

        if (pot_winnings_match) {
            this.addWinningsNoSidepot(pot_winnings_match[1], pot_winnings_match[2]);
        } else if (show_down_pot_match) {
            this.addWinningsNoSidepot(show_down_pot_match[1], show_down_pot_match[2]);
        } else if (show_down_sidepot_match) {
            this.addWinningsSidepot(show_down_sidepot_match[1], show_down_sidepot_match[2]);
        }
    }
};

hand.prototype.parsePlayersInformation = function(lines, endOfPlayerIndex, endOfActionIndex) {
    var findButtonSeat = lines[1].match(reLib.buttonPosition);
    if (!findButtonSeat) {
        throw new Error("could not find the button seat");
    }

    var buttonSeat = parseInt(lines[1].match(findButtonSeat), 10);

    var seatsBeforeButton;
    for (var i = playerInformationStart; i < endOfPlayerIndex; i++) {
        var name = lines[i].match(reLib.name)[1];
        var chips = lines[i].match(reLib.chips)[1];
        var playerSeat = parseInt(lines[i].match(reLib.seat)[1], 10);
        var seat = {
            handNumber: this.handInfo.number,
            name: name,
            chips: chips,
            winnings: 0,
            sidepot: 0
        };

        if (playerSeat === buttonSeat) {
            seatsBeforeButton = this.seats.length;
        }
        this.seats.push(seat);
    }

    this.setSeatsPosition(seatsBeforeButton);
    this.parseWinnings(lines, endOfPlayerIndex, endOfActionIndex);
};

function actionPrep(regEx, line, type, handNumber, round, currentBetSize, actionNumber) {
    var match = line.match(regEx);
    var name = match[1];
    var amount = null;
    if (match.length === 3) {
        amount = match[2];
    }

    var action = createAction(handNumber, name, round, type, parseInt(amount, 10), currentBetSize, actionNumber);
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
            currentBetSize = parseInt(action.currentBetSize, 10);
        } else if (lines[i].match(reLib.betAllIn)) {
            action = actionPrep(reLib.betAllIn, lines[i], "bet all-in", handNumber, round, currentBetSize, actionNumber);
            actionNumber++;
            actions.push(action);
            currentBetSize = parseInt(action.currentBetSize, 10);
        } else if (lines[i].match(reLib.raise)) {
            action = actionPrep(reLib.raise, lines[i], "raise", handNumber, round, currentBetSize, actionNumber);
            actionNumber++;
            actions.push(action);
            currentBetSize += parseInt(action.amount, 10);
        } else if (lines[i].match(reLib.raiseAllIn)) {
            action = actionPrep(reLib.raiseAllIn, lines[i], "raise all-in", handNumber, round, currentBetSize, actionNumber);
            actionNumber++;
            actions.push(action);
            currentBetSize += parseInt(action.amount, 10);
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

hand.prototype.parseHand = function() {
    var lines = this.data.split("\n");
    var line = 0;
    this.handInfo.numberOfPlayers = 0;

    // Increase line until we get to the first player
    while (!lines[line].match(reLib.playerInformation)) {
        line++;
    }

    if (line != playerInformationStart) {
        throw new Error("Player information started on unexpected line, perhaps PokerStars has changed thier output format");
    }

    while (lines[line].match(reLib.playerInformation)) {
        line++;
        this.handInfo.numberOfPlayers++;
    }
    var endOfPlayerIndex = line;

    while (!lines[line].match(reLib.summary) && !lines[line].match(reLib.showDown)) {
        line++;
    }
    var endOfActionIndex = line;
    this.hasShowDown = (!lines[endOfActionIndex].match(reLib.showDown));

    this.parseHandTable();
    this.parseBoardTable();
    this.parsePlayersHoleCards(endOfActionIndex);
    this.parsePlayersInformation(lines, endOfPlayerIndex, endOfActionIndex);
    var actions = parseActions(lines, endOfPlayerIndex, endOfActionIndex, parseInt(this.handInfo.number, 10), this.handInfo.bigBlind);

    return {
        hand: this.handInfo,
        seats: seats,
        board: this.board,
        holeCards: this.holeCards,
        actions: actions
    };
};

module.exports = function(data) {
    var hand;
    try {
        hand = new hand(data);
    } catch (err) {
        console.error(err.message);
        console.error(err.stack);
        console.error("data: ");
        console.error(data);
        throw err;
    }

    // console.log(hands[handNumber]);

    // console.log(actions);

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

module.exports.isPosInt = isPosInt;
module.exports.createAction = createAction;
module.exports.parseActions = parseActions;
module.exports.hand = hand;
