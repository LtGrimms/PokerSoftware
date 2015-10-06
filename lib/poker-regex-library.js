var reLib = {
    handNumber : /PokerStars Hand #(\d*)/,
    handTimeStamp : /(\d{4}\/\d{2}\/\d{2} \d{2}\:\d{2}\:\d{2}) ET/,
    handTournamentNumber : /Tournament #(\d*)/,
    handSmallBlindAmount : /\((\d+)\/\d+\)/,
    handBigBlindAmount : /\(\d+\/(\d+)\)/,

    flop : /\** FLOP \** \[(.{2}) (.{2}) (.{2})\]/,
    turn : /\** TURN \** \[.{8}\] \[(.{2})\]/,
    river : /\** RIVER \** \[.{11}\] \[(.{2})\]/,

    yourHoleCards : /Dealt to (.+) \[(.{2}) (.{2})\]/,

    buttonPosition : /Seat #(\d) is the button/,

    playerInformation : /Seat \d: .* \(\d* in chips\)/,
    seat : /Seat (\d):/,
    chips : /\((\d*) in chips\)/,
    name : /Seat \d: (.*) \(\d* in chips\)/,

    summary : /\*+ SUMMARY \*+/,
    showDown : /\*+ SHOW DOWN \*+/,

    potWinnings1 : /Seat \d: (.*) (?:\(small blind\) |\(big blind\) |\(button\) )collected \((\d*)\)/,
    potWinnings2 : /Seat \d: (.*) collected \((\d*)\)/,
    showDownPotWinnings : /(.*) collected (\d*) from (?:main )?pot/,
    showDownSidePotWinnings : /(.*) collected \((\d*)\) from side pot/,
    opponentsHoleCards : /(.+): shows \[(.{2}) (.{2})\]/,
    opponentsMuckedCards1 : /Seat \d: (.+) (?:\(button\) |\(small blind\) |\(big blind\) )mucked \[(.{2}) (.{2})\]/,
    opponentsMuckedCards2 : /Seat \d: (.+) mucked \[(.{2}) (.{2})\]/,
    
    postAnte : /(.+): posts the ante (\d+)/,
    postBlind : /(.+): posts (?:small blind|big blind) (\d+)/,
    fold : /(.+): folds/,
    check : /(.+): checks/,
    bet : /(.+): bets (\d+)(?!(?:.+))/,
    betAllIn : /(.+): bets (\d+) and is all-in/,
    call : /(.+): calls (\d+)/,
    raise : /(.+): raises (\d+) to (\d+)(?!(?:.+))/,
    raiseAllIn : /(.+): raises (\d+) to (\d+) and is all-in/
};
module.exports = reLib;

module.exports.actionLib = [
    {
        regEx: reLib.postAnte,
        type: 'postAnte'
    }, {
        regEx: reLib.postBlind,
        type: 'postBlind'
    }, {
        regEx: reLib.fold,
        type: 'fold'
    }, {
        regEx: reLib.check,
        type: 'check'
    }, {
        regEx: reLib.bet,
        type: 'bet'
    }, {
        regEx: reLib.betAllIn,
        type: 'betAllIn'
    }, {
        regEx: reLib.call,
        type: 'call'
    }, {
        regEx: reLib.raise,
        type: 'raise'
    }, {
        regEx: reLib.raiseAllIn,
        type: 'raiseAllIn'
    }
];

//module.exports.actionLib = {
//    postAnte: reLib.postAnte,
//    postBlind: reLib.postBlind,
//    fold: reLib.fold
//};

//for (var type in actionLib) {
//    if (type === "postAnte") {
//        var regex = actionLib[type];
//    }
//}
