const playerNameInput = document.getElementById('playerName');
const lvlChoise = document.getElementById('lvlChoise').children;
const errorMessage = document.querySelector('.error-message');

playerNameInput.addEventListener('input', function() {
    if (this.value.trim().length < 3) {
        this.classList.add('invalid');
        errorMessage.style.display = 'block';
    } else {
        this.classList.remove('invalid');
        errorMessage.style.display = 'none';
    }
});

document.querySelector('.playBtn').addEventListener('click', (e) => handlePlayBtnClick(e, 'level1.html'));
for (let i = 0; i < lvlChoise.length; i++) {
    lvlChoise[i].addEventListener('click', (e) => handlePlayBtnClick(e, `level${i + 1}.html`));
}

function handlePlayBtnClick (e, path) {
    e.preventDefault();
    const name = playerNameInput.value.trim();
    
    if (name.length < 3) {
        playerNameInput.classList.add('invalid');
        errorMessage.style.display = 'block';
        return;
    }

    initializeGame(name);

    window.location.href = path;
}