/*
  Code modified from:
  http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
  using graphics purchased from vectorstock.com
*/

/* Initialization.
Here, we create and add our "canvas" to the page.
We also load all of our images. 
*/


let canvas;
let ctx;

canvas = document.createElement("canvas");
ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

let bgReady, heroReady, monsterReady, princessReady;
let bgImage, heroImage, monsterImage, princessImage;

let startTime = Date.now();
const SECONDS_PER_ROUND = 30;
let elapsedTime = 0;

let isMonsterHitWallX = false;
let isMonsterHitWallY = false;

let isMonsterMoveLeft = false;
let isMonsterMoveUp = false;

let isPrincessHitWallX = false;
let isPrincessHitWallY = false;

let isPrincessMoveLeft = false;
let isPrincessMoveUp = false;

let applicationState = {
  isGameOver : false,
  highScore : {},
  highScoreList : []
};

// let applicationState = {
//   isGameOver : false,
//   highScore : {user : "Hai", score : 1},
//   highScoreList : [
//     {user : "Hai", score : 9999},
//     {user : "Minh", score : 999},
//     {user : "Tan", score : 99},
//     {user : "Pig", score : 9},
//   ]
// }

function loadImages() {
  bgImage = new Image();
  bgImage.onload = function () {
    // show the background image
    bgReady = true;
  };
  bgImage.src = "images/background.png";
  heroImage = new Image();
  heroImage.onload = function () {
    // show the hero image
    heroReady = true;
  };
  heroImage.src = "images/hero.png";

  monsterImage = new Image();
  monsterImage.onload = function () {
    // show the monster image
    monsterReady = true;
  };
  monsterImage.src = "images/monster.png";

  princessImage = new Image();
  princessImage.onload = function () {
    // show the princess image
    princessReady = true;
  };
  princessImage.src = "images/princess.png";
}

//Get application state

/** 
 * Setting up our characters.
 * 
 * Note that heroX represents the X position of our hero.
 * heroY represents the Y position.
 * We'll need these values to know where to "draw" the hero.
 * 
 * The same applies to the monster.
 */

//collection of characters
let chars = {
  hero : {
    X : canvas.width / 2,
    Y: canvas.height / 2,
    hitWall : { X : false, Y : false },
    moveLeft : false,
    moveUp : false,
    speed : 5
  },
  monster : {
    X : 0,
    Y : 0,
    hitWall : { X : false, Y : false },    
    moveLeft : false,
    moveUp : false,
    speed : 2
  },
  princess : {
    X : 0,
    Y : 0,
    hitWall : { X : false, Y : false },
    moveLeft : false,
    moveUp : false,
    speed : 3
  }
}

chars.monster.X = Math.ceil(Math.random() * (canvas.width - 54) + 54) - 35;
chars.monster.Y = Math.ceil(Math.random() * (canvas.height - 64) + 64) - 64;

chars.princess.X = Math.ceil(Math.random() * (canvas.width - 54) + 54) - 35;
chars.princess.Y = Math.ceil(Math.random() * (canvas.height - 64) + 64) - 64;

// let heroX = canvas.width / 2;
// let heroY = canvas.height / 2;

// let monsterX = Math.ceil(Math.random() * (canvas.width - 54) + 54) - 35;
// let monsterY = Math.ceil(Math.random() * (canvas.height - 64) + 64) - 64;

// let princessX = Math.ceil(Math.random() * (canvas.width - 54) + 54) - 35;
// let princessY = Math.ceil(Math.random() * (canvas.height - 64) + 64) - 64;

let caughtNum = 0;

/** 
 * Keyboard Listeners
 * You can safely ignore this part, for now. 
 * 
 * This is just to let JavaScript know when the user has pressed a key.
*/
let keysDown = {};
function setupKeyboardListeners() {
  // Check for keys pressed where key represents the keycode captured
  // For now, do not worry too much about what's happening here. 
  addEventListener("keydown", function (key) {
    keysDown[key.keyCode] = true;
  }, false);

  addEventListener("keyup", function (key) {
    delete keysDown[key.keyCode];
  }, false);
}


