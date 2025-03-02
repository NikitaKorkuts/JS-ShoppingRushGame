const GameConfig = {
    DROP_INTERVAL: 45,
    REWARD_COEFFICIENT: 1,
    PENALTY_MULTIPLIER: 1,
    INITIAL_SPEED: 1,
    MAX_SPEED_MULTIPLIER: 3,
    SPEED_INCREMENT: 0.1 
};

class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.level = 1;
        this.subLevel = 1;
        this.points = 0;
        this.isStarted = false;
        this.cartX = 0;
        this.direction = 0;
        this.moveInterval = null;
        this.displayingProducts = [];
        this.shoppingList = [];
        this.speedMultiplier = 1;
        this.isSpeedBoost = false; 
    }
}

class UIManager {
    constructor(gameManager) {
        this.game = gameManager;
        this.elements = {
            board: document.querySelector('.board'),
            cart: document.querySelector('.cart'),
            productContainer: document.getElementById('product-container'),
            shoppingQuest: document.getElementById('shoppingQuest'),
            shoppingList: document.getElementById('shoppingList'),
            points: document.getElementById('points'),
            pointsAdds: document.getElementById('pointsAdds'),
            results: document.getElementById('results'),
            feedbackIcon: document.getElementById('feedbackIcon'),
            startLvlBtn: document.getElementById('startBtn'),
            restartLvlBtn: document.getElementById('restartBtn'), 
            nextlvlBtn: document.getElementById('nextlvlBtn')
        };
    }

    renderProducts(products) {
        this.elements.productContainer.innerHTML = '';

        products.forEach(p => {
            const card = ProductCard.create(p.name, p.image);
            card.dataset.id = p.id;
            this.elements.productContainer.appendChild(card);
        });
    }

    updatePoints(delta, total) {
        this.elements.points.textContent = total;
        this.elements.pointsAdds.textContent = delta > 0 ? `+${delta}` : delta;
    }

    showFeedback(isCorrect) {
        const icon = this.elements.feedbackIcon;
        icon.src = isCorrect ? 'media/imgs/success.png' : 'media/imgs/fail.png';
        icon.style.left = this.game.state.cartX + 'px';
        icon.classList.remove('hide');
        setTimeout(() => icon.classList.add('hide'), 1000);
    }

    showFinalResults(isSuccess) {
        const results = this.elements.results;
        results.textContent = isSuccess ? 'Уровень пройден!' : 'Уровень провален!';
        results.classList.remove('hide');
        results.classList.add(isSuccess ? 'success' : 'fail');
        if (isSuccess) {
            this.elements.nextlvlBtn.classList.remove('hide');
        } else {
            this.elements.nextlvlBtn.classList.add('hide');
        }
    }

    resetUI() {
        this.elements.results.classList.remove('success', 'fail');
        this.elements.nextlvlBtn.classList.add('hide');
        this.elements.cart.classList.remove('hide');
        this.elements.results.innerHTML = '';
        this.updatePoints(0, 0);
    }
}

class GameManager {
    constructor() {
        this.state = new GameState();
        this.ui = new UIManager(this);
        this.dropInterval = null;
        this.isGameActive = false; 
        this.bindEvents();
    }

