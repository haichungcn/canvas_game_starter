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

canvas = document.getElementById("myCanvas");
ctx = canvas.getContext("2d");
canvas.width = 614;
canvas.height = 576;
// document.body.appendChild(canvas);

//center pixel
const center = [(canvas.width - 30) / 2, (canvas.height - 40) / 2];

let bgReady, heroReady, monsterReady, princessReady, rockReady;
let bgImage, heroImage, monsterImage, princessImage, rockImage;
const bgImageList = [
    "images/background-md.png",
    "images/background-md2.png",
    "images/background-md3.png",
    "images/background-md4.png"
];

const obstacleImageList = ["images/brock.png", "images/tree.png"];

const heroImageList = ["images/hero.png", "images/hero2.png"];

const monsterImageList = [
    "images/monster.png",
    "images/monster2.png",
    "images/monster3.png"
];

let highscoreArea = document.getElementById("highscoreArea");

let bgMusic = document.getElementById("bgMusic");
let moveAudio1 = document.getElementById("moveAudio1");
let moveAudio2 = document.getElementById("moveAudio2");
let hitAudio = document.getElementById("hitAudio");
let victory = document.getElementById("victory");
bgMusic.volume = 0.4;
hitAudio.volume = 0.5;
moveAudio1.volume = 0.5;
moveAudio2.volume = 0.5;
moveAudio1.play();
moveAudio2.play();

let startTime = Date.now();
const SECONDS_PER_ROUND = 30;
let elapsedTime = 0;

let applicationState = {};