/**
 *  Update game objects - change player position based on key pressed
 *  and check to see if the monster has been caught!
 *  
 *  If you change the value of 5, the player will move at a different rate.
 */
let update = function () {
  // Update the time.
  elapsedTime = Math.floor((Date.now() - startTime) / 1000);


  if (38 in keysDown) { // Player is holding up key
    chars.hero.Y -= 5;
  }
  if (40 in keysDown) { // Player is holding down key
    chars.hero.Y += 5;
  }
  if (37 in keysDown) { // Player is holding left key
    chars.hero.X -= 5;
  }
  if (39 in keysDown) { // Player is holding right key
    chars.hero.X += 5;
  }

  // Move player back when he is off screen - X axis
  if (chars.hero.X > (canvas.width - 10)){
    chars.hero.X = 0 + 3;
  }

  if (chars.hero.X < 2){
    chars.hero.X = canvas.width - 10;
  }

  // Move player back when he is off screen - Y axis
  if (chars.hero.Y > (canvas.height - 10)){
    chars.hero.Y = 0 + 3;
  }

  if (chars.hero.Y < 2){
    chars.hero.Y = canvas.height - 10;
  }

  // Check if player and monster collided. Our images
  // are about 32 pixels big.
  let hasCaughtMonster = (chars.hero.X <= (chars.monster.X + 32)
  && chars.monster.X <= (chars.hero.X + 32)
  && chars.hero.Y <= (chars.monster.Y + 32)
  && chars.monster.Y <= (chars.hero.Y + 32));
  
  let hasCaughtPrincess = (chars.monster.X <= (chars.princess.X + 22)
  && chars.princess.X <= (chars.monster.X + 22)
  && chars.monster.Y <= (chars.princess.Y + 32)
  && chars.princess.Y <= (chars.monster.Y + 32));
  
  if (hasCaughtMonster) {
    // Update caught number
    caughtNum += 1;
    // Pick a new location for the monster randomly.
    chars.monster.X = Math.ceil(Math.random() * (canvas.width - 54) + 54) - 35;
    chars.monster.Y = Math.ceil(Math.random() * (canvas.height - 64) + 64) - 64;
  } else {}

  if (hasCaughtPrincess) {
    // Update caught number
    caughtNum -= 1;
    // Pick a new location for the monster randomly.
    chars.princess.X = Math.ceil(Math.random() * (canvas.width - 54) + 54) - 35;
    chars.princess.Y = Math.ceil(Math.random() * (canvas.height - 64) + 64) - 64;
  } else {}
  

  // checking if monster hit the wall 
  if (chars.monster.X > (canvas.width - 10) || chars.monster.X < 10){
    chars.monster.hitWall.X = true;
  }

  if (chars.monster.Y > (canvas.height - 10) || chars.monster.Y < 10){
    chars.monster.hitWall.Y = true;
  }

  //If monster hit wall, change direction; if not, continue on his path - X axis
  if (!chars.monster.hitWall.X) {
    if (isMonsterMoveLeft) {
      monsterMoveLeft();
    } else {monsterMoveRight()};
  } else if (isMonsterMoveLeft) {
    monsterMoveRight();
  } else {
    monsterMoveLeft();
  };
  chars.monster.hitWall.X = false;

  //If monster hit wall, change direction; if not, continue on his path - Y axis
  if (!chars.monster.hitWall.Y) {
    if (isMonsterMoveUp) {
      monsterMoveUp();
    } else {monsterMoveDown()};
  } else if (isMonsterMoveUp) {
    monsterMoveDown();
  } else {
    monsterMoveUp();
  };
  chars.monster.hitWall.Y = false;

  // checking if princess hit the wall 
  if (chars.princess.X > (canvas.width - 10) || chars.princess.X < 10){
    isPrincessHitWallX = true;
  }

  if (chars.princess.Y > (canvas.height - 10) || chars.princess.Y < 10){
    isPrincessHitWallY = true;
  }

  //If princess hit wall, change direction; if not, continue on her path - X axis
  if (!isPrincessHitWallX) {
    if (isPrincessMoveLeft) {
      princessMoveLeft();
    } else {princessMoveRight()};
  } else if (isPrincessMoveLeft) {
    princessMoveRight();
  } else {
    princessMoveLeft();
  };
  isPrincessHitWallX = false;

  //If princess hit wall, change direction; if not, continue on her path - Y axis
  if (!isPrincessHitWallY) {
    if (isPrincessMoveUp) {
      princessMoveUp();
    } else {princessMoveDown()};
  } else if (isPrincessMoveUp) {
    princessMoveDown();
  } else {
    princessMoveUp();
  };
  isPrincessHitWallY = false;
};

