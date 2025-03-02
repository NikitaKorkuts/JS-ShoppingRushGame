function initializeGame (name) {
    const newGame = {
        gameId: Date.now(),
        playerName: name,
        lvl1Points: '-',
        lvl2Points: '-',
        lvl3Points: '-',
        totalPoints: 0,
        timestamp: Date.now()
    };

    const gameHistory = JSON.parse(localStorage.getItem('gameHistory')) || [];
    gameHistory.push(newGame);
    localStorage.setItem('gameHistory', JSON.stringify(gameHistory));

    sessionStorage.setItem('currentGameId', newGame.gameId);
}

function saveLevelResults(levelNumber, points) {
    const gameId = sessionStorage.getItem('currentGameId');
    const gameHistory = JSON.parse(localStorage.getItem('gameHistory')) || [];
    const gameIndex = gameHistory.findIndex(game => game.gameId == gameId);
    
    if (gameIndex !== -1) {
        gameHistory[gameIndex][`lvl${levelNumber}Points`] = points;
        gameHistory[gameIndex].totalPoints = Object.values(gameHistory[gameIndex])
            .slice(2, 5)
            .filter(item => item !== "-")
            .reduce((a, b) => a + b, 0);
        
        localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
    }
}