function loadImages() {
    bgImage = new Image();
    bgImage.onload = function() {
        // show the background image
        bgReady = true;
    };

    bgImage.src = bgImageList[Math.floor(Math.random() * bgImageList.length)];

    rockImage = new Image();
    rockImage.onload = function() {
        // show the rock image
        rockReady = true;
    };
    rockImage.src =
        obstacleImageList[Math.floor(Math.random() * obstacleImageList.length)];

    heroImage = new Image();
    heroImage.onload = function() {
        // show the hero image
        heroReady = true;
    };
    heroImage.src = "image/hero.png";

    monsterImage = new Image();
    monsterImage.onload = function() {
        // show the monster image
        monsterReady = true;
    };
    monsterImage.src =
        monsterImageList[Math.floor(Math.random() * monsterImageList.length)];

    princessImage = new Image();
    princessImage.onload = function() {
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

//  Collection of characters
let chars = {
    hero: {
        X: canvas.width / 2,
        Y: canvas.height / 2,
        hitWall: { X: false, Y: false },
        moveLeft: false,
        moveUp: false,
        speed: 7,
        height: 38,
        width: 34,
        strike: false,
        jump: false
    },
    monster: {
        X: 0,
        Y: 0,
        hitWall: { X: false, Y: false },
        moveLeft: false,
        moveUp: false,
        speed: 2,
        height: 35,
        width: 32
    },
    princess: {
        X: 0,
        Y: 0,
        hitWall: { X: false, Y: false },
        moveLeft: false,
        moveUp: false,
        speed: 5,
        height: 48,
        width: 32
    }
};

chars.monster.X = Math.ceil(Math.random() * (canvas.width - 54) + 54) - 35;
chars.monster.Y = Math.ceil(Math.random() * (canvas.height - 64) + 64) - 64;

chars.princess.X = Math.ceil(Math.random() * (canvas.width - 54) + 54) - 35;
chars.princess.Y = Math.ceil(Math.random() * (canvas.height - 64) + 64) - 64;

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
    addEventListener(
        "keydown",
        function(key) {
            keysDown[key.keyCode] = true;
        },
        false
    );

    addEventListener(
        "keyup",
        function(key) {
            delete keysDown[key.keyCode];
        },
        false
    );
}

// Collections of obstacles
let obstacles = [];

// Generating obstacles
function createObstacles(num) {
    for (let i = 0; i < num; i++) {
        obstacles.push({
            X: Math.ceil(Math.random() * (canvas.width - 20) + 20) - 10,
            Y: Math.ceil(Math.random() * (canvas.height - 64) + 64) - 64,
            height: 30,
            width: 30
        });
    }
}

/**
 *  Update game objects - change player position based on key pressed
 *  and check to see if the monster has been caught!
 *
 *  If you change the value of 5, the player will move at a different rate.
 */
let update = function() {
    // Update the time.
    elapsedTime = Math.floor((Date.now() - startTime) / 1000);

    //control the hero base on key press
    controlHero();

    // Move player back when he is off screen - X axis
    wrapAround();

    // checking if monster hit the wall then chnage the hiWall value

    //If monster hit wall, change direction; if not, continue on his path
    // avoidObstacles("monster", "X");
    // avoidObstacles("monster", "Y");

    // chase("hero", "princess");

    chase("monster", "princess");
    // hitObstacleYet("hero", "rock");

    // checking if princess hit the wall then chnage the hiWall value

    //If princess hit wall, change direction; if not, continue on her path
    avoidObstacles("princess", "X");
    avoidObstacles("princess", "Y");

    updateScore();
    chars.hero.strike = false;
};

function wrapAround() {
    if (chars.hero.X >= canvas.width - 10) {
        chars.hero.X = 1;
    }

    if (chars.hero.X <= 0) {
        chars.hero.X = canvas.width - chars.hero.width + 3;
    }

    // Move player back when he is off screen - Y axis
    if (chars.hero.Y > canvas.height - 10) {
        chars.hero.Y = 1;
    }

    if (chars.hero.Y <= 0) {
        chars.hero.Y = canvas.height - 10;
    }
}

function controlHero() {
    heroImage.src = "images/hero-strike.png";

    // Player is holding up key
    let isBlockedResult = obstacles.map(val => isBlocked("hero", val));
    isBlockedResult = isBlockedResult.find(val => typeof val == "string");

    if (38 in keysDown && isBlockedResult !== "B") {
        chars.hero.Y -= chars.hero.speed;
        if (moveAudio1.ended) moveAudio1.play();
        heroStrike();
        return;
    }
    // Player is holding down key
    if (40 in keysDown && isBlockedResult !== "T") {
        chars.hero.Y += chars.hero.speed;
        if (moveAudio1.ended) moveAudio1.play();
        heroStrike();
        return;
    }
    // Player is holding left key
    if (37 in keysDown && isBlockedResult !== "R") {
        chars.hero.X -= chars.hero.speed;
        if (moveAudio1.ended) moveAudio2.play();
        heroStrike();
        return;
    }
    // Player is holding right key
    if (39 in keysDown && isBlockedResult !== "L") {
        chars.hero.X += chars.hero.speed;
        if (moveAudio1.ended) moveAudio2.play();
        heroStrike();
        return;
    }
    heroStrike();
}

function heroStrike() {
    if (32 in keysDown) {
        heroImage.src = "images/hero.png";
        chars.hero.strike = true;
        hitAudio.play();
        return;
    }
}

function isBlocked(char, obstacle) {
    let distanceToObstacleY = chars[char].Y - obstacle.Y;
    let distanceToObstacleX = chars[char].X - obstacle.X;
    // I do this to compensate for the picture size and the way it's rendered

    if (
        Math.abs(distanceToObstacleY) < 20 &&
        Math.abs(distanceToObstacleX) < 20 &&
        distanceToObstacleY > 0
    ) {
        return "B";
    } //hit the bottom

    if (
        Math.abs(distanceToObstacleY) < 30 &&
        Math.abs(distanceToObstacleX) < 25 &&
        distanceToObstacleY < 0
    ) {
        return "T";
    } //hit the top

    if (
        Math.abs(distanceToObstacleX) < 45 &&
        Math.abs(distanceToObstacleY) < 10 &&
        distanceToObstacleX > 0
    ) {
        return "R";
    } //hit the right

    if (
        Math.abs(distanceToObstacleX) < 37 &&
        Math.abs(distanceToObstacleY) < 10 &&
        distanceToObstacleX < 0
    ) {
        return "L";
    } //hit the left
}

//these function check if the characters hit walls and obstacles or not then change their direction base on their original direction
function checkIfHitWall(char) {
    if (
        chars[char].X + chars[char].width >= canvas.width ||
        chars[char].X <= 0
    ) {
        chars[char].hitWall.X = true;
    }
    if (
        chars[char].Y + chars[char].height >= canvas.height ||
        chars[char].Y <= 0
    ) {
        chars[char].hitWall.Y = true;
    }
}

function avoidObstacles(char, axis) {
    checkIfHitWall(char);
    let isBlockedResult = obstacles.map(val => isBlocked(char, val));
    isBlockedResult = isBlockedResult.find(val => typeof val == "string");

    if (axis == "X") {
        if (!chars[char].hitWall.X && typeof isBlockedResult !== "string") {
            if (chars[char].moveLeft) {
                move(char, "left");
            } else {
                move(char, "right");
            }
        } else if (chars[char].moveLeft) {
            move(char, "right");
        } else {
            move(char, "left");
        }
        chars[char].hitWall.X = false;
    } else if (axis == "Y") {
        if (!chars[char].hitWall.Y && typeof isBlockedResult !== "string") {
            if (chars[char].moveUp) {
                move(char, "up");
            } else {
                move(char, "down");
            }
        } else if (chars[char].moveUp) {
            move(char, "down");
        } else {
            move(char, "up");
        }
        chars[char].hitWall.Y = false;
    }
}

//functions for moving characters
function move(char, direction) {
    if (direction == "left") {
        chars[char].X -= chars[char].speed;
        chars[char].moveLeft = true;
    } else if (direction == "right") {
        chars[char].X += chars[char].speed;
        chars[char].moveLeft = false;
    } else if (direction == "up") {
        chars[char].Y -= chars[char].speed;
        chars[char].moveUp = true;
    } else if (direction == "down") {
        chars[char].Y += chars[char].speed;
        chars[char].moveUp = false;
    }
}

//function for a character chasing another
function chase(char1, char2) {
    let distanceX = chars[char2].X - chars[char1].X;
    let distanceY = chars[char2].Y - chars[char1].Y;

    if (distanceX > 0) {
        chars[char1].X += chars[char1].speed;
        chars[char1].moveLeft = true;
    } else if (distanceX < 0) {
        chars[char1].X -= chars[char1].speed;
        chars[char1].moveLeft = false;
    }

    if (distanceY > 0) {
        chars[char1].Y += chars[char1].speed;
        chars[char1].moveUp = false;
    } else if (distanceY < 0) {
        chars[char1].Y -= chars[char1].speed;
        chars[char1].moveUp = true;
    }
}

//check if 2 characters touching each other
function hasCaught(char1, char2) {
    if (
        Math.abs(chars[char1].X - chars[char2].X) <= chars[char1].width / 2 &&
        Math.abs(chars[char1].Y - chars[char2].Y) <= chars[char1].height / 2
    ) {
        return true;
    } else return false;
}

function updateScore() {
    if (hasCaught("hero", "princess")) {
        // Update caught number
        caughtNum += 1;
        // Pick a new location for the princess randomly.
        chars.princess.X =
            Math.ceil(Math.random() * (canvas.width - 54) + 54) - 35;
        chars.princess.Y =
            Math.ceil(Math.random() * (canvas.height - 64) + 64) - 64;
    }

    if (hasCaught("hero", "monster")) {
        // Update caught number
        caughtNum += 3;
        // Pick a new location for the princess randomly.
        chars.monster.X =
            Math.ceil(Math.random() * (canvas.width - 54) + 54) - 35;
        chars.monster.Y =
            Math.ceil(Math.random() * (canvas.height - 64) + 64) - 64;
    }

    if (hasCaught("hero", "monster") && chars.hero.strike == true) {
        // Update caught number
        caughtNum += 5;
        // Pick a new location for the princess randomly.
        chars.monster.X =
            Math.ceil(Math.random() * (canvas.width - 54) + 54) - 35;
        chars.monster.Y =
            Math.ceil(Math.random() * (canvas.height - 64) + 64) - 64;
    }

    if (hasCaught("monster", "hero") && chars.hero.strike == false) {
        // Deduct the score;
        caughtNum -= 1;
        // Pick a new location for the monster randomly.
        chars.monster.X =
            Math.ceil(Math.random() * (canvas.width - 54) + 54) - 35;
        chars.monster.Y =
            Math.ceil(Math.random() * (canvas.height - 64) + 64) - 64;
    }

    if (hasCaught("monster", "princess") && chars.hero.strike == false) {
        // Deduct the score;
        caughtNum -= 2;
        // Pick a new location for the monster randomly.
        chars.princess.X =
            Math.ceil(Math.random() * (canvas.width - 54) + 54) - 35;
        chars.princess.Y =
            Math.ceil(Math.random() * (canvas.height - 64) + 64) - 64;
    }
}

//checking if applicationState > isGameOver is true then do a series of steps.
function GameEnd() {
    if (elapsedTime >= SECONDS_PER_ROUND) {
        applicationState.isGameOver = true;
        updateHighscore();
        // if (!updateHighscore()) {

        // }
        return true;
    } else {
        // applicationState.isGameOver = false;
        return false;
    }
}

function updateHighscore() {
    if (caughtNum >= applicationState.highScore.score) {
        victory.play();
        applicationState.highScore.user = prompt(
            "You have the highest scrore, please enter your name:"
        );
        if (!applicationState.highScore.user) {
            applicationState.highScore.user = "Anonymous";
        }
        applicationState.highScore.score = caughtNum;
        applicationState.highScore.date = new Date();
        applicationState.isGameOver = false;
        applicationState.highScoreList.unshift(applicationState.highScore);
        displayHighscores();
        localStorage.setItem(
            "monsterchasing1",
            JSON.stringify(applicationState)
        );
        return true;
    } else return false;
}

/**
 * This function, render, runs as often as possible.
 */
const render = function() {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
    }

    if (rockReady) {
        obstacles.forEach(i => ctx.drawImage(rockImage, i.X, i.Y + 10));
    }

    if (heroReady) {
        ctx.drawImage(heroImage, chars.hero.X, chars.hero.Y);
    }
    if (monsterReady) {
        ctx.drawImage(monsterImage, chars.monster.X, chars.monster.Y);
    }

    if (princessReady) {
        ctx.drawImage(princessImage, chars.princess.X, chars.princess.Y);
    }

    ctx.font = "30px Georgia";
    ctx.textAlign = "left";
    ctx.strokeStyle = "#FFFFFF";
    ctx.strokeText(`${SECONDS_PER_ROUND - elapsedTime}`, 20, 40);
    ctx.font = "20px Georgia";
    ctx.strokeText(`Score: ${caughtNum}`, 20, canvas.height - 25);
    ctx.textAlign = "center";
    ctx.strokeText(
        `Best: ${applicationState.highScore.user} : ${applicationState.highScore.score}`,
        center[0],
        35
    );

    if (applicationState.isGameOver == true) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(center[0] - 80, center[1], 200, 50);
        ctx.strokeStyle = "#FF0000";
        ctx.strokeRect(center[0] - 80, center[1], 200, 50);
        ctx.fillStyle = "#FF0000";
        ctx.fillText(`GAME OVER`, center[0] + 20, center[1] + 32);
        applicationState.isGameOver = false;
    }
};

/**
 * The main game loop. Most every game will have two distinct parts:
 * update (updates the state of the game, in this case our hero and monster)
 * render (based on the state of our game, draw the right things)
 */
const main = function() {
    if (GameEnd()) {
        render();
        move("hero", "left");
    } else {
        update();
        render();
        // Request to do this again ASAP. This is a special method
        // for web browsers.
        requestAnimationFrame(main);
    }
};

//refresh or start a new game
function newGame() {
    // getAppState();
    applicationState.isGameOver = false;
}

function refresh() {
    window.location.href = window.location.href;
    // getAppState();
    applicationState.isGameOver = false;
}

function getAppState() {
    applicationState = JSON.parse(localStorage.getItem("monsterchasing1")) || {
        isGameOver: false,
        highScore: { user: "no-one-yet", score: 0 },
        highScoreList: []
    };
    displayHighscores();
}

function displayHighscores() {
    applicationState.highScoreList.forEach(
        val => (highscoreArea.innerHTML = `<p> ${val.user} scored ${val.score}`)
    );
}

function muteSound() {
    if (bgMusic.muted == false) {
        bgMusic.muted = true;
        moveAudio1.muted = true;
        moveAudio2.muted = true;
        hitAudio.muted = true;
        victory.muted = true;
    } else {
        bgMusic.muted = false;
        moveAudio1.muted = false;
        moveAudio2.muted = false;
        hitAudio.muted = false;
        victory.muted = false;
    }
}

// Cross-browser support for requestAnimationFrame.
// Safely ignore this line. It's mostly here for people with old web browsers.
const w = window;
requestAnimationFrame =
    w.requestAnimationFrame ||
    w.webkitRequestAnimationFrame ||
    w.msRequestAnimationFrame ||
    w.mozRequestAnimationFrame;

// Let's play this game!
createObstacles(10);
getAppState();
loadImages();
setupKeyboardListeners();
main();
