function AI(grid) {
  this.grid = grid;
}

// static evaluation function
AI.prototype.eval = function() {
  var maxWeight = 1.0,
  // mergeWeight = 0.1,
  mono2Weight = 1.0,
  smoothWeight = 0.1,
  emptyCells = 2.7;

  return maxWeight * this.grid.maxValue() + 
  // mergeWeight * this.grid.tileMatchesAvailable() +
  smoothWeight * this.grid.smoothness() + 
  mono2Weight * this.grid.monotonicity2() +
  emptyCells * Math.log(this.grid.availableCells().length);
};

// alpha-beta depth first search
AI.prototype.search = function(depth, alpha, beta, positions, cutoffs) {
  var bestScore;
  var bestMove = -1;
  var result;

  // the maxing player
  if (this.grid.playerTurn) {
    bestScore = alpha;
    for (var direction in [0, 1, 2, 3]) {
      var newGrid = this.grid.clone();
      if (newGrid.move(direction).moved) {
        positions++;
        if (newGrid.isWin()) {
          return { move: direction, score: 10000, positions: positions, cutoffs: cutoffs };
        }
        var newAI = new AI(newGrid);

        if (depth == 0) {
          result = { move: direction, score: newAI.eval() };
        } else {
          result = newAI.search(depth-1, bestScore, beta, positions, cutoffs);
          if (result.score > 9900) { // win
            result.score--; // to slightly penalize higher depth from win
          }
          positions = result.positions;
          cutoffs = result.cutoffs;
        }

        if (result.score > bestScore) {
          bestScore = result.score;
          bestMove = direction;
        }
        if (bestScore > beta) {
          cutoffs++
          return { move: bestMove, score: beta, positions: positions, cutoffs: cutoffs };
        }
      }
    }
  }

  else { // computer's turn, we'll do heavy pruning to keep the branching factor low
    bestScore = beta;

    // try a 2 and 4 in each cell and measure how annoying it is
    // with metrics from eval
    var candidates = [];
    var cells = this.grid.availableCells();
    var scores = { 2: [], 4: [] };
    for (var value in scores) {
      for (var i in cells) {
        scores[value].push(null);
        var cell = cells[i];
        var tile = new Tile(cell, parseInt(value, 10));
        this.grid.insertTile(tile);
        scores[value][i] = -this.grid.smoothness() + this.grid.islands();
        this.grid.removeTile(cell);
      }
    }

    // now just pick out the most annoying moves
    var maxScore = Math.max(Math.max.apply(null, scores[2]), Math.max.apply(null, scores[4]));
    for (var value in scores) { // 2 and 4
      for (var i=0; i<scores[value].length; i++) {
        if (scores[value][i] == maxScore) {
          candidates.push( { position: cells[i], value: parseInt(value, 10) } );
        }
      }
    }

    // search on each candidate
    for (var i=0; i<candidates.length; i++) {
      var position = candidates[i].position;
      var value = candidates[i].value;
      var newGrid = this.grid.clone();
      var tile = new Tile(position, value);
      newGrid.insertTile(tile);
      newGrid.playerTurn = true;
      positions++;
      newAI = new AI(newGrid);
      result = newAI.search(depth, alpha, bestScore, positions, cutoffs);
      positions = result.positions;
      cutoffs = result.cutoffs;

      if (result.score < bestScore) {
        bestScore = result.score;
      }
      if (bestScore < alpha) {
        cutoffs++;
        return { move: null, score: alpha, positions: positions, cutoffs: cutoffs };
      }
    }
  }

  return { move: bestMove, score: bestScore, positions: positions, cutoffs: cutoffs };
}

// performs a search and returns the best move
AI.prototype.getBest = function() {
  var searchType = document.getElementById('AI').value;

  if(searchType === 'AB_IDA*') {
    return this.iterativeDeep();
  } else if(searchType === 'BackTracking') {
    return this.backTracking();
  }
}

// performs iterative deepening over the alpha-beta search
AI.prototype.iterativeDeep = function() {
  var start = (new Date()).getTime();
  var depth = 0;
  var best;

  do {
    var newBest = this.search(depth, -10000, 10000, 0 ,0);
    if (newBest.move == -1) {
      break;
    } else {
      best = newBest;
    }
    depth++;
  } while ( (new Date()).getTime() - start < minSearchTime);

  return best
}

AI.prototype.backTracking = function() {
  /*    
  Goal of BackTracking is to determine a possible route 
  to the goal by choosing the best step at each breadth.

  By using a queue, we add moves at each step. Moves are selected using the eval
  function, according to this order of events:

  1. Add best move at current step
  2. Add random move by computer
  3. if win() -> execute the queue on the real grid
  4. if no more moves available, backtrack one step and determine
     next likely move
  5. Continue until goal is reached
  */

  var queue = [];

  // For each possible direction
  var newGrid = this.grid.clone();

  var moveScores = [];

  for(var direction in [0,1,2,3]) {
    // Clone the grid
    var cloneG = this.grid.clone();

    // Make the move
    if (cloneG.move(direction).moved) {
      moveScores.push({ move: direction , score: cloneG.eval() });
    }
  }

  var bestMove = -1;
  var bestScore = 0;
  for(var i in moveScores) {
    if(moveScores[i].score > bestScore) {
      bestMove = i;
    }
  }

  queue.push({ turn: "player" , move: bestMove , grid: this.grid.clone() });

  // We now have the best first move to make
  // Begin tracking step from queue
  return this.recursiveBackTrack(queue,0);
}

AI.prototype.recursiveBackTrack = function(queue,step) {
  step++;
  if(step == 18) return queue;

  // Grab the end of the queue
  var currentNode = queue[queue.length-1];
  // Get the grid
  if(!(currentNode === 'undefined')) {
    var currentGrid = currentNode.grid;

    if(currentGrid.isWin()) {
      console.log("WIN FOUND");
      return queue;
    }
    if(currentGrid.isGameOver()) {
      console.log("GAME OVER FOUND");
      queue.pop();
      return queue;
    }

    // Apply a random move by the computer but add it to the queue
    if(currentGrid.cellsAvailable()) {
      var randomTile = currentGrid.addRandomTile();
      currentGrid.removeTile(randomTile);
      queue.push({ turn: "computer" , tile: randomTile , grid: currentGrid.clone() });
    }

    var moveScores = [];

    for(var direction in [0,1,2,3]) {
      // Clone the grid
      var cloneG = this.grid.clone();

      // Make the move
      if (cloneG.move(direction).moved) {
        moveScores.push({ move: direction , score: cloneG.eval() , grid: cloneG.clone() });
      }
    }

    do {

      var bestMove = -1;
      var bestScore = 0;
      for(var i in moveScores) {
        if(moveScores[i].score >= bestScore) {
          bestMove = i;
          moveScores.splice(i,1);
        }
      }

      queue.push({ turn: "player" , move: bestMove , grid: this.grid.clone() });

      // console.log(queue);
      return this.recursiveBackTrack(queue,step);

    }while(moveScores.length >= 0);
  }

  return queue;
}