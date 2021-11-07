const canv = document.getElementById("main");
const footer = document.getElementById("footer");
const title = document.getElementById("GameTitle");
const bird = document.getElementById("bird");
const birdStaticImage = "url(../images/bird.png)";
const birdFlyImage = "url(../images/bird.gif)";

//panels
const scorePanel = document.getElementById('score');
const titlePanel = document.getElementById('title');

//results
const resultsPanel = document.getElementById('results');
const scoreResult = document.getElementById('scoreResult');
const bestResult = document.getElementById('bestResult');

//buttons
const restart = document.getElementById('restart');
const share = document.getElementById('share');

const gravity = 0.98;

var StartedGame;
let score = 0;
let bestScore = 0;
let timer = 0;
let gameIsStarted = false;
let gameOver = false;
let isFalling = false;
let isWaiting = true;
let isJumping = false;
let movingUnderPipe = false;


canv.addEventListener('click', function(e) {

    if (!gameIsStarted && !gameOver) {
        console.log('start game');
        init();
        jump();
        StartedGame = setInterval(update, 10);
    } else {
        if (!gameOver) {
            isWaiting = false;
            bird.classList.remove('waiting');
            jump();
        }
    }


});

restart.addEventListener('click', function(e) {
    e.stopPropagation();
    gameOver = false;
    clearPipes();
    init();
    isWaiting = true;
    bird.classList.add('waiting');
    StartedGame = setInterval(update, 10);
});

function init() {
    gameIsStarted = true;
    score = 0;

    bird.style = null;
    bird.style.background = birdFlyImage;
    bird.style.backgroundSize = "100% 100%";
    bird.classList.remove('waiting');

    scorePanel.innerHTML = score;
    scorePanel.style.display = "inline-block";
    titlePanel.style.display = "none";
    resultsPanel.style.display = "none";
    footer.style.background = "url(../images/bottom2.gif)";
    footer.style.backgroundSize = "100% 100%";

}

function update() {

    timer++;

    if (!isWaiting) {
        if (timer % 120 === 0) {
            spawnPipe();
        }
    }

    if (isFalling) {
        bird.style.bottom = (bird.getBoundingClientRect().bottom) - gravity * 4 + "px";
        bird.style.top = (bird.getBoundingClientRect().top) + gravity * 4 + "px";
    } else if (isJumping) {
        bird.style.bottom = (bird.getBoundingClientRect().bottom) + gravity * 0.5 + "px";
        bird.style.top = (bird.getBoundingClientRect().top) - gravity * 0.5 + "px";
    }

    let pipes = document.getElementsByClassName("pipe");

    Array.from(pipes).forEach((pipe) => {
        pipe.style.left = (pipe.getBoundingClientRect().right - 76) + "px";
        if (!isInViewport(pipe)) {
            pipe.remove();
        }
    });

    if (collided()) {
        console.log('collided');
        stopGame();
    }

    return;
}

function stopGame() {

    clearInterval(StartedGame);

    isFalling = false;
    isJumping = false;
    gameOver = true;
    gameIsStarted = false;

    bird.style.background = birdStaticImage;
    bird.style.backgroundSize = "100% 100%";
    if (score >= bestScore) {
        bestScore = score;
    }
    scoreResult.innerHTML = score;
    bestResult.innerHTML = bestScore;

    resultsPanel.style.display = "block";
    footer.style = null;
    return;
}

function jump() {
    console.log('jump');
    isFalling = false;
    isJumping = true;
    bird.style.transition = "transform linear 0.1s, rotate linear 0.1s";
    bird.style.transform = "rotateZ(-30deg)";

    setTimeout(function() {
        bird.style.transition = "transform linear 0.4s, rotate linear 0.4s";
        bird.style.transform = "rotateZ(0deg)";
        isJumping = false;
        isFalling = true;
    }, 90);
    return;
}

function spawnPipe() {

    var randomPosition = Math.floor(Math.random() * (110 - 70 + 1)) + 70;

    var newTopPipe = document.createElement("div");
    newTopPipe.classList.add('pipe');
    newTopPipe.classList.add('top');
    newTopPipe.style.top = -40 - (randomPosition - 70) + 'px';

    var newBottomPipe = document.createElement("div");
    newBottomPipe.classList.add('pipe');
    newBottomPipe.classList.add('bottom');
    newBottomPipe.style.bottom = randomPosition + 'px';

    canv.appendChild(newBottomPipe);
    canv.appendChild(newTopPipe);
}

function clearPipes() {

    let pipes = document.getElementsByClassName("pipe");

    Array.from(pipes).forEach((pipe) => {
        pipe.remove();
    });
}

function collided() {
    let f = footer.getBoundingClientRect();
    let b = bird.getBoundingClientRect();
    let pipes = document.getElementsByClassName("pipe");

    var footerVerticalMatch;
    var footerHorizontalMatch;
    var pipeVerticalMatch = false;
    var pipeHorizontalMatch = false;

    Array.from(pipes).forEach((pipe) => {

        var p = pipe.getBoundingClientRect();

        if ((b.top > p.top && b.top < p.bottom) || (b.bottom > p.top && b.bottom < p.bottom)) {
            pipeVerticalMatch = true;
        }

        if ((b.right > p.left && b.right < p.right) || (b.left < p.right && b.left > p.left)) {

            pipeHorizontalMatch = true;

            if (!movingUnderPipe) {
                score++;
                scorePanel.innerHTML = score;
            }
            console.log('match1');
            movingUnderPipe = true;

        } else {
            movingUnderPipe = false;
        }
    });

    if ((b.top > f.top && b.top < f.bottom) || (b.bottom > f.top && b.bottom < f.bottom)) {
        footerVerticalMatch = true;
    } else {
        footerVerticalMatch = false;
    }

    if ((b.right > f.left && b.right < f.right) || (b.left < f.right && b.left > f.left)) {
        footerHorizontalMatch = true;
    } else {
        footerHorizontalMatch = false;
    }

    if ((footerHorizontalMatch && footerVerticalMatch) || (pipeVerticalMatch && pipeHorizontalMatch)) {
        return true;
    } else {
        return false;
    }
}

function isInViewport(element) {
    var top = element.offsetTop;
    var left = element.offsetLeft;
    var width = element.offsetWidth;
    var height = element.offsetHeight;

    while (element.offsetParent) {
        element = element.offsetParent;
        top += element.offsetTop;
        left += element.offsetLeft;
    }

    return (
        top < (window.pageYOffset + window.innerHeight) &&
        left < (window.pageXOffset + window.innerWidth) &&
        (top + height) > window.pageYOffset &&
        (left + width) > window.pageXOffset
    );
}