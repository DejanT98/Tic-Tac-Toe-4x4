const statusDisplay = document.querySelector('.game-status');
const currentPlayerDisplay = document.querySelector('.current-player');
const modal = $('.modal');
const player = "X";
const computer = "O";

let gameActive = true;
let moveNumber = 0;
let currentPlayer = "";

let gameState = ["", "", "", "",
    "", "", "", "",
    "", "", "", "",
    "", "", "", ""];

const winningConditions = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15],
    [0, 4, 8, 12],
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],
    [0, 5, 10, 15],
    [3, 6, 9, 12],
    [0, 1, 4, 5],
    [1, 2, 5, 6],
    [2, 3, 6, 7],
    [4, 5, 8, 9],
    [5, 6, 9, 10],
    [6, 7, 10, 11],
    [8, 9, 12, 13],
    [9, 10, 13, 14],
    [10, 11, 14, 15]
];

function setFirstPlayer() {
    clearInterval(random)
    currentPlayer = Math.random() > 0.5 ? player : computer;
    currentPlayerDisplay.innerHTML = currentPlayer;
    setTimeout(function () {
        if (currentPlayer === computer)
            document.querySelectorAll('.cell')[0].click()
    }, 500);
}

document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
document.querySelector('.game-restart').addEventListener('click', handleRestartGame);

let random = setInterval(function () {
    if (currentPlayerDisplay.textContent === player)
        currentPlayerDisplay.innerHTML = computer;
    else
        currentPlayerDisplay.innerHTML = player;
}, 100);
setTimeout(setFirstPlayer, 3000);

const winningMessage = () => 'Čestitamo, pobedili ste';
const loserMessage = () => 'Izgubili ste, više sreće drugi put';
const drawMessage = () => 'Nema pobednika';
const restartMessage = () => '';

function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
}

function handlePlayerChange() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    moveNumber++;
    setTimeout(function () {
        if (currentPlayer === computer) {
            document.querySelectorAll('.cell')[0].click();
        }
    }, 500);
    currentPlayerDisplay.innerHTML = currentPlayer;
}

function handleResultValidation() {
    let roundWon = false;
    let roundLost = false;
    for (let i = 0; i <= 18; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        let d = gameState[winCondition[3]];
        if (a === "" || b === "" || c === "" || d === "") {
            continue;
        }
        if (a === b && b === c && c === d && d === player) {
            roundWon = true;
            break
        }
        if (a === b && b === c && c === d && d === computer) {
            roundLost = true;
            break
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = winningMessage();
        modal.modal();
        gameActive = false;
        return;
    }

    if (roundLost) {
        statusDisplay.innerHTML = loserMessage();
        modal.modal();
        gameActive = false;
        return;
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusDisplay.innerHTML = drawMessage();
        modal.modal();
        gameActive = false;
        return;
    }

    handlePlayerChange();
}

function handleCellClick(clickedCellEvent) {
    let clickedCell;
    let clickedCellIndex;
    if (currentPlayer === player) {
        clickedCell = clickedCellEvent.target;
        clickedCellIndex = parseInt(
            clickedCell.getAttribute('data-cell-index')
        );
    } else {
        clickedCellIndex = findBestMove([...gameState]);
        clickedCell = document.querySelector(`div[data-cell-index="${clickedCellIndex}"]`);
    }

    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}
function handleRestartGame() {
    gameActive = true;
    moveNumber = 0;
    gameState = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
    document.querySelectorAll('.cell')
        .forEach(cell => cell.innerHTML = "");
    statusDisplay.innerHTML = restartMessage();
    setFirstPlayer();
}

function isMovesLeft(board) {
    for (let i = 0; i < 16; i++)
        if (board[i] === "")
            return true;
    return false;
}

function evaluate(board) {
    for (let i = 0; i <= 18; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];
        let d = board[winCondition[3]];

        if (a === b && b === c && c === d) {
            if (d === computer)
                return 10;
            else if (d === player)
                return -10;
        }
    }
    return 0;
}

function minimax(board, depth, isMax, alpha, beta) {
    score = evaluate(board);

    if (score === 10)
        return score - depth;

    if (score === -10)
        return score + depth;

    if (!isMovesLeft(board) || depth === 5 || moveNumber < 3)
        return 0;

    if (isMax) {
        let best = -Infinity;
        for (let i = 0; i < 16; i++) {
            if (board[i] === "") {
                board[i] = computer;
                moveNumber++;
                let val = minimax([...board], depth + 1, !isMax, alpha, beta);
                best = Math.max(best, val);
                alpha = Math.max(alpha, best);
                moveNumber--;
                board[i] = "";
                if (beta <= alpha)
                    break;
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 16; i++) {
            if (board[i] === "") {
                board[i] = player;
                moveNumber++;
                let val = minimax([...board], depth + 1, !isMax, alpha, beta);
                best = Math.min(best, val);
                beta = Math.min(beta, best);
                moveNumber--;
                board[i] = "";
                if (beta <= alpha)
                    break;
            }
        }
        return best;
    }
}

function findBestMove(board) {
    let bestVal = -Infinity;
    let index = -1;

    for (let i = 5; i < 16; i++) {
        if (board[i] === "") {
            board[i] = computer;
            moveNumber++;
            let moveVal = minimax([...board], 0, false);
            board[i] = "";
            moveNumber--;

            if (moveVal > bestVal) {
                index = i;
                bestVal = moveVal;
            }
        }
    }
    for (let i = 0; i < 5; i++) {
        if (board[i] === "") {
            board[i] = computer;
            moveNumber++;
            let moveVal = minimax([...board], 0, false);
            board[i] = "";
            moveNumber--;

            if (moveVal > bestVal) {
                index = i;
                bestVal = moveVal;
            }
        }
    }
    return index;
}