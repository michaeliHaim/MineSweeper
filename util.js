'use strict'

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
            }
        }
    }
    return board;
}

function renderBoard(board, selector) {
    var strHTML = '<table><tbody>'
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j];
            const className = `cell cell-${i}-${j} ${cell.isMine ? 'mine' : ''}`;
            const style = cell.isShown && !cell.isMine && cell.minesAroundCount === 0 ? 'style="background-color: white;"' : ''
            strHTML += `<td ${style} class="${className}" onclick="onCellClicked(this, 
                ${i}, ${j})" oncontextmenu="onCellMarked(this, event)
                return false;">${getCellContent(cell)}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'
    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