    bindEvents() {
        this.ui.elements.startLvlBtn.addEventListener('click', () => this.start());
        this.ui.elements.restartLvlBtn.addEventListener('click', () => this.reload());
        
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    start() {
        if (this.isGameActive) return;
        this.state.reset();
        this.isGameActive = true;
        this.ui.elements.startLvlBtn.classList.add('hide')
        this.ui.resetUI();
        this.generateLevel();
        this.startDropInterval();
    }

    reload() {
        this.stopGame(); 
        this.start();
    }

    stopGame() {
        clearInterval(this.dropInterval);
        this.dropInterval = null;
        this.isGameActive = false;
        this.state.moveInterval && clearInterval(this.state.moveInterval);
        this.state.moveInterval = null;
    }

    generateLevel() {
        this.ui.elements.productContainer.innerHTML = '';
        
        const levelData = this.getLevelData();
        this.ui.elements.shoppingQuest.textContent = questions[this.state.level - 1];
        this.ui.elements.shoppingList.innerHTML = levelData.shoppingList
            .map(item => `<li>${item.name}</li>`)
            .join('');
        this.ui.renderProducts(levelData.displayingProducts);
    }

    getLevelData() {
        const [shoppingList, displayingProducts] = GroceriesGenerator.generateProducts({
            level: this.state.level,
            shoppingListCount: this.state.level <= 2
              ? 2 + this.state.subLevel
              : 1 + this.state.subLevel,
            groceriesCount: 5 + this.state.subLevel,
            chance: this.state.level === 1 || this.state.level === 3
              ? 0.75
              : 0.25,
          });

        this.state.shoppingList = shoppingList;
        this.state.displayingProducts = displayingProducts;

        return { shoppingList, displayingProducts };
    }

    checkCollisions() {
        if (!this.isGameActive) return; 
        
        const products = Array.from(document.querySelectorAll('.product-card'));
        const cartRect = this.ui.elements.cart.getBoundingClientRect();
        let closestProduct = null;
        let minDistance = Infinity;

        products.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const distance = Math.abs(cartRect.left - cardRect.left);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestProduct = card;
            }
        });

        if (closestProduct) {
            const cardRect = closestProduct.getBoundingClientRect();
            if (this.isColliding(cartRect, cardRect)) {
                this.handleProductHit(+closestProduct.dataset.id);
                closestProduct.remove();
            }
        }

        products.forEach(card => {
            if (card !== closestProduct) {
                card.remove();
            }
        });
    }

    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left || 
               rect1.left > rect2.right || 
               rect1.bottom < rect2.top || 
               rect1.top > rect2.bottom);
    }

    handleProductHit(productId) {
        const isCorrect = this.checkCorrectness(productId);
        
        const pointsDelta = this.calculatePoints(isCorrect);
        this.state.points += pointsDelta;
        this.ui.updatePoints(pointsDelta, this.state.points);
        this.ui.showFeedback(isCorrect);
    }

    calculatePoints(isCorrect) {
        return isCorrect 
            ? this.state.level * this.state.subLevel 
            : this.state.subLevel - (5 + this.state.level);
    }

    checkCorrectness(productId) {
        switch(this.state.level) {
            case 1: 
                return this.state.shoppingList.some(p => p.id === productId);
            case 2: 
                return !this.state.shoppingList.some(p => p.id === productId);
            case 3: 
                return this.state.shoppingList.some(c => 
                    c.groceries?.some(p => p.id === productId) ?? false
                );
            case 4: 
                return !this.state.shoppingList.some(c => 
                    c.groceries?.some(p => p.id === productId) ?? false
                );
            default: 
                return false;
        }
    }

    handleLevelProgression() {
        if (!this.isGameActive) return;

        this.state.subLevel++;
        if (this.state.subLevel > 3) {
            this.state.level++;
            this.state.subLevel = 1;
        }

        if (this.state.level > 4 || this.state.points < 0) {
            this.endGame();
        } else {
            this.generateLevel();
        }
    }

    startDropInterval() {
        this.dropInterval = setInterval(() => this.moveProducts(), GameConfig.DROP_INTERVAL);
    }

    moveProducts() {
        const products = document.querySelectorAll('.product-card');
        let allAtBottom = true;
        
        // Применяем множитель скорости
        const speed = (this.state.subLevel + 1) * this.state.speedMultiplier;

        products.forEach(card => {
            const currentTop = parseInt(card.style.marginTop) || 0;
            const newTop = currentTop + speed; // Используем вычисленную скорость
            card.style.marginTop = `${newTop}px`;
            
            if (newTop < this.ui.elements.board.clientHeight - 100) {
                allAtBottom = false;
            }
        });

        if (allAtBottom) {
            this.checkCollisions();
            this.handleLevelProgression();
        }
    }

    endGame() {
        this.stopGame();
        const isSuccess = this.state.level > 4 && this.state.points >= 0;
        if (isSuccess) {
            saveLevelResults(1, this.state.points);
        };
        this.ui.showFinalResults(isSuccess);
        
        this.ui.elements.productContainer.innerHTML = '';
        this.ui.elements.cart.classList.add('hide');
    }

    handleKeyDown(e) {
        if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
            this.state.direction = e.key === 'ArrowRight' ? 1 : -1;
            this.startCartMove();
        }

        if (e.key === 'ArrowDown') {
            this.state.isSpeedBoost = true;
            this.applySpeedBoost();
        }
    }

    handleKeyUp(e) {
        if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
            this.stopCartMove();
        }

        if (e.key === 'ArrowDown') {
            this.state.isSpeedBoost = false;
            this.state.speedMultiplier = 1;
        }
    }

    handleMouseMove(e) {
        const boardRect = this.ui.elements.board.getBoundingClientRect();
        const newX = e.clientX - boardRect.left - 50;
        this.state.cartX = Math.max(0, Math.min(newX, boardRect.width - 100));
        this.ui.elements.cart.style.left = `${this.state.cartX}px`;
    }

    applySpeedBoost() {
        if (!this.state.isSpeedBoost) return;
        
        this.state.speedMultiplier = Math.min(
            this.state.speedMultiplier + GameConfig.SPEED_INCREMENT,
            GameConfig.MAX_SPEED_MULTIPLIER
        );
        
        if (this.state.isSpeedBoost) {
            requestAnimationFrame(() => this.applySpeedBoost());
        }
    }

    startCartMove() {
        if (this.state.moveInterval) return;
        this.state.moveInterval = setInterval(() => {
            this.state.cartX += this.state.direction * 60;
            this.state.cartX = Math.max(0, Math.min(this.state.cartX, 
                this.ui.elements.board.clientWidth - 100));
            this.ui.elements.cart.style.left = `${this.state.cartX}px`;
        }, 50);
    }

    stopCartMove() {
        clearInterval(this.state.moveInterval);
        this.state.moveInterval = null;
    }
}

const gameManager = new GameManager();