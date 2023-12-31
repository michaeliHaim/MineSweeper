'use strict'



var timerInterval

function startTimer() {
    timerInterval = setInterval(function () {
        gGame.secsPassed++;
        updateTimerDisplay();
    }, 1000);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
