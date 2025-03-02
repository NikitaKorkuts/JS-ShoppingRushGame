const GameConfig = {
  TOTAL_TIME: 21,
  REWARD_COEFFICIENT: 2,
  PENALTY_MULTIPLIER: 1,
  MAX_DIFFICULTY: 8,
  GRID_SIZE: { columns: 12, rows: 5 },
  FADE_ANIMATION_DURATION: 7000
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
    this.displayingProducts = [];
    this.shoppingList = [];
    this.activeTimers = new Set();
  }

  clearAllTimers() {
    this.activeTimers.forEach(timer => clearTimeout(timer));
    this.activeTimers.clear();
  }
}
  
class UIManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.elements = {
      progressBar: document.getElementById('progressBar'),
      points: document.getElementById('points'),
      pointsAdds: document.getElementById('pointsAdds'),
      shoppingQuest: document.getElementById('shoppingQuest'),
      shoppingList: document.getElementById('shoppingList'),
      gridContainer: document.getElementById('gridContainer'),
      startBtn: document.getElementById('startBtn'),
      nextlvlBtn: document.getElementById('nextlvlBtn'),
      reloadBtn: document.getElementById('reloadBtn'),
      results: document.getElementById('results'),
      levelInfo: document.getElementById('levelInfo')
    };
  }

  bindEvents(game) {
    this.elements.startBtn.addEventListener('click', () => game.start());
    this.elements.reloadBtn.addEventListener('click', () => game.reload());
  }

  resetUI() {
    this.elements.nextlvlBtn.classList.add('hide');
    this.elements.results.classList.remove('fail', 'success');
    this.elements.results.innerHTML = '';
    this.resetGrid();
    this.updateLevelInfo(1, 1);
    this.updatePointsDisplay(0, 0);
  }

  updateLevelInfo(level, subLevel) {
    this.elements.levelInfo.textContent = `Уровень: ${level}-${subLevel}`;
  }

  updatePointsDisplay(delta, total) {
    this.elements.points.textContent = total;
    this.elements.pointsAdds.textContent = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '';
  }

  resetGrid() {
    this.elements.gridContainer.innerHTML = '';
    for (let i = 0; i < GameConfig.GRID_SIZE.columns * GameConfig.GRID_SIZE.rows; i++) {
      const item = document.createElement('div');
      item.className = 'grid-item';
      this.elements.gridContainer.appendChild(item);
    }
  }

  removeProductCardEvents(productId) {
    const elements = document.querySelectorAll(`[data-id="${productId}"]`);
    elements.forEach(element => {
        if (element._animationController) {
            element._animationController.abort(); // Удаляем все обработчики
        }
    });
  }

  renderProducts(products, clickHandler) {
    products.forEach(product => {
        const card = ProductCard.create(product.name, product.image);
        card.dataset.id = product.id;
        card.addEventListener('click', () => clickHandler(product.id));
        
        this.startFadeAnimation(card); 

        const emptyCells = Array.from(this.elements.gridContainer.children)
            .filter(item => !item.hasChildNodes());
            
        if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            emptyCells[randomIndex].appendChild(card);
        }
    });
  }

  startFadeAnimation(element) {
    let startOpacity = 1;
    let lastTime = null;
    let animationFrame = null;
    let isPaused = false;
    const controller = new AbortController();

    const animate = (timestamp) => {
        if (!element.isConnected) {
            cancelAnimationFrame(animationFrame);
            return;
        }

        if (!lastTime) lastTime = timestamp;
        if (isPaused) return;

        const deltaTime = timestamp - lastTime;
        startOpacity -= deltaTime / (GameConfig.FADE_ANIMATION_DURATION - this.gameManager.state.subLevel);

        if (startOpacity <= 0) {
            element.dispatchEvent(new CustomEvent('fadeComplete', {
                detail: { productId: +element.dataset.id }
            }));
            return;
        }

        element.style.opacity = startOpacity;
        lastTime = timestamp;
        animationFrame = requestAnimationFrame(animate);
    };

    // Автоматический старт анимации
    animationFrame = requestAnimationFrame(animate);

    element.addEventListener('fadeComplete', (e) => {
      const productId = e.detail.productId;
      this.gameManager.handleProductInteraction(productId, false);
    }, { signal: controller.signal });

    // Обработчики событий с автоматическим удалением
    element.addEventListener('mouseenter', () => {
        isPaused = true;
        element.style.opacity = 1;
        cancelAnimationFrame(animationFrame);
    }, { signal: controller.signal });

    element.addEventListener('mouseleave', () => {
        isPaused = false;
        startOpacity = element.style.opacity;
        lastTime = null;
        animationFrame = requestAnimationFrame(animate);
    }, { signal: controller.signal });

    // Сохраняем контроллер для очистки
    element._animationController = controller;
}

  showFeedback(productId, isCorrect) {
    let elem = this.elements.gridContainer.querySelector(`.grid-item > [data-id="${productId}"]`).parentNode;
    if (!elem) return;

    elem.innerHTML = isCorrect
      ? `<img class="feedbackImg" src="media/imgs//success.png" draggable="false" oncontextmenu="return false;">`
      : `<img class="feedbackImg" src="media/imgs/fail.png" draggable="false" oncontextmenu="return false;">`;
      
    setTimeout(() => {
        const newImage = elem.querySelector('.feedbackImg');
        newImage && elem.removeChild(newImage);
    }, 500);   
  }

  showFinalResults(isSuccess) {
    this.elements.results.innerHTML = isSuccess ? 'Уровень пройден!' : 'Уровень провален!';
    this.elements.results.classList.add(isSuccess ? 'success' : 'fail');
    if (isSuccess) this.elements.nextlvlBtn.classList.remove('hide');
  }
}

class TimerManager {
    constructor(game) {
      this.game = game;
      this.timerId = null;
      this.startTime = null;
    }
  
    startLevelTimer() {
      this.startTime = Date.now();
      this.updateProgressBar(100);
      
      const update = () => {
        const elapsed = Date.now() - this.startTime;
        const remaining = (GameConfig.TOTAL_TIME - (this.game.state.subLevel * 3)) - Math.floor(elapsed / 1000);
        
        if (remaining <= 0) {
          this.handleTimeExpired();
        } else {
          const percentage = (remaining / (GameConfig.TOTAL_TIME - (this.game.state.subLevel * 3))) * 100;
          this.updateProgressBar(percentage);
          this.timerId = requestAnimationFrame(update);
        }
      };
      
      this.timerId = requestAnimationFrame(update);
    }
  
    updateProgressBar(percentage) {
      this.game.ui.elements.progressBar.style.width = `${percentage}%`;
    }
  
    handleTimeExpired() {
      cancelAnimationFrame(this.timerId);
      this.game.processRemainingProducts();
    }
  
    stopTimer() {
      cancelAnimationFrame(this.timerId);
      this.game.ui.elements.progressBar.style.width = '100%';
  }
}
  
class GameManager {
  constructor() {
    this.state = new GameState();
    this.ui = new UIManager(this);
    this.timer = new TimerManager(this);
    this.ui.bindEvents(this);
  }

  start() {
    this.ui.elements.startBtn.classList.add('hide');
    this.state.reset();
    this.state.isStarted = true;
    this.ui.resetUI();
    this.generateLevel();
  }

  reload() {
    this.start();
  }

  generateLevel() {
    const [shoppingList, products] = GroceriesGenerator.generateProducts({
      level: this.state.level,
      shoppingListCount: this.state.level <= 2
        ? 2 + this.state.subLevel
        : 1 + this.state.subLevel,
      groceriesCount: 5 + this.state.subLevel,
      chance: this.state.level === 1 || this.state.level === 3
        ? 0.25
        : 0.75,
    });

    this.state.shoppingList = shoppingList;
    this.state.displayingProducts = products;
    
    this.timer.startLevelTimer();
    
    this.ui.renderProducts(products, (productId) => this.handleProductInteraction(productId, true));
    this.ui.elements.shoppingQuest.innerHTML = questions[this.state.level - 1];
    this.ui.elements.shoppingList.innerHTML = shoppingList
      .map(item => `<li>${item.name}</li>`)
      .join('');
  }

  handleProductInteraction(productId, isChosen) {
    const isCorrect = this.checkIsCorrectChoice(productId, isChosen);
    const points = this.calculatePoints(isCorrect);

    this.updatePoints(points);
    this.removeProduct(productId, isCorrect);
    
    if (this.state.displayingProducts.length === 0) {
        this.nextLevel();
    }
  }
  
  removeProduct(productId, isCorrect) {
    this.ui.removeProductCardEvents(productId);

    this.state.displayingProducts = this.state.displayingProducts.filter(
        (p) => p.id !== productId      
    );

    this.ui.showFeedback(productId, isCorrect);
  }

  processRemainingProducts() {
    this.state.displayingProducts.forEach(product => {
      this.handleProductInteraction(product.id, false);
    });
  }

  checkIsCorrectChoice(productId, isChosen) {
    let isCorrect = false;
    switch (this.state.level) {
      case 1:
        isCorrect = this.state.shoppingList.some(item => item.id === productId);
        break;
      case 2:
        isCorrect = !this.state.shoppingList.some(item => item.id === productId);
        break;
      case 3:
        isCorrect = this.state.shoppingList.some(category => 
          category.groceries.some(item => item.id === productId)
        );
        break;
      case 4:
        isCorrect = !this.state.shoppingList.some(category => 
          category.groceries.some(item => item.id === productId)
        );
        break;
    }

    return (isCorrect && isChosen) || (!isCorrect && !isChosen);
  }

  calculatePoints(isCorrect) {
      const difficulty = this.state.level + 2 * (this.state.subLevel - 1);
      return isCorrect 
        ? (difficulty * GameConfig.REWARD_COEFFICIENT) 
        : -(difficulty * GameConfig.REWARD_COEFFICIENT + 
            (GameConfig.MAX_DIFFICULTY - difficulty + 1) * GameConfig.PENALTY_MULTIPLIER);
  }

  updatePoints(points) {
    this.state.points += points;
    this.ui.updatePointsDisplay(points, this.state.points);
  }

  nextLevel() {
    this.state.clearAllTimers();
    this.timer.stopTimer();
    this.state.subLevel++;
    
    if (this.state.subLevel > 3) {
      this.state.level++;
      this.state.subLevel = 1;
    }

    if (this.state.level > 4 || this.state.points < 0) {
      this.endGame();
    } else {
      this.ui.updateLevelInfo(this.state.level, this.state.subLevel);
      this.generateLevel();
    }
  }

  endGame() {
    const isSuccess = this.state.level > 4 && this.state.points >= 0;
    this.ui.showFinalResults(isSuccess);
    if (isSuccess) saveLevelResults(2, this.state.points);
  }
}
  
const gameManager = new GameManager();