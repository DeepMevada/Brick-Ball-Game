const canvas = document.getElementById("brickball");
const ctx = canvas.getContext("2d");
ctx.lineWidth = 3;
canvas.style.border = "2px solid #000";

const PADDLE_WIDTH = 150;
const PADDLE_HEIGHT = 25;
const PADDLE_BOTTOM = 20;
const BALL_RADIUS = 10;
const SCORE_UNIT = 10;
const MAX_LEVEL = 5;
let GAME_OVER = false;
let SCORE = 0;
let LEVEL = 1;
let LIFE = 3;
let moveleft = false;
let moveright = false;

document.addEventListener("keydown", function (event) {
    if (event.keyCode == 37 || event.keyCode == 65) {
        moveleft = true;
    } else if (event.keyCode == 39 || event.keyCode == 68) {
        moveright = true;
    }
})

document.addEventListener("keyup", function (event) {
    if (event.keyCode == 37 || event.keyCode == 65) {
        moveleft = false;
    } else if (event.keyCode == 39 || event.keyCode == 68) {
        moveright = false;
    }
})


const paddle = {
    x: canvas.width / 2 - PADDLE_WIDTH / 2,
    y: canvas.height - PADDLE_BOTTOM - PADDLE_HEIGHT,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 7
}

function drawPaddle() {
    ctx.fillStyle = "#FF9800";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    ctx.strokeStyle = "#000";
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function movePaddle() {
    if (moveleft && paddle.x > 20) {
        paddle.x -= paddle.speed;
    } else if (moveright && paddle.x + paddle.width < canvas.width - 20) {
        paddle.x += paddle.speed;
    }
}

const ball = {
    x: canvas.width / 2,
    y: paddle.y - BALL_RADIUS,
    radius: BALL_RADIUS,
    speed: 5,
    dx: 5 * (Math.random() * 2 - 1),
    dy: -5
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.closePath();
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = paddle.y - BALL_RADIUS;
    ball.dx = 4 * (Math.random() * 2 - 1);
    ball.dy = -4;
}

function ballWallCollision() {
    if (ball.x + ball.radius > canvas.width - 5 || ball.x - ball.radius < 5) {
        ball.dx = -ball.dx;
        BOUNCE.play();
    }

    if (ball.y - ball.radius < 5) {
        ball.dy = -ball.dy;
        BOUNCE.play();
    }

    if (ball.y + ball.radius > canvas.height) {
        LOSE.play();
        LIFE--;
        resetBall();
    }
}

function ballPaddleCollision() {
    let bottomofBall = ball.y + ball.radius;
    let topofPaddle = paddle.y;
    let leftofPaddle = paddle.x;
    let rightofPaddle = paddle.x + paddle.width;

    if (bottomofBall >= topofPaddle
        && ball.x >= leftofPaddle
        && ball.x + ball.radius <= rightofPaddle) {

        BOUNCE.play();
        let collidePoint = ball.x - (paddle.x + paddle.width / 2);

        collidePoint = collidePoint / (paddle.width / 2);

        let angle = collidePoint * Math.PI / 3;

        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = -ball.speed * Math.cos(angle);
    }

}


const brick = {
    row: 2,
    column: 10,
    width: 60,
    height: 20,
    offsetLeft: 30,
    distanLeft: 15,
    offsetTop: 15,
    marginTop: 40,
    fillColor: "#000",
    strokeColor: "#FF9800"
}

let bricks = [];

function createBricks() {
    for (let r = 0; r < brick.row; r++) {
        bricks[r] = [];
        for (let c = 0; c < brick.column; c++) {
            bricks[r][c] = {
                x: c * (brick.distanLeft + brick.width) + brick.offsetLeft,
                y: r * (brick.offsetTop + brick.height) + brick.offsetTop + brick.marginTop,
                status: true
            }
        }
    }
}

createBricks();

function drawBricks() {
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            let b = bricks[r][c];
            if (b.status) {
                ctx.fillStyle = brick.fillColor;
                ctx.fillRect(b.x, b.y, brick.width, brick.height);
                ctx.strokeStyle = brick.strokeColor;
                ctx.strokeRect(b.x, b.y, brick.width, brick.height);
            }
        }
    }
}

function ballBrickCollision() {
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            let b = bricks[r][c];
            if (b.status) {
                if (ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brick.width
                    && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height) {

                    HIT.play();
                    ball.dy = - ball.dy;
                    b.status = false;
                    SCORE += SCORE_UNIT;
                }
            }
        }
    }
}

function showStats(text, textX, textY, img, imgX, imgY) {
    ctx.fillStyle = "#000";
    ctx.font = "25px Consolas";
    ctx.fillText(text, textX, textY);

    ctx.drawImage(img, imgX, imgY, width = 25, height = 25);
}

function levelUp() {
    let isLevelDone = true;
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            isLevelDone = isLevelDone && (!bricks[r][c].status);
        }
    }

    if (isLevelDone) {
        if (LEVEL >= MAX_LEVEL) {
            showWin();
            GAME_OVER = true;
            return;
        }

        brick.row++;
        createBricks();
        ball.speed += 1;
        paddle.speed += 1;
        resetBall();
        LEVEL++;
    }
}

function gameOver() {
    if (LIFE <= 0) {
        showLose();
        GAME_OVER = true;
    }
}

function draw() {
    drawPaddle();

    drawBall();

    drawBricks();

    showStats(SCORE, 35, 25, scoreImg, 5, 5);
    showStats(LIFE, canvas.width - 25, 25, lifeImg, canvas.width - 55, 5);
    ctx.fillText("LEVEL: ", canvas.width / 2 - 60, 25);
    ctx.fillText(LEVEL, canvas.width / 2 + 30, 25);
}

function update() {
    movePaddle();

    moveBall();

    ballWallCollision();

    ballPaddleCollision();

    ballBrickCollision();

    levelUp();

    gameOver();

}



function gameloop() {
    ctx.drawImage(bgImg, 0, 0);
    draw();
    update();
    if (!GAME_OVER) {
        requestAnimationFrame(gameloop);
    }
}

gameloop();

const gameover = document.getElementById("gameover");
const youwin = document.getElementById("youwin");
const youlose = document.getElementById("youlose");
const restart = document.getElementById("restart");

restart.addEventListener("click", function () {
    location.reload();
})

function showWin() {
    gameOver.style.display = "block";
    youwin.style.display = "block";
}

function showLose() {
    gameOver.style.display = "block";
    youlose.style.display = "block";
}