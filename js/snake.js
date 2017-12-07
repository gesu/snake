function Game(options) {
    this._options = Object.assign({}, this.getDefaultOptions(), options);
    this.setGameContext();
    this.initializeSnakeSquares();
    this.initializeFoodSquares();
    this.setMovementUp();
    this.addEventListeners();

    this._AIEnabled = true;
    this._gameScore = 0;
}

Game.prototype.getDefaultOptions = function() {
    return {
        gameMountId: 'game-mount',
        toggleAIButtonId: 'toggle-ai-button',
        restartButtonId: 'restart-button',
        snakeColor: 'red',
        initialSnakeLength: 4,
        foodSquares: 100,
        foodColor: 'white',
    };
}

Game.prototype.setGameContext = function() {
    this.setBoundaries();
    this.setCanvas();
    this.setContext();
}

Game.prototype.setBoundaries = function() {
    this._width = window.innerWidth;
    this._height = window.innerHeight;
};

Game.prototype.setCanvas = function() {
    this._canvas = document.getElementById(this._options.gameMountId);
    this._canvas.style.width = this._width;
    this._canvas.style.height = this._height;
}

Game.prototype.setContext = function() {
    this._ctx = this._canvas.getContext('2d');
    this._ctx.canvas.width = this._width;
    this._ctx.canvas.height = this._height;
}

Game.prototype.clearCanvas = function() {
    this._ctx.clearRect(0, 0, this._width, this._height);
}

Game.prototype.drawFrame = function() {
    this.clearCanvas();

    var firstSnakeSquare = this._snakeSquares[this._snakeSquares.length - 1];
    var nextSnakeSquare = new SnakeSquare(
        firstSnakeSquare.xPosition + this._moveVector.xComponent,
        firstSnakeSquare.yPosition + this._moveVector.yComponent
    );

    var stopAnimation = false;

    this._foodSquares.forEach(function(foodSquare, index) {
        if (Math.abs(foodSquare.xPosition - nextSnakeSquare.xPosition) <= 5
            && Math.abs(foodSquare.yPosition - nextSnakeSquare.yPosition) <= 5
        ) {
            this._snakeSquaresToAdd = this._snakeSquaresToAdd.concat(nextSnakeSquare);
            this._gameScore = this._gameScore + foodSquare.score;
            this._foodSquares.splice(index, 1);
        }
    }.bind(this));

    if (nextSnakeSquare.xPosition >= this._width
        || nextSnakeSquare.xPosition < 0
        || nextSnakeSquare.yPosition >= this._height
        || nextSnakeSquare.yPosition < 0
    ) {
        stopAnimation = true;
    }

    this._snakeSquares.forEach(function(snakeSquare) {
        if (nextSnakeSquare.xPosition - snakeSquare.xPosition === 0
            && nextSnakeSquare.yPosition - snakeSquare.yPosition === 0
        ) {
            stopAnimation = true;
        }
    })

    var lastSnakeSquare = this._snakeSquares[0];

    var increaseLength = false;
    this._snakeSquaresToAdd.forEach(function(snakeSquare, index) {
        if (snakeSquare.xPosition === lastSnakeSquare.xPosition
            && snakeSquare.yPosition === lastSnakeSquare.yPosition
        ) {
            increaseLength = true;
            this._snakeSquaresToAdd.splice(index, 1);
        }
    }.bind(this));

    if (!increaseLength) {
        this._snakeSquares = this._snakeSquares.slice(1);
    }

    this.drawScore();
    this.drawAIStatus();

    this._snakeSquares = this._snakeSquares.concat(nextSnakeSquare);

    if (this._AIEnabled) {
        var goal = this.getClosestFoodSquare(nextSnakeSquare);

        if (Math.abs(goal.xPosition - nextSnakeSquare.xPosition) > 5) {
            if (goal.xPosition - nextSnakeSquare.xPosition > 0) {
                !this.isMovingLeft() && this.setMovementRight();
            } else {
                !this.isMovingRight() && this.setMovementLeft();
            }
        } else if (Math.abs(goal.yPosition - nextSnakeSquare.yPosition) > 5) {
            if (goal.yPosition - nextSnakeSquare.yPosition > 0) {
                !this.isMovingUp() && this.setMovementDown();
            } else {
                !this.isMovingDown() && this.setMovementUp();
            }
        }
    }

    this._foodSquares.forEach(function(foodSquare) {
        this._ctx.fillStyle = this._options.foodColor;
        this._ctx.fillRect(foodSquare.xPosition, foodSquare.yPosition, 5, 5);
    }.bind(this))

    this._snakeSquares.forEach(function(snakeSquare) {
        this._ctx.fillStyle = this._options.snakeColor;
        this._ctx.fillRect(snakeSquare.xPosition, snakeSquare.yPosition, 5, 5);
    }.bind(this));

    if (!stopAnimation) {
        this._nextFrame = window.requestAnimationFrame(this.drawFrame.bind(this));
    }
}

