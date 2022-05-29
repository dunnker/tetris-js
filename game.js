const pointWidth = 25;
const pointHeight = 25;

var tetrisGame;
var canvas;
var ctx;
var ticks;

function keyListener(e) {
  if (! e) {
    //for IE
    e = window.event;
  }
  switch (e.keyCode) {
    case 37: //left
      tetrisGame.setCol(tetrisGame.col - 1);
      break;
    case 39: //right
      tetrisGame.setCol(tetrisGame.col + 1);
      break;
    case 38: //up
      tetrisGame.rotate(true);
      break;
    case 40: //down
      tetrisGame.setRow(tetrisGame.row + 1);
      break;
  }
}

function main() {
  var date = new Date();
  ticks = date.getTime();
  document.onkeydown = keyListener;
  canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    ctx = canvas.getContext('2d');
    tetrisGame = new TetrisGame();
    tetrisGame.startGame();
    gameLoop();
  } 
  else { 
    alert("no context");
  }
}

function pickShapeColor(shapeIndex) {
  switch (shapeIndex) {
    case 0: 
      ctx.fillStyle = "orange";
      break;
    case 1: 
      ctx.fillStyle = "blue";
      break;
    case 2: 
      ctx.fillStyle = "yellow";
      break;
    case 3: 
      ctx.fillStyle = "red";
      break;
    case 4: 
      ctx.fillStyle = "brown";
      break;
    case 5: 
      ctx.fillStyle = "green";
      break;
    case 6: 
      ctx.fillStyle = "white";
      break;
  }
}

function renderNextShape(shapeIndex) {
  ctx.fillStyle = "darkgray";
  ctx.fillRect(300 - (1 * pointWidth), 100 - (2 * pointHeight), pointWidth * 4, pointHeight * 4);
  pickShapeColor(shapeIndex);
  for (var i = 0; i <= shapes[shapeIndex].length - 1; i++) {
    ctx.fillRect(300 + (shapes[shapeIndex][i][cX] * pointWidth), 100 + (shapes[shapeIndex][i][cY] * pointHeight), pointWidth, pointHeight);
  } 
}

function render(tetrisGame) {
  // render game grid
  for (var i = 0; i <= colCount - 1; i++) {
    for (var j = 0; j <= rowCount - 1; j++) {
      if (tetrisGame.grid[i][j].occupied != ocVoid) {
        pickShapeColor(tetrisGame.grid[i][j].color);
      } 
      else {
        ctx.fillStyle = "darkgray";
      }
      ctx.fillRect(i * pointWidth, j * pointHeight, pointWidth, pointHeight);
    }
  }
}

function gameLoop() {
  if (! tetrisGame.gameOver) {
    render(tetrisGame);
    renderNextShape(tetrisGame.nextShapeIndex);
    var date = new Date();
    var newticks = date.getTime();
    if (newticks - ticks > 1000 / tetrisGame.level) {
      tetrisGame.tick();
      ticks = newticks;
    }
    setTimeout("gameLoop()", 10);
  }
}
