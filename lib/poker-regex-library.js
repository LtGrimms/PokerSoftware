module.exports = {
    handNumber : /PokerStars Hand #(\d*)/,
    handTimeStamp : /(\d{4}\/\d{2}\/\d{2} \d{2}\:\d{2}\:\d{2} ET)/,
    handTournamentNumber : /Tournament #(\d*)/,
    handSmallBlindAmount : /\((\d+)\/\d+\)/,
    handBigBlindAmount : /\(\d+\/(\d+)\)/,
    
    flop : /\** FLOP \** \[(.{2}) (.{2}) (.{2})\]/,
    turn : /\** TURN \** \[.{8}\] \[(.{2})\]/,
    river : /\** RIVER \** \[.{11}\] \[(.{2})\]/,

    yourHoleCards : /Dealt to (.+) \[(.{2}) (.{2})]/,

    buttonPosition : /Seat #(\d) is the button/,

    playerInformation : /Seat \d: .* \(\d* in chips\)/,
    seat : /Seat (\d):/,
    chips : /\((\d*) in chips\)/,
    name : /Seat \d: (.*) \(\d* in chips\)/,

    summary : /\*+ SUMMARY \*+/,
    showDown : /\*+ SHOW DOWN \*+/,

    potWinnings : /Seat \d: (.*) (?:\(button\) |\(small blind\) |\(big blind\) )collected \((\d*)\)/,

    showDownPotWinningsRE : /(.*) collected (\d*) from (?:main)?pot/,
    showDownSidepotWinningsRE : /(.*) collected (\d*) from side pot/,
    opponentsHoleCardsRE : /(.+): shows \[(.{2}) (.{2})\]/,

    postAnte : /(.+): posts the ante (\d+)/,
    postBlind : /(.+): posts (?:small blind|big blind) (\d+)/,
    fold : /(.+): folds/,
    bet : /(.+): bets (\d+)(?!(?: and is all-in))/,
    betAllIn : /(.+): bets (\d+) and is all-in/,
    call : /(.+): calls (\d+)/,
    raise : /(.+): raises (\d+) to \d+(?!(?: and is all-in))/,
    raiseAllIn : /(.+): raises (\d+) to \d+ and is all-in/,

};
