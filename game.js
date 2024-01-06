"use strict";

const FLOOR = ' '
const MINE = '💣'
const LIVE = '♥'
const NORMAL = '😃'
const LOSE = '🤯'
const WIN = '😎'
const FLAG = '🚩'


var gSafeClicks
var gBoard
var gLives
var timerInterval


var gLevel = {
    SIZE: 4,
    MINES: 2,

}


var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    gStateStack: [],
    gIsUndoEnabled: false
}

function onInit() {

    gBoard = buildBoard()
    setRandomMines()
    setMinesNegsCount(gBoard)
    renderBoard(gBoard, '.board-container')
    gGame.isOn = false
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gLives = 3
    gSafeClicks = 3
    setInitialLives()
    renderLives()
    
    
    document.querySelector('.smiley-btn').innerText = NORMAL
}


function onSafeClick() {
    if (gSafeClicks > 0) {
        var coveredNonMineCells = getCoveredNonMineCells(gBoard)
        if (coveredNonMineCells.length > 0) {
            var randomCell = coveredNonMineCells[getRandomInt(0, coveredNonMineCells.length - 1)]
            randomCell.isShown = true
            renderBoard(gBoard, '.board-container')
            setTimeout(function () {
                randomCell.isShown = false
                renderBoard(gBoard, '.board-container')
            }, 2000);

            gSafeClicks--
        }
    }
}

function markSafeClick(cell) {
    cell.isSafeClick = true
    renderBoard(gBoard, '.board-container')
}

function unmarkSafeClick(cell) {
    cell.isSafeClick = false
    renderBoard(gBoard, '.board-container')
}


function getCoveredNonMineCells(board) {
    var coveredNonMineCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            if (!cell.isShown && !cell.isMarked && !cell.isMine) {
                coveredNonMineCells.push(cell)
            }
        }
    }
    return coveredNonMineCells
}

function copyBoard(board) {
    var copiedBoard = []

    for (var i = 0; i < board.length; i++) {
        copiedBoard[i] = board[i].slice()
    }

    return copiedBoard
}

function undo() {
    if (gGame.gStateStack.length > 1) {
        gGame.gStateStack.pop() // Remove the current state
        gBoard = copyBoard(gGame.gStateStack[gGame.gStateStack.length - 1])
        renderBoard(gBoard, '.board-container')
    }
    else {
        onInit()
    }
}

function onCellClicked(elCell, i, j) {
    const cell = gBoard[i][j]

    if (!gGame.isOn) {
        // If the game is not started, set mines after the first click
        
        gGame.isOn = true;

        // Ensure the first clicked cell is not a mine
        if (cell.isMine) {
            cell.isMine = false
            setMinesNegsCount(gBoard);
        }

        if (!timerInterval) {
            startTimer()
        }
    }

    if (!cell.isShown && !cell.isMarked) {
        cell.isShown = true;

        if (cell.isMine) {

            --gLives
            renderLives()
            if (gLives === 0) {
                gGame.isOn = false
                revealAllMines(gBoard, i, j)
                gameOver()
                clearInterval(timerInterval)
                
                return
            }
        } else {
            if (cell.minesAroundCount === 0) {
                expandShown(gBoard, i, j)
            }
        }
        renderBoard(gBoard, '.board-container')
        checkGameOver()
    }
}

function onCellMarked(elCell, event) {

    const i = parseInt(elCell.classList[1].split('-')[1]) // Extracts second element after split
    const j = parseInt(elCell.classList[1].split('-')[2])
    const cell = gBoard[i][j]

    if (!cell.isShown) {
        // Check if it's a right-click
        const isRightClick = event && event.button === 2 // 2 represents the right mouse button
        if (isRightClick) {
            cell.isMarked = !cell.isMarked
        }

        if (gGame.gIsUndoEnabled) {
            gGame.gStateStack.push(copyBoard(gBoard))
        }
        renderBoard(gBoard, '.board-container')
        checkGameOver()

        event.preventDefault()
    }
}