Game.prototype.getClosestFoodSquare = function(snakeSquare) {
    var closestSquare = null;
    var minimumDistance = Math.sqrt(Math.pow(this._width, 2) + Math.pow(this._height, 2));

    this._foodSquares.forEach(function(foodSquare) {
        var distance = Math.sqrt(
            Math.pow((foodSquare.xPosition - snakeSquare.xPosition), 2) +
            Math.pow((foodSquare.yPosition - snakeSquare.yPosition), 2)
        );

        if (distance < minimumDistance) {
            minimumDistance = distance;
            closestSquare = foodSquare;
        }
    });

    return closestSquare;
}

Game.prototype.drawScore = function() {
    var xPosition = 50;
    var yPosition = 50;

    this._ctx.font = '30px monospace';
    this._ctx.fillText('score: ' + this._gameScore, xPosition, yPosition);
}

Game.prototype.drawAIStatus = function() {
    var xPosition = 50;
    var yPosition = 85;

    this._ctx.font = '30px monospace';
    this._ctx.fillText('autoplay: ' + (this._AIEnabled ? 'on' : 'off'), xPosition, yPosition);
}

Game.prototype.initializeSnakeSquares = function() {
    var xPosition = Math.floor(this._width / 2);
    var yPosition = Math.floor(this._height / 2);

    this._snakeLength = this._options.initialSnakeLength;

    this._snakeSquares = [];
    for (var i = 0; i < this._snakeLength; i ++) {
        this._snakeSquares = this._snakeSquares.concat(new SnakeSquare(
            xPosition, ++yPosition
        ));
    }

    this._snakeSquaresToAdd = [];
}

Game.prototype.initializeFoodSquares = function() {
    this._foodSquares = [];
    for (var i = 0; i < this._options.foodSquares; i++) {
        var xPosition = Math.floor(Math.random() * this._width);
        var yPosition = Math.floor(Math.random() * this._height);

        this._foodSquares = this._foodSquares.concat(new FoodSquare(
            xPosition, yPosition
        ));
    }
}

Game.prototype.generateNewFoodSquare = function() {
    var xPosition = Math.floor(Math.random() * this._width);
    var yPosition = Math.floor(Math.random() * this._height);

    this._foodSquares = this._foodSquares.concat(new FoodSquare(
        xPosition, yPosition
    ));
}

var KEYBOARD_CODES = {
    leftArrow: 37,
    upArrow: 38,
    rightArrow: 39,
    downArrow: 40,
}

Game.prototype.addEventListeners = function() {
    window.addEventListener('keydown', function(e) {
        if (this._AIEnabled) {
            return;
        }

        if (e.keyCode === KEYBOARD_CODES.leftArrow) {
            !this.isMovingRight() && this.setMovementLeft();
        } else if (e.keyCode === KEYBOARD_CODES.upArrow) {
            !this.isMovingDown() && this.setMovementUp();
        } else if (e.keyCode === KEYBOARD_CODES.rightArrow) {
            !this.isMovingLeft() && this.setMovementRight();
        } else if (e.keyCode === KEYBOARD_CODES.downArrow) {
            !this.isMovingUp() && this.setMovementDown();
        }
    }.bind(this));

    var toggleAIButton = document.getElementById(this._options.toggleAIButtonId);
    toggleAIButton.addEventListener('click', function(e) {
        this._AIEnabled = !this._AIEnabled;
    }.bind(this));

    var restartButton = document.getElementById(this._options.restartButtonId);
    restartButton.addEventListener('click', function(e) {
        this.restartGame();
    }.bind(this));
}

Game.prototype.restartGame = function() {
    this.setGameContext();
    this.initializeSnakeSquares();
    this.initializeFoodSquares();
    this.setMovementUp();

    this._AIEnabled = true;
    this._gameScore = 0;

    window.cancelAnimationFrame(this._nextFrame);
    this.start();
}

Game.prototype.setMovementUp = function() {
    this._moveVector = {
        xComponent: 0,
        yComponent: -5,
    }
}

Game.prototype.setMovementDown = function() {
    this._moveVector = {
        xComponent: 0,
        yComponent: 5,
    }
}

Game.prototype.setMovementRight = function() {
    this._moveVector = {
        xComponent: 5,
        yComponent: 0,
    }
}

Game.prototype.setMovementLeft = function() {
    this._moveVector = {
        xComponent: -5,
        yComponent: 0,
    }
}

Game.prototype.isMovingLeft = function() {
    return this._moveVector.xComponent === -5;
}

Game.prototype.isMovingRight = function() {
    return this._moveVector.xComponent === 5;
}

Game.prototype.isMovingUp = function() {
    return this._moveVector.yComponent === -5;
}

Game.prototype.isMovingDown = function() {
    return this._moveVector.yComponent === 5;
}

Game.prototype.start = function() {
    this._nextFrame = window.requestAnimationFrame(this.drawFrame.bind(this));
};

function SnakeSquare(xPosition, yPosition) {
    this.xPosition = xPosition;
    this.yPosition = yPosition;
}

function FoodSquare(xPosition, yPosition, score) {
    this.xPosition = xPosition;
    this.yPosition = yPosition;
    this.score = score || 100;
}

var game = new Game();

game.start();
