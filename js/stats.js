const gameHistory = JSON.parse(localStorage.getItem('gameHistory')) || [];
const historyTable = document.querySelector('#historyTable tbody');

gameHistory
    .sort((a, b) => b.timestamp - a.timestamp)
    .forEach(game => {
        if (game.lvl1Points === '-' && game.lvl2Points === '-' && game.lvl3Points === '-') return;                
        historyTable.innerHTML += `
            <tr>
                <td>${game.playerName}</td>
                <td>${game.lvl1Points}</td>
                <td>${game.lvl2Points}</td>
                <td>${game.lvl3Points}</td>
                <td>${game.totalPoints}</td>
            </tr>
        `;
    });

const leaderboard = {};
gameHistory.forEach(game => {
    if (game.lvl1Points === '-' && game.lvl2Points === '-' && game.lvl3Points === '-') return; 

    if (!leaderboard[game.playerName]) {
        leaderboard[game.playerName] = {points: 0, games: 0};
    }
    leaderboard[game.playerName].points += game.totalPoints;
    leaderboard[game.playerName].games += 1;
});

const leaderboardTable = document.querySelector('#leaderboardTable tbody');
Object.entries(leaderboard)
    .sort(([, a], [, b]) => b.points - a.points)
    .forEach(([name, payload], index) => {
        leaderboardTable.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${name}</td>
                <td>${payload.games}</td>
                <td>${payload.points}</td>
            </tr>
        `;
    });