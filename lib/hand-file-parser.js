var reLib = require('./poker-regex-library');
var errorLib = require('./poker-error-library');

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

function action() {
    this.handNumber = null;
    this.name = null;
    this.round = null;
    this.type = null;
    this.amount = null;
    this.currentBetSize = null;
    this.currentPotSize = null;
    this.actionNumber = null;
}

hand.prototype.addWinnings = function(winner, winnings, sidepot) {
    var foundWinner = false;
    for (var i = 0; i < this.seats.length; i++) {
        if (this.seats[i].name.localeCompare(winner) === 0) {
            if (!sidepot) {
                this.seats[i].winnings = winnings;
                foundWinner = true;
            } else {
                this.seats[i].sidepot += winnings;
                foundWinner = true;
            }
        }
    }
    if (!foundWinner) {
        throw new Error(errorLib.addWinningsNoWinnerFound);
    }
};

hand.prototype.addWinningsSidepot = function(winner, winnings) {
    this.addWinnings(winner, winnings, true);
};

hand.prototype.addWinningsNoSidepot = function(winner, winnings) {
    this.addWinnings(winner, winnings, false);
};

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
        var matchShow = lines[line].match(reLib.opponentsHoleCards);
        var matchMuck = lines[line].match(reLib.opponentsMuckedCards);
        if (matchShow) {
            var opponentsHoleCards = {};
            opponentsHoleCards.handNumber = this.handInfo.number;
            opponentsHoleCards.name = matchShow[1];
            opponentsHoleCards.card1 = matchShow[2];
            opponentsHoleCards.card2 = matchShow[3];
            this.holeCards.push(opponentsHoleCards);
        }  else if (matchMuck) {
            var opponentsMuckedHoleCards = {};
            opponentsMuckedHoleCards.handNumber = this.handInfo.number;
            opponentsMuckedHoleCards.name = matchMuck[1];
            opponentsMuckedHoleCards.card1 = matchMuck[2];
            opponentsMuckedHoleCards.card2 = matchMuck[3];
            this.holeCards.push(opponentsMuckedHoleCards);
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
    } else if (this.data.match(reLib.showDown)) {
        this.parseOpponentHoleCards(endOfActionIndex);
        console.log("showdown variable was not properly set for this hand before parsing hole cards");
    }
};

hand.prototype.setSeatsPosition = function(seatsBeforeButton) {
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
        var pot_match = lines[line].match(reLib.showDownPotWinnings);
        var sidepot_match = lines[line].match(reLib.showDownSidepotWinnings);
        
        if (pot_match) {
            this.addWinningsNoSidepot(pot_match[1], parseInt(pot_match[2], 10));
        } else if (sidepot_match) {
            this.addWinningsSidepot(sidepot_match[1], parseInt(sidepot_match[2], 10));
        }
    }
};

hand.prototype.parsePlayersInformation = function(lines, endOfPlayerIndex, endOfActionIndex) {
    var findButtonSeat = lines[1].match(reLib.buttonPosition);
    if (!findButtonSeat) {
        throw new Error("could not find the button seat");
    }

    var buttonSeat = parseInt(findButtonSeat[1], 10);

    var seatsBeforeButton;
    for (var i = playerInformationStart; i < endOfPlayerIndex; i++) {
        var name = lines[i].match(reLib.name)[1];
        var chips = parseInt(lines[i].match(reLib.chips)[1], 10);
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

function determineActionAmount(actionTypeObject, line) {
    if (actionTypeObject.type.localeCompare('check') === 0 ||
        actionTypeObject.type.localeCompare('fold') === 0) {
        return 0;
    } else {
        return parseInt(line.match(actionTypeObject.regEx)[2], 10);
    }
}

function determineCurrentBet(line, oldCurrentBet) {
    var newCurrentBet = oldCurrentBet;
    var extra;
    reLib.actionLib.forEach(function(actionTypeObject) {
        if (line.match(actionTypeObject.regEx)) {
            if (!actionTypeObject.type.localeCompare('postBlind')) {
                newCurrentBet = parseInt(line.match(actionTypeObject.regEx)[2], 10);
            } else if (
                !actionTypeObject.type.localeCompare('bet') ||
                !actionTypeObject.type.localeCompare('betAllIn') ||
                !actionTypeObject.type.localeCompare('raise') ||
                !actionTypeObject.type.localeCompare('raiseAllIn')) {
                extra = parseInt(line.match(actionTypeObject.regEx)[2], 10);
                newCurrentBet = oldCurrentBet + extra;
            }
        }
    });
    return newCurrentBet;
}

action.prototype.createAction = function(line) {
    reLib.actionLib.forEach(function(actionTypeObject) {
        if (line.match(actionTypeObject.regEx)) {
            var match = line.match(actionTypeObject.regEx);
            this.type = actionTypeObject.type;
            this.name = match[1];
            this.amount = determineActionAmount(actionTypeObject, line);
        }
    }.bind(this));
};

function determineCurrentPot(line, oldCurrentPotSize) {
    var newCurrentPotSize = oldCurrentPotSize;
    reLib.actionLib.forEach(function(actionTypeObject) {
        if (line.match(actionTypeObject.regEx)) {
            if (!actionTypeObject.type.localeCompare('bet') ||
                !actionTypeObject.type.localeCompare('betAllIn') ||
                !actionTypeObject.type.localeCompare('call') ||
                !actionTypeObject.type.localeCompare('postBlind') ||
                !actionTypeObject.type.localeCompare('postAnte')) {
                newCurrentPotSize += parseInt(line.match(actionTypeObject.regEx)[2], 10);   
            } else if (!actionTypeObject.type.localeCompare('raise') ||
                       !actionTypeObject.type.localeCompare('raiseAllIn')) {
                var match = line.match(actionTypeObject.regEx);
                newCurrentPotSize += parseInt(match[3], 10);
            }
        }
        return newCurrentPotSize;
    });

    return newCurrentPotSize;
}

hand.prototype.parseActions = function(lines, endOfPlayerIndex, endOfActionIndex) {
    var round = "preflop";
    var actionNumber = 1;
    var currentBetSize = 0;
    var currentPotSize = 0;
    for (var line = endOfPlayerIndex; line < endOfActionIndex; line++) {
        //console.log("current bet is " + currentBetSize);
        if (lines[line].match(reLib.flop)) {
            round = "flop";
            actionNumber = 1;
            currentBetSize = 0;
        } else if (lines[line].match(reLib.turn)) {
            round = "turn";
            actionNumber = 1;
            currentBetSize = 0;
        } else if (lines[line].match(reLib.river)) {
            round = "river";
            actionNumber = 1;
            currentBetSize = 0;
        } else {
            var currentAction = new action();
            currentAction.createAction(lines[line]);
            if (currentAction.type) {
                currentAction.handNumber = this.handInfo.number;
                currentAction.currentBetSize = currentBetSize;
                currentAction.round = round;
                currentAction.actionNumber = actionNumber++;
                currentAction.currentPotSize = currentPotSize;
                this.actions.push(currentAction);
                
                currentBetSize = determineCurrentBet(lines[line], currentBetSize);
                currentPotSize = determineCurrentPot(lines[line], currentPotSize);
            }
        }
    }
};

hand.prototype.parseHand = function() {
    var lines = this.data.split("\n");
    var line = 0;
    this.handInfo.numberOfPlayers = 0;

    // Increase line until we get to the first player
    while (!lines[line].match(reLib.playerInformation)) {
        line++;
    }

    if (line != playerInformationStart) {
        throw new Error(errorLib.unexpectedPlayerInformationStartLine);
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
    this.hasShowDown = (lines[endOfActionIndex].match(reLib.showDown) != null);

    this.parseHandTable();
    this.parseBoardTable();
    this.parsePlayersHoleCards(endOfActionIndex);
    this.parsePlayersInformation(lines, endOfPlayerIndex, endOfActionIndex);
    this.parseActions(lines, endOfPlayerIndex, endOfActionIndex);

    return {
        hand: this.handInfo,
        seats: this.seats,
        board: this.board,
        holeCards: this.holeCards,
        actions: this.actions
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
    return hand;
};

module.exports.isPosInt = isPosInt;
module.exports.hand = hand;
module.exports.action = action;
module.exports.determineCurrentBet = determineCurrentBet;
module.exports.determineActionAmount = determineActionAmount;
module.exports.determineCurrentPot = determineCurrentPot;