function getCellContent(cell) {
    if (cell.isMarked) return FLAG
    if (cell.isShown) {
        if (cell.isMine) {
            return MINE

        } else if (cell.minesAroundCount > 0) { // if there is mine , add to count +1 
            return cell.minesAroundCount + 1
        } else {
            return '' // if not, return empty cell
        }
    }
    return FLOOR;
}
// check if the game end by cell
function checkGameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j];
            if (cell.isMine && cell.isShown) continue
            if (cell.isMine && cell.isMarked) continue
            if (!cell.isMine && cell.isShown) continue
            return false;
        }
    }
    isVictory()

    return true
}


// count cell neighbor and avoid mines
function expandShown(board, row, col) {
    for (var i = row - 1; i <= row + 1; i++) {
        for (var j = col - 1; j <= col + 1; j++) {
            if (i >= 0 && i < board.length && j >= 0 && j < board[0].length) {
                const cell = board[i][j]
                if (!cell.isMine && !cell.isShown) {
                    cell.isShown = true
                    if (cell.minesAroundCount === 0) {
                        expandShown(gBoard, i, j)
                    }
                }
            }
        }
    }
}


//Counts mines around specified cell
function countNeighbors(rowIdx, colIdx, mat) {
    var negCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= mat.length) continue

        // if next cell is mine is count it.
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue
            if (i === rowIdx && j === colIdx) continue

            if (mat[i][j].isMine) negCount++
        }
    }
    return negCount
}

//game level parameters
function setLevel(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    onInit()
    hideGameOverModal()
    clearInterval(timerInterval)
    updateTimerDisplay()
}

// revealMines if lives over
function revealAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine) {
                board[i][j].isShown = true
            }
        }
    }
}

function setRandomMines() {
    var minesCount = 0
    while (minesCount < gLevel.MINES) {
        // sets the mines in random place
        const row = getRandomInt(0, gBoard.length - 1)
        const col = getRandomInt(0, gBoard[0].length - 1)
        console.log('Trying to place mine at:', row, col)

        // if there is no mine, set it
        if (!gBoard[row][col].isMine) {
            gBoard[row][col].isMine = true
            minesCount++
        }
    }
}

// Counts mines around.
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine) {
                board[i][j].minesAroundCount = countNeighbors(i, j, board) //Sets the count of neighboring mines for a cell on the game board.
            }
        }
    }
}

function toggleDarkMode() {
    var body = document.body;
    var isDarkMode = body.classList.contains('dark-mode');
    if (isDarkMode) {
        body.classList.remove('dark-mode');
        document.getElementById('darkModeBtn').innerText = 'Enable Dark Mode';
    } else {
        body.classList.add('dark-mode');
        document.getElementById('darkModeBtn').innerText = 'Disable Dark Mode';
    }
}

// updates the lives
function renderLives() {
    var elLive = document.querySelector('.life')
    elLive.innerText = LIVE.repeat(gLives)
    
}

function setInitialLives() {
    gLives = (gLevel.SIZE === 4) ? 2 : 3;
}


// update game if its over
function gameOver() {
    document.querySelector('.smiley-btn').innerText = LOSE
    clearInterval(timerInterval)
    revealMinesOnBoard(gBoard);
    gLives = 3
    renderLives()
    
    // document.querySelector('.smiley-btn').innerText = NORMAL
}

function isVictory() {
    document.querySelector('.smiley-btn').innerText = WIN
    clearInterval(timerInterval)
    onInit()
    renderLives()
}

function resetGame() {
    clearInterval(timerInterval)
    onInit()
    hideGameOverModal()
    updateTimerDisplay()
    document.querySelector('.smiley-btn').innerText = NORMAL

}

// update the game over
function hideGameOverModal() {
    var elMsg = document.querySelector('.modal')
    elMsg.style.display = 'none'
}

function updateTimerDisplay() {
    var minutes = Math.floor(gGame.secsPassed / 60)
    var seconds = gGame.secsPassed % 60
    var formattedTime = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds

    document.querySelector('.timer').innerText = 'Time: ' + formattedTime
}

function startTimer() {
    timerInterval = setInterval(function () {
        gGame.secsPassed++;
        updateTimerDisplay()
    }, 1000)
}


