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
canvas.width = 512;
canvas.height = 480;
// document.body.appendChild(canvas);

let bgReady, heroReady, monsterReady, princessReady, rockReady;
let bgImage, heroImage, monsterImage, princessImage, rockImage;

let startTime = Date.now();
const SECONDS_PER_ROUND = 100;
let elapsedTime = 0;

let applicationState = JSON.parse(localStorage.getItem("monsterchasing1")) || {
    isGameOver: false,
    highScore: {},
    highScoreList: []
};

function loadImages() {
    bgImage = new Image();
    bgImage.onload = function() {
        // show the background image
        bgReady = true;
    };
    bgImage.src = "images/background.png";

    rockImage = new Image();
    rockImage.onload = function() {
        // show the rock image
        rockReady = true;
    };
    rockImage.src = "images/rock.png";

    heroImage = new Image();
    heroImage.onload = function() {
        // show the hero image
        heroReady = true;
    };
    heroImage.src = "images/hero.png";

    monsterImage = new Image();
    monsterImage.onload = function() {
        // show the monster image
        monsterReady = true;
    };
    monsterImage.src = "images/monster.png";

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
        speed: 5
    },
    monster: {
        X: 0,
        Y: 0,
        hitWall: { X: false, Y: false },
        moveLeft: false,
        moveUp: false,
        speed: 3
    },
    princess: {
        X: 0,
        Y: 0,
        hitWall: { X: false, Y: false },
        moveLeft: false,
        moveUp: false,
        speed: 5
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
            X: Math.ceil(Math.random() * (canvas.width - 54) + 54) - 35,
            Y: Math.ceil(Math.random() * (canvas.height - 64) + 64) - 64
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

    updateScore();

    // checking if monster hit the wall then chnage the hiWall value
    checkIfHitWall("monster");

    //If monster hit wall, change direction; if not, continue on his path
    // hitWall("monster", "X");
    // hitWall("monster", "Y");

    // chase("hero", "princess");

    chase("monster", "princess");
    // hitObstacleYet("hero", "rock");

    // checking if princess hit the wall then chnage the hiWall value
    checkIfHitWall("princess");

    //If princess hit wall, change direction; if not, continue on her path
    hitWall("princess", "X");
    hitWall("princess", "Y");
};

function wrapAround() {
    if (chars.hero.X > canvas.width - 10) {
        chars.hero.X = 3;
    }

    if (chars.hero.X < 2) {
        chars.hero.X = canvas.width - 10;
    }

    // Move player back when he is off screen - Y axis
    if (chars.hero.Y > canvas.height - 10) {
        chars.hero.Y = 3;
    }

    if (chars.hero.Y < 2) {
        chars.hero.Y = canvas.height - 10;
    }
}

function controlHero() {
    // Player is holding up key
    let isBlockedResult = obstacles.map(val => isBlocked("hero", val));
    isBlockedResult = isBlockedResult.find(val => typeof val == "string");

    if (38 in keysDown && isBlockedResult !== "B") {
        chars.hero.Y -= chars.hero.speed;
        return;
    }
    // Player is holding down key
    if (40 in keysDown && isBlockedResult !== "T") {
        chars.hero.Y += chars.hero.speed;
        return;
    }
    // Player is holding left key
    if (37 in keysDown && isBlockedResult !== "R") {
        chars.hero.X -= chars.hero.speed;
        return;
    }
    // Player is holding right key
    if (39 in keysDown && isBlockedResult !== "L") {
        chars.hero.X += chars.hero.speed;
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

function updateScore() {
    if (hasCaught("hero", "monster")) {
        // Update caught number
        caughtNum += 1;
        // Pick a new location for the monster randomly.
        chars.monster.X =
            Math.ceil(Math.random() * (canvas.width - 54) + 54) - 35;
        chars.monster.Y =
            Math.ceil(Math.random() * (canvas.height - 64) + 64) - 64;
    }

    if (hasCaught("monster", "princess")) {
        // Deduct the score;
        caughtNum -= 1;
        // Pick a new location for the monster randomly.
        chars.princess.X =
            Math.ceil(Math.random() * (canvas.width - 54) + 54) - 35;
        chars.princess.Y =
            Math.ceil(Math.random() * (canvas.height - 64) + 64) - 64;
    }
}

function checkIfHitWall(char) {
    if (chars[char].X > canvas.width - 10 || chars[char].X < 10) {
        chars[char].hitWall.X = true;
    }
    if (chars[char].Y > canvas.height - 10 || chars[char].Y < 10) {
        chars[char].hitWall.Y = true;
    }
}

//this function check if the characters hit walls or not then change their direction base on their original direction
function hitWall(char, axis) {
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

//check if user hit the obstacle
// function hitObstacleYet(char) {
//     if (
//         chars[char].X <= rockX + 20 &&
//         rockX <= chars[char].X + 20 &&
//         chars[char].Y <= rockY + 20 &&
//         rockY <= chars[char].Y + 20
//     ) {
//         return true;
//     } else return false;
// }

//check if 2 characters touching each other
function hasCaught(char1, char2) {
    if (
        chars[char1].X <= chars[char2].X + 32 &&
        chars[char2].X <= chars[char1].X + 32 &&
        chars[char1].Y <= chars[char2].Y + 32 &&
        chars[char2].Y <= chars[char1].Y + 32
    ) {
        return true;
    } else return false;
}

/**
 * This function, render, runs as often as possible.
 */
const render = function() {
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

    ctx.font = "20px Georgia";
    ctx.strokeText(`${SECONDS_PER_ROUND - elapsedTime}`, 10, 30);
    ctx.strokeText(`Score: ${caughtNum}`, 10, 460);
    ctx.strokeText(
        `Best: ${applicationState.highScore.user} : ${applicationState.highScore.score}`,
        180,
        30
    );
};

//checking if applicationState > isGameOver is true then do a series of steps.
function GameEnd() {
    if (elapsedTime >= SECONDS_PER_ROUND) {
        applicationState.isGameOver = true;
        if (!updateHighscore()) {
            alert("GAME OVER!");
        }
        return true;
    } else {
        return false;
    }
}

function updateHighscore() {
    if (caughtNum >= applicationState.highScore.score) {
        applicationState.highScore.user = prompt(
            "You have the highest scrore, please enter your name:"
        );
        if (!applicationState.highScore.user) {
            applicationState.highScore.user = "Anonymous";
        }
        applicationState.highScore.score = caughtNum;
        applicationState.highScore.date = new Date();
        applicationState.highScoreList.unshift(applicationState.highScore);
        localStorage.setItem(
            "monsterchasing1",
            JSON.stringify(applicationState)
        );
        return true;
    } else return false;
}

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
    getAppState();
    applicationState.isGameOver = false;
}

function refresh() {
    window.location.href = window.location.href;
    getAppState();
    applicationState.isGameOver = false;
}

function getAppState() {
    applicationState = JSON.parse(localStorage.getItem("monsterchasing1")) || {
        isGameOver: false,
        highScore: { user: "no-one-yet", score: 0 },
        highScoreList: []
    };
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
createObstacles(5);
loadImages();
setupKeyboardListeners();
main();
