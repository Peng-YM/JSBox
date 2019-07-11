function GameManager(size, InputManager, Actuator) {
  this.size         = size; // Size of the grid
  this.inputManager = new InputManager;
  this.actuator     = new Actuator;

  this.running      = false;
  this.gameOverCount = 0;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));

  this.inputManager.on('think', function() {
    var best = this.ai.getBest();
    this.actuator.showHint(best.move);
  }.bind(this));

  // Binds the run button to the run function
  this.inputManager.on('run', function() {
    if (this.running) {
      this.running = false;
      this.actuator.setRunButton('Auto-run');
    } else {
      this.running = true;
      this.run()
      this.actuator.setRunButton('Stop');
    }
  }.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.actuator.restart();
  this.running = false;
  this.actuator.setRunButton('Auto-run');
  this.setup();
};

// Set up the game
GameManager.prototype.setup = function () {
  this.grid         = new Grid(this.size);
  this.grid.addStartTiles();

  this.ai           = new AI(this.grid);

  this.score        = 0;
  this.over         = false;
  this.won          = false;

  // Update the actuator
  this.actuate();
};


// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  this.actuator.actuate(this.grid, {
    score: this.score,
    over:  this.over,
    won:   this.won
  });
};

// makes a given move and updates state
GameManager.prototype.move = function(direction) {
  var result = this.grid.move(direction);
  this.score += result.score;

  var searchType = document.getElementById('AI').value;

  if (!result.won) {
    if (result.moved) {
      if(searchType === 'AB_IDA*') {
        this.grid.computerMove();
      }
    }
  } else {
    this.won = true;
  }

  //console.log(this.grid.valueSum());

  // We are handling game over seperately for Backtracking
  if (!this.grid.movesAvailable() && searchType === 'AB_IDA*') {
    this.over = true; // Game over!
  }

  this.actuate();
}

// moves continuously until game is over
GameManager.prototype.run = function() {
  var searchType = document.getElementById('AI').value;
  var best = this.ai.getBest();

  var timeout = animationDelay;

  if(searchType === 'AB_IDA*') {
    timeout = 100;
    this.move(best.move);
  } else if(searchType === 'BackTracking') {
    this.executeQueue(best);
  }

  if (this.running && !this.over && !this.won) {
    var self = this;
    //Evaluate if a win is found
    this.win = this.grid.isWin();

    if(this.grid.isGameOver()) {
      this.gameOverCount++;
      if(this.gameOverCount == 8) {
        this.setup();
        this.gameOverCount = 0;
      }
    }

    setTimeout(function(){
      self.run();
    }, timeout);
  }
}

GameManager.prototype.executeQueue = function(queue) {
  var step = queue.pop();
  if(!step) return;
  else {
    if(step.turn === "player") {
      // Clone the grid and make the move
      // If the move leads to a lower max tile, dont take it
      var tempGrid = step.grid;
      tempGrid.move(step.move);

      if(tempGrid.maxValue() >= this.grid.maxValue()) {
        this.move(step.move);
      }

    } else {
      this.grid.insertTile(step.tile);
    }

    var self = this;
    setTimeout(function() {
      self.executeQueue(queue);
    }, animationDelay);
  }
}