const canv = document.getElementById("main");
const footer = document.getElementById("footer");
const title = document.getElementById("GameTitle");
const bird = document.getElementById("bird");
const birdStaticImage = "url(../images/bird.png)";
const birdFlyImage = "url(../images/bird.gif)";

//panels
const scorePanel = document.getElementById('score');
const titlePanel = document.getElementById('title');
const volume = document.getElementById('volume');

//results
const resultsPanel = document.getElementById('results');
const scoreResult = document.getElementById('scoreResult');
const bestResult = document.getElementById('bestResult');

//buttons
const restart = document.getElementById('restart');
const share = document.getElementById('share');

const buttons = document.getElementsByClassName('btn');

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

var footerVerticalMatch = false;
var footerHorizontalMatch = false;
var pipeVerticalMatch = false;
var pipeHorizontalMatch = false;
var coinVerticalMatch = false;
var coinHorizontalMatch = false;

var backtrack = new Audio('../music/soundtrack3.mp3');
backtrack.loop = true;
backtrack.volume = 0;
backtrack.play();

var isVolumeOn = false;

Array.from(buttons).forEach((button) => {
    button.addEventListener('mouseover', function(e) {
        var soundEffect = new Audio('../sounds/button.wav');
        soundEffect.volume = 0.1;
        soundEffect.play();
    });
    button.addEventListener('click', function(e) {
        var soundEffect = new Audio('../sounds/button_click.wav');
        soundEffect.volume = 0.1;
        soundEffect.play();
    });
});

volume.addEventListener('click', function(e) {

    e.stopPropagation();

    var $this = volume;

    if ($this.classList.contains('fa-volume-up')) {
        $this.classList.remove('fa-volume-up');
        $this.classList.add('fa-volume-off');
        backtrack.volume = 0;
        isVolumeOn = false;
    } else {
        $this.classList.remove('fa-volume-off');
        $this.classList.add('fa-volume-up');
        backtrack.volume = 0.2;
        isVolumeOn = true;
    }
});

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
            if (inViewport(bird)) {
                jump();
            }
        }
    }


});

restart.addEventListener('click', function(e) {
    e.stopPropagation();
    gameOver = false;
    clearPipes();
    clearCoins();
    init();
    isWaiting = true;
    bird.classList.add('waiting');
    if (isVolumeOn) {
        backtrack.volume = 0.2;
    }
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

    if (!gameOver) {

        timer++;

        let pipes = document.getElementsByClassName("pipe");

        let coins = document.getElementsByClassName("coin");

        if (!isWaiting) {
            if (timer % 120 === 0) {
                spawnPipe();
            }

            if (timer % 290 === 0) {
                spawnCoin();
            }

            if (timer % 20 === 0) {
                Array.from(pipes).forEach((pipe) => {
                    if (!isInViewport(pipe)) {
                        pipe.remove();
                    }
                });
                Array.from(coins).forEach((coin) => {
                    if (!isInViewport(coin)) {
                        coin.remove();
                    }
                });
            }
        }

        if (!inViewport(bird)) {
            bird.style.bottom = (bird.getBoundingClientRect().bottom) - gravity * 15 + "px";
            bird.style.top = (bird.getBoundingClientRect().top) + gravity * 15 + "px";
        }
        if (isFalling) {
            bird.style.bottom = (bird.getBoundingClientRect().bottom) - gravity * 4 + "px";
            bird.style.top = (bird.getBoundingClientRect().top) + gravity * 4 + "px";
        } else if (isJumping) {
            bird.style.bottom = (bird.getBoundingClientRect().bottom) + gravity * 0.5 + "px";
            bird.style.top = (bird.getBoundingClientRect().top) - gravity * 0.5 + "px";
        }

        Array.from(pipes).forEach((pipe) => {
            pipe.style.left = (pipe.getBoundingClientRect().right - 82) + "px";
        });

        Array.from(coins).forEach((coin) => {
            coin.style.left = (coin.getBoundingClientRect().right - 45.5) + "px";
        });

        if (collided(pipes, coins)) {
            stopGame();
        }

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
    if (isVolumeOn) {
        backtrack.volume = 0.05;
    }
    return;
}

function jump() {
    isFalling = false;
    isJumping = true;
    bird.style.transition = "transform linear 0.1s, rotate linear 0.1s";
    bird.style.transform = "rotateZ(-30deg)";

    setTimeout(function() {
        bird.style.transition = "transform linear 0.4s, rotate linear 0.4s";
        bird.style.transform = "rotateZ(0deg)";
        isJumping = false;
        isFalling = true;
    }, 85);
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

function spawnCoin() {

    var randomPosition = Math.floor(Math.random() * (520 - 10 + 1)) + 10;

    var newCoin = document.createElement("div");
    newCoin.classList.add('coin');
    newCoin.style.top = randomPosition + 'px';
    canv.appendChild(newCoin);
}

function clearCoins() {
    let coins = document.getElementsByClassName("coin");

    Array.from(coins).forEach((coin) => {
        coin.remove();
    });
}

function clearPipes() {

    let pipes = document.getElementsByClassName("pipe");

    Array.from(pipes).forEach((pipe) => {
        pipe.remove();
    });
}

function collided(pipes, coins) {

    let f = footer.getBoundingClientRect();
    let b = bird.getBoundingClientRect();

    footerVerticalMatch = false;
    footerHorizontalMatch = false;
    pipeVerticalMatch = false;
    pipeHorizontalMatch = false;
    coinVerticalMatch = false;
    coinHorizontalMatch = false;

    Array.from(pipes).forEach((pipe) => {

        var p = pipe.getBoundingClientRect();

        //y
        if ((b.top > p.top && b.top < p.bottom) || (b.bottom > p.top && b.bottom < p.bottom)) {
            pipeVerticalMatch = true;
        }

        //x
        if ((b.right > p.left && b.right < p.right) || (b.left < p.right && b.left > p.left)) {

            pipeHorizontalMatch = true;

            if (!movingUnderPipe) {
                score++;
                scorePanel.innerHTML = score;
            }
            movingUnderPipe = true;

        } else {
            movingUnderPipe = false;
        }
    });

    Array.from(coins).forEach((coin) => {

        var c = coin.getBoundingClientRect();

        //y
        if ((b.top > c.top && b.top < c.bottom) || (b.bottom > c.top && b.bottom < c.bottom)) {
            coinVerticalMatch = true;
        }

        //x
        if ((b.right > c.left && b.right < c.right) || (b.left < c.right && b.left > c.left)) {
            coinHorizontalMatch = true;
        }

        if (coinVerticalMatch && coinHorizontalMatch) {
            console.log('Got the coin :)');
            score++;
            scorePanel.innerHTML = score;
            var audio = new Audio('../sounds/coin.wav');
            audio.volume = 0.3;
            audio.play();
            coin.remove();
        }

    });



    //y
    if ((b.top > f.top && b.top < f.bottom) || (b.bottom > f.top && b.bottom < f.bottom)) {
        footerVerticalMatch = true;
    } else {
        footerVerticalMatch = false;
    }

    //x
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

//partly visible on the screen
function inViewport(el) {

    var r, html;
    if (!el || 1 !== el.nodeType) { return false; }
    html = document.documentElement;
    r = el.getBoundingClientRect();

    return (!!r &&
        r.bottom >= 0 &&
        r.right >= 0 &&
        r.top <= html.clientHeight &&
        r.left <= html.clientWidth
    );

}

//fully visible on the screen
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