//functions for moving characters
function moveLeft(char){
  chars.char.X -= chars.char.speed;
  chars.char.moveLeft = true;
}

function moveRight(char){
  chars.char.X -= chars.char.speed;
  chars.char.moveLeft = false;
}

function moveDown(char){
  chars.char.X -= chars.char.speed;
  chars.char.moveUp = false;
}

function moveUp(char){
  chars.char.X -= chars.char.speed;
  chars.char.moveUp = true;
}

/**
 * This function, render, runs as often as possible.
 */
const render = function () {
  if (bgReady) {
    ctx.drawImage(bgImage, 0, 0);
  }
  if (heroReady) {
    ctx.drawImage(heroImage, chars.hero.X, chars.hero.Y);
  }
  if (monsterReady) {
    ctx.drawImage(monsterImage, chars.monster.X, chars.monster.Y);
  }

  if (princessReady) {
    ctx.drawImage(princessImage, chars.princessX, chars.princessY);
  }

  ctx.font = "20px Georgia";
  ctx.strokeText(`${SECONDS_PER_ROUND - elapsedTime}`, 10, 20);
  ctx.strokeText(`Score: ${caughtNum}`, 10, 460);
  ctx.strokeText(`Best:`, 460, 25)
  ctx.strokeText(`${applicationState.highScore.user} - ${applicationState.highScore.score}`, 430, 50);
};

//checking if applicationState > isGameOver is true then do a series of steps.
function GameEnd() {
  if (elapsedTime >= 30) {
    applicationState.isGameOver = true;
    if (caughtNum >= applicationState.highScore.score) {
      applicationState.highScore.user = prompt('You have the highest scrore, please enter your name:');
      applicationState.highScore.score = caughtNum;
      applicationState.highScore.date = new Date();
      applicationState.highScoreList.unshift(applicationState.highScore);
      localStorage.setItem('monsterchasing1', JSON.stringify(applicationState));
    } else {alert('GAME OVER!');}
    return true;
  } else {
    return false;
  }
}


/**
 * The main game loop. Most every game will have two distinct parts:
 * update (updates the state of the game, in this case our hero and monster)
 * render (based on the state of our game, draw the right things)
 */
const main = function () {
  // checking the number of monster has been caught reached 20 yet or the elapsedTime reach 30 yet, if it's there, end the game.
  if (GameEnd()){
    render();
    return;
  }
  update(); 
  render();
  
  // Request to do this again ASAP. This is a special method
  // for web browsers. 
  requestAnimationFrame(main);
};

//refresh or start a new game
function newGame() {
  applicationState = JSON.parse(localStorage.getItem('monsterchasing1'));
  applicationState.isGameOver = false;
}

function refresh() {
  window.location.href = window.location.href;
  applicationState = JSON.parse(localStorage.getItem('monsterchasing1'));
  applicationState.isGameOver = false;
}

// Cross-browser support for requestAnimationFrame.
// Safely ignore this line. It's mostly here for people with old web browsers.
const w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
loadImages();
setupKeyboardListeners();
main();