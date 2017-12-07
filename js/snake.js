function Game(options) {
    this._options = Object.assign({}, this.getDefaultOptions(), options);
    this.setGameContext();
    this.initializeSnakeSquares();

    this._moveVector = {
        xComponent: 0,
        yComponent: -1,
    };
}

Game.prototype.getDefaultOptions = function() {
    return {
        snakeColor: 'red',
        initialSnakeLength: 4,
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
    this._canvas = document.getElementById('game-mount');
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

    var lastSnakeSquare = this._snakeSquares[0];
    var firstSnakeSquare = this._snakeSquares[this._snakeSquares.length - 1];

    this._snakeSquares = this._snakeSquares.slice(1);

    this._snakeSquares = this._snakeSquares.concat([
        new SnakeSquare(
            firstSnakeSquare.xPosition + this._moveVector.xComponent,
            firstSnakeSquare.yPosition + this._moveVector.yComponent
        )
    ]);

    this._snakeSquares.forEach(function(snakeSquare) {
        this._ctx.fillStyle = this._options.snakeColor;
        this._ctx.fillRect(snakeSquare.xPosition, snakeSquare.yPosition, 1, 1);
    }.bind(this));

    window.requestAnimationFrame(this.drawFrame.bind(this));
}

Game.prototype.initializeSnakeSquares = function() {
    var xPosition = Math.floor(this._width / 2);
    var yPosition = Math.floor(this._height / 2);

    this._snakeLength = this._options.initialSnakeLength;

    this._snakeSquares = [];
    for (var i = 0; i < this._snakeLength; i ++) {
        console.log(this._snakeSquares);
        this._snakeSquares = this._snakeSquares.concat(new SnakeSquare(
            xPosition, ++yPosition
        ));
    }
}

Game.prototype.start = function() {
    window.requestAnimationFrame(this.drawFrame.bind(this));
};

function SnakeSquare(xPosition, yPosition) {
    this.xPosition = xPosition;
    this.yPosition = yPosition;
}

var game = new Game();

game.start();
