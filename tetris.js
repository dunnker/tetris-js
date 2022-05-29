function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
  
const colCount = 10;
const rowCount = 20;
const pointCount = 4;
const shapeCount = 7;
const cX = 0;
const cY = 1;
const ocVoid = 0;
const ocFixed = 1;
const ocMoving = 2;

                        /*
                                   0,-1
                             -1, 0 0, 0  1, 0

                        */

const shapes = [[[0, 0], [-1, 0], [0, -1], [1, 0]],

                        /*
                             -1,-1 0,-1
                             -1, 0 0, 0

                        */
  
            [[0, 0], [-1, 0], [-1, -1], [0, -1]],
		  
                        /*
                                   0,-1
                             -1, 0 0, 0
                             -1, 1
                        */

            [[0, 0], [-1, 0], [-1, 1], [0, -1]],
		  
                        /*
                             -1,-1
                             -1, 0 0, 0
                                   0, 1
                        */

            [[0, 0], [-1, 0], [-1, -1], [0, 1]],
		  
                        /*
                             -1,-1 0,-1
                                   0, 0
                                   0, 1
                        */

            [[0, 0], [0, -1], [-1, -1], [0, 1]],
		  
                        /*
                                   0,-1 1,-1
                                   0, 0
                                   0, 1
                        */

            [[0, 0], [0, -1], [1, -1], [0, 1]],
		  
                        /*
                                   0,-2
                                   0,-1
                                   0, 0
                                   0, 1
                        */

            [[0, 0], [0, 1], [0, -1], [0, -2]]];
            
// construct GridElement
function GridElement(occupied, color) {
  this.occupied = occupied;
  this.color = color;
}
            
// construct TetrisGame
function TetrisGame() {
  this.gameOver = true;
  this.shapesPerLevel = 5;
  // methods
  this.startGame = startGame;
  this.clearGrid = clearGrid;
  this.clearShape = clearShape;
  this.newShape = newShape;
  this.newRow = newRow;
  this.shapeToGrid = shapeToGrid;
  this.tick = tick;
  this.validLocation = validLocation;
  this.moveShape = moveShape;
  this.completeRows = completeRows;
  this.pointInBounds = pointInBounds;
  this.newLevel = newLevel;
  this.setCol = setCol;
  this.setRow = setRow;
  this.rotate = rotate;
  this.copyShape = copyShape;
  this.endGame = endGame;
} 

function startGame() {
  this.gameOver = false;
  this.nextShapeIndex = getRandomInt(0, shapeCount - 1);
  this.level = 1;
  this.shapeLevelCount = 0;
  this.rowsCompleted = 0;
  this.clearGrid();
  if (this.newShape()) {
    this.tick();
  }
  else {
    this.endGame();
  }
}
  
function clearGrid() {
  this.grid = new Array(colCount);
  for (var i = 0; i <= colCount - 1; i++) {
    this.grid[i] = new Array(rowCount);
    for (var j = 0; j <= rowCount - 1; j++) {
      this.grid[i][j] = new GridElement(ocVoid, 0);
    }
  }
}

function newShape() {
  this.row = 0;
  this.col = colCount / 2;
  this.shapeIndex = this.nextShapeIndex;
  this.nextShapeIndex = getRandomInt(0, shapeCount - 1);
  this.nextShape = copyShape(shapes[this.nextShapeIndex]);
  this.shape = copyShape(shapes[this.shapeIndex]);
  var v = this.validLocation(this.shape, this.col, this.row);
  if (v) {    
    // no need to clear because this is first time on the grid 
    this.moveShape(this.col, this.row, false); 
  }
  return v;
}

function tick() {
  if (! this.newRow()) {
    this.shapeToGrid();
    this.completeRows();
    if (! this.newShape()) {
      this.endGame();
    } 
    else {
      this.shapeLevelCount++;
      if (this.shapeLevelCount > this.shapesPerLevel) {
        this.newLevel();
      }
    }
  }
}

function newRow() {
  var result = this.validLocation(this.shape, this.col, this.row + 1);
  if (result) {
    this.moveShape(this.col, this.row + 1, true);
    this.row++;
    
    //TODO newrow event
  }
  return result;
}

function shapeToGrid() {
  for (var i = 0; i <= this.shape.length - 1; i++) {
    if (this.pointInBounds(this.col, this.row, this.shape[i])) {
      //assert(this.grid[this.col + this.shape[i][cX]][this.row + this.shape[i][cY]].occupied = ocMoving);
      this.grid[this.col + this.shape[i][cX]][this.row + this.shape[i][cY]].occupied = ocFixed;
    }
  }
}

