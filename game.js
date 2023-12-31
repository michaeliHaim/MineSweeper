"use strict";

const FLOOR = ' ' 
const MINE = '💣'
const LIVE = '♥'
const NORMAL = '😃'
const LOSE = '🤯'
const WIN = '😎'
var gBoard
var gLives

var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}


function onInit() {
    
    gBoard = buildBoard()
    setRandomMines()
    setMinesNegsCount(gBoard);
    renderBoard(gBoard, '.board-container');
    gGame.isOn = false
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gLives = 3
    // clearInterval(timerInterval)

}

function buildBoard() {
    const board = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
        }
    }
    return board;
}

function setRandomMines() {
    var minesCount = 0
    while (minesCount < gLevel.MINES) {
        const row = getRandomInt(0, gBoard.length - 1)
        const col = getRandomInt(0, gBoard[0].length - 1)
        console.log('Trying to place mine at:', row, col)

        if (!gBoard[row][col].isMine) {
            gBoard[row][col].isMine = true
            minesCount++
        }
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine) {
                board[i][j].minesAroundCount = countNeighbors(i, j, board)
            }
        }
    }
}

function setLevel(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    onInit()
    hideGameOverModal()
    clearInterval(timerInterval)
    updateTimerDisplay()
    // startTimer()
}
function renderBoard(board, selector) {
    var strHTML = '<table><tbody>'
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j];
            const className = `cell cell-${i}-${j} ${cell.isMine ? 'mine' : ''}`;
            strHTML += `<td 
            class="${className}" onclick="onCellClicked(this, 
                ${i}, ${j})" oncontextmenu="onCellMarked(this, event)
                return false;">${getCellContent(cell)}</td>`;
        }
        strHTML += '</tr>';
    }
    strHTML += '</tbody></table>';
    const elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function onCellClicked(elCell, i, j) {
    const cell = gBoard[i][j]
    

    if (!gGame.isOn) {
        // If the game is not started, set mines after the first click
        
        gGame.isOn = true;
        
        // Ensure the first clicked cell is not a mine
        if (!cell.isMine) {
            setRandomMines();
            setMinesNegsCount(gBoard);
            // startTimer()
        }

        if (!timerInterval) {
            startTimer()
        }
    }

    if (!cell.isShown && !cell.isMarked) {
        cell.isShown = true;

        if (cell.isMine ) {
            // console.log('Game Over!');
            // revealAllMines(gBoard);
            // var elMsg = document.querySelector('.modal');
            // elMsg.style.display = 'block'
            --gLives
            renderLives()
            if(gLives === 0){
                var elMsg = document.querySelector('.modal');
                elMsg.style.display = 'block'
                gameOver()
                clearInterval(timerInterval)
                revealAllMines(gBoard,i ,j)
                
            }
        } else {
            if (cell.minesAroundCount === 0) {
                expandShown(gBoard, i, j);
            }
        }
        renderBoard(gBoard, '.board-container');
        checkGameOver();
    }
}

function onCellMarked(elCell,event) {
   
    const i = parseInt(elCell.classList[1].split('-')[1])
    const j = parseInt(elCell.classList[1].split('-')[2])
    const cell = gBoard[i][j]

    if (!cell.isShown) {
        // Check if it's a right-click
        const isRightClick = event && event.button === 2; // 2 represents the right mouse button
        if (isRightClick) {
            cell.isMarked = !cell.isMarked
        }
        renderBoard(gBoard, '.board-container')
        checkGameOver()
       
        event.preventDefault()
    }
}

function getCellContent(cell) {
    if (cell.isMarked) return '🚩'
    if (cell.isShown) {
        return cell.isMine ? MINE : cell.minesAroundCount + 1;
    }
    return FLOOR;
}

function checkGameOver() {
   
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const cell = gBoard[i][j];

            if (!(cell.isMine && cell.isMarked) && !(cell.isShown && !cell.isMine)) {
                return
            }
        }
    }
  
}

function expandShown (board, row, col) {
    for (var i = row - 1; i <= row + 1; i++) {
        for (var j = col - 1; j <= col + 1; j++) {
            if (i >= 0 && i < board.length && j >= 0 && j < board[0].length) {
                const cell = board[i][j];
                if (!cell.isMine && !cell.isShown) {
                    cell.isShown = true;
                    if (cell.minesAroundCount === 0) {
                        expandShown(board, i, j);
                    }
                }
            }
        }
    }
}

function countNeighbors(rowIdx, colIdx, mat) {
    var negCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= mat.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue
            if (i === rowIdx && j === colIdx) continue

            if (mat[i][j].isMine) negCount++
        }
    }
    return negCount
}


function revealAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine) {
                board[i][j].isShown = true;
            }
        }
    }
}

function renderLives(){
    var elLive = document.querySelector('.life')
    elLive.innerText = LIVE.repeat(gLives)
}

function gameOver() {
    
    gLives = 3
    onInit()
    renderLives()
}
function hideGameOverModal() {
    var elMsg = document.querySelector('.modal');
    elMsg.style.display = 'none';
}

function updateTimerDisplay() {
    document.getElementById('timer').innerText = 'Time: ' + gGame.secsPassed + ' seconds';
}
