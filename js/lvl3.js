const GameConfig = {
  TOTAL_TIME: 21,
  REWARD_COEFFICIENT: 2,
  PENALTY_MULTIPLIER: 1,
  MAX_DIFFICULTY: 8,
  BASE_SPEED: 2,
  SPEED_INCREMENT: 1
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
    this.shouldBeClickedProducts = 0;
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
      board: document.getElementById('board'),
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
    this.gameManager.state.displayingProducts = [];
  }

  renderMovingProducts(products, clickHandler) {
      const boardRect = this.elements.gridContainer.getBoundingClientRect();
      products.forEach(product => {
          const card = ProductCard.create(product.name, product.image);
          card.dataset.id = product.id;
          card.classList.add('grocery-card')
          card.addEventListener('click', () => clickHandler(product.id, product.shouldBeClicked));
          
          const motion = new MotionController(card, {
              width: boardRect.width,
              height: boardRect.height
          }, GameConfig.BASE_SPEED + this.gameManager.state.subLevel * GameConfig.SPEED_INCREMENT);
          
          product.motion = motion;
          motion.start();
          
          this.elements.gridContainer.appendChild(card);
      });
  }

  removeProductCardEvents(productId) {
      const product = this.gameManager.state.displayingProducts.find(p => p.id === productId);
      if (product && product.motion) {
          product.motion.stop();
      }
  }

  showFeedback(productId, isCorrect) {
      const card = document.querySelector(`[data-id="${productId}"]`);
      if (!card) return;
      card.dataset.id = '';
      
      card.innerHTML = isCorrect
        ? `<img class="feedbackImg" src="media/imgs/success.png" draggable="false" oncontextmenu="return false;">`
        : `<img class="feedbackImg" src="media/imgs/fail.png" draggable="false" oncontextmenu="return false;">`;

      setTimeout(() => card.remove(), 500);
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
      this.game.nextLevel();
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
    this.state.shouldBeClickedProducts = 0;

    products.forEach((prod) => {
      prod.shouldBeClicked = this.checkShouldBeClicked(prod.id);
      if (prod.shouldBeClicked) this.state.shouldBeClickedProducts += 1;
    })

    this.state.displayingProducts = products;
    
    this.timer.startLevelTimer();
    
    this.ui.renderMovingProducts(products, (productId, shouldBeClicked) => {
      this.handleProductInteraction(productId, true, shouldBeClicked)
      if (this.state.displayingProducts.length === 0 || this.state.shouldBeClickedProducts === 0) this.nextLevel();
    });
    this.ui.elements.shoppingQuest.innerHTML = questions[this.state.level - 1];
    this.ui.elements.shoppingList.innerHTML = shoppingList
      .map(item => `<li>${item.name}</li>`)
      .join('');
  }

  handleProductInteraction(productId, isChosen, shouldBeClicked) {
    
    const isCorrect = (shouldBeClicked && isChosen) || (!shouldBeClicked && !isChosen);
    if (isCorrect) this.state.shouldBeClickedProducts -= 1;

    const points = this.calculatePoints(isCorrect);

    this.updatePoints(points);
    this.removeProduct(productId, isCorrect);
  }
  
  removeProduct(productId, isCorrect) {
    this.ui.removeProductCardEvents(productId);
    this.state.displayingProducts = this.state.displayingProducts.filter(p => p.id !== productId);
    
    this.ui.showFeedback(productId, isCorrect);
  }

  processRemainingProducts() {
    this.state.displayingProducts.forEach(product => {
        if (product.motion) product.motion.stop();
        this.handleProductInteraction(product.id, false, product.shouldBeClicked);
    });
  }  

  checkShouldBeClicked(productId) {
    let shouldBeClicked = false;
    switch (this.state.level) {
      case 1:
        shouldBeClicked = this.state.shoppingList.some(item => item.id === productId);
        break;
      case 2:
        shouldBeClicked = !this.state.shoppingList.some(item => item.id === productId);
        break;
      case 3:
        shouldBeClicked = this.state.shoppingList.some(category => 
          category.groceries.some(item => item.id === productId)
        );
        break;
      case 4:
        shouldBeClicked = !this.state.shoppingList.some(category => 
          category.groceries.some(item => item.id === productId)
        );
        break;
    }
    return shouldBeClicked;
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
    this.processRemainingProducts();

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
    if (isSuccess) saveLevelResults(3, this.state.points);
    this.ui.showFinalResults(isSuccess);
  }
}

class MotionController {
  constructor(element, bounds, speed) {
      this.element = element;
      this.bounds = bounds;
      this.speed = speed;
      this.angle = Math.random() * Math.PI * 2;
      this.x = Math.random() * (bounds.width - 100);
      this.y = Math.random() * (bounds.height - 100);
      this.dx = Math.cos(this.angle) * speed;
      this.dy = Math.sin(this.angle) * speed;
      this.animationFrame = null;
  }

  start() {
    const animate = () => {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x <= 0 || this.x >= this.bounds.width - 100) this.dx *= -1;
        if (this.y <= 0 || this.y >= this.bounds.height - 100) this.dy *= -1;

        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        this.animationFrame = requestAnimationFrame(animate.bind(this));
    };
    animate();
  }

  stop() {
    if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
    }
  }
}
  
const gameManager = new GameManager();