function completeRows() {
  var row = rowCount - 1;
  while (row >= 0) {
    // look for any void spots on this row
    var foundVoid = false;
    for (var col = 0; col <= colCount - 1; col++) {
      if (this.grid[col][row].occupied == ocVoid) {
        foundVoid = true;
        break;
      }
    }

    if (! foundVoid) {
      //rowsCompleted++;

      // make all cells on this row void
      for (var col = 0; col <= colCount - 1; col++) {
        this.grid[col][row].occupied = ocVoid;
      }

      // bring all rows above row down one...
      for (var col = 0; col <= colCount - 1; col++) {
        for (var row2 = row - 1; row2 >= 0; row2--) {
          this.grid[col][row2 + 1].occupied = this.grid[col][row2].occupied;
          this.grid[col][row2 + 1].color = this.grid[col][row2].color;
        }
      }
    }
    else {
      row--;
    }
  }
}

function newLevel() {
  this.shapeLevelCount = 0;
  this.level++;
}

function validLocation(shape, col, row) {
  var result = true;
  // test to see if we can successfully place the shape in the new location...
  for (var i = 0; i <= shape.length - 1; i++) {
    // test points that have made it inside the grid,
    // since the shape starts out only partway inside the grid...
    if (row + shape[i][cY] >= 0) {
      // test points against walls and blocks that are already placed...
      if ((col + shape[i][cX] < 0) ||
          (col + shape[i][cX] > colCount - 1) ||
          (row + shape[i][cY] > rowCount - 1) ||
          (this.grid[col + shape[i][cX]][row + shape[i][cY]].occupied == ocFixed)) {
        result = false;
        break;
      }
    } 
    else {
      // if the point is still outside the grid at the top, test to see
      // if the point is inside the grid to the left and right...
      if ((col + shape[i][cX] < 0) ||
          (col + shape[i][cX] > colCount - 1)) {
        result = false;
        break;
      }
    }
  }
  return result;
}

function moveShape(col, row, clear) {
  if (clear) {
    this.clearShape();
  }
  // place the shape in the specified location...
  for (var i = 0; i <= this.shape.length - 1; i++) {
    if (this.pointInBounds(col, row, this.shape[i])) {
      //assert("nothing in grid", this.grid[col + this.shape[i][cX]][row + this.shape[i][cY]].occupied == ocVoid);
      // first set the color so that the grid's color is set before the Changed event below...
      this.grid[col + this.shape[i][cX]][row + this.shape[i][cY]].color = this.shapeIndex;
      
      //TODO: setting the occupied property triggers Changed event
      this.grid[col + this.shape[i][cX]][row + this.shape[i][cY]].occupied = ocMoving;
    }
  }
}

function clearShape() {
  // clear the shape in its current location...
  for (var i = 0; i <= this.shape.length - 1; i++) {
    if (this.pointInBounds(this.col, this.row, this.shape[i])) {
      //assert(this.grid[this.col + this.shape[i][cX]][this.row + this.shape[i][cY]].occupied = ocMoving);
      //TODO: event
      this.grid[this.col + this.shape[i][cX]][this.row + this.shape[i][cY]].occupied = ocVoid;
    }
  }
}

function pointInBounds(col, row, point) {
  return ((col + point[cX] >= 0) &&
          (col + point[cX] <= colCount - 1) &&
          (row + point[cY] >= 0) &&
          (row + point[cY] <= rowCount - 1));
}

function setCol(col) {
  if (this.validLocation(this.shape, col, this.row)) {
    this.moveShape(col, this.row, true);
    this.col = col;
  }
}

function setRow(row) {
  if (this.validLocation(this.shape, this.col, row)) {
    this.moveShape(this.col, row, true);
    this.row = row;
  }
}

function copyShape(shape) {
  var newShape = new Array(pointCount);
  for (var i = 0; i <= pointCount - 1; i++) {
    newShape[i] = shape[i].slice();
  }
  return newShape;
}

function rotate(clockwise) {
  var shape = copyShape(this.shape);
  // don't rotate the 4 squared block; e.g. shapeIndex of 1...
  if (this.shapeIndex != 1) {
    for (var i = 0; i <= shape.length - 1; i++) {
      // transform each point to next quadrant...
      if (clockwise) {
        var oldX = shape[i][cX];
        shape[i][cX] = -1 * shape[i][cY];
        shape[i][cY] = oldX;
      }
      else {
        var oldY = shape[i][cY];
        shape[i][cY] = -1 * shape[i][cX];
        shape[i][cX] = oldY;
      }
    }
  }
  if (this.validLocation(shape, this.col, this.row)) {
    this.clearShape(); // normally MoveShape will take care of this, however, the shape itself is changing (not just position)
    this.shape = copyShape(shape);
    this.moveShape(this.col, this.row, false);
  }
}

function endGame() {
  this.gameOver = true;
  alert("game over");
}
