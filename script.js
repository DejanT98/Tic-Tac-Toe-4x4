const statusDisplay = document.querySelector('.game-status');
const currentPlayerDisplay = document.querySelector('.current-player');
const cells = document.querySelectorAll('.cell');
const modal = $('.modal');

const winningMessage = () => 'Čestitamo, pobedili ste';
const loserMessage = () => 'Izgubili ste, više sreće drugi put';
const drawMessage = () => 'Nema pobednika';
const afterRestartMessage = () => '';

cells.forEach(cell => cell.addEventListener('click', click));
document.querySelector('.game-restart').addEventListener('click', restartGame);

const player = "X";
const computer = "O";

let gameActive = true;
let moveNumber = 0;
let currentPlayer = "";
/**
 * Trenuto stanje igre
 */
let gameState = ["", "", "", "",
    "", "", "", "",
    "", "", "", "",
    "", "", "", ""];

/**
 * Niz koji sadrži sve pobedničke kombinacije u igri
 */
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

let random;
let firstPlayerCell;

/**
 * Podešavanje prvog igrača u partiji, u slučaju da je računar
 * pozvaće se funkcija computerClick
 */
function setFirstPlayer() {
    clearInterval(random);
    currentPlayer = Math.random() > 0.5 ? player : computer;
    currentPlayerDisplay.innerHTML = currentPlayer;
    if (currentPlayer === computer) {
        computerClick();
    }
}

/**
 * Simulira klik računara
 */
function computerClick() {
    setTimeout(function () {
        if (currentPlayer === computer)
            /*klikne na prvo polje i pokreće funkciju click
            * koja kasnije poziva findBestMove
            */
            cells[0].click();
    }, 500);
}

/**
 * Podešava interval koji se izvršava na svakih 100ms.
 * Poziva se na počeku igre za vreme dok se bira prvi igrač
 */
function setRandomInterval() {
    random = setInterval(() => {
        if (currentPlayerDisplay.textContent === player)
            currentPlayerDisplay.innerHTML = computer;
        else
            currentPlayerDisplay.innerHTML = player;
    }, 100);
}

setRandomInterval();
setTimeout(setFirstPlayer, 3000);

/**
 * Postavlja potez igrača
 * @param {HTMLDivElement} clickedCell 
 * @param {number} clickedCellIndex 
 */
function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
}

/**
 * Vrši promenu trenutnog igrača i povećava broj poteza odigranih u igri
 */
function changePlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    moveNumber++;
    if (currentPlayer === computer) {
        computerClick();
    }
    currentPlayerDisplay.innerHTML = currentPlayer;
}

/**
 * Proverava da li je igra završena,
 * u slučaju da jeste ispisuje poruku sa rezultatom igre
 */
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
        if (a === b && b === c && c === d) {
            if (d === player) {
                roundWon = true;
            } else if (d === computer) {
                roundLost = true;
            }
            document.querySelector(`div[data-cell-index="${winCondition[0]}"]`)
                .style.background = '#722620';
            document.querySelector(`div[data-cell-index="${winCondition[1]}"]`)
                .style.background = '#722620';
            document.querySelector(`div[data-cell-index="${winCondition[2]}"]`)
                .style.background = '#722620';
            document.querySelector(`div[data-cell-index="${winCondition[3]}"]`)
                .style.background = '#722620';
            break;
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = winningMessage();
        modal.modal({
            backdrop: 'static',
            keyboard: false
        });
        gameActive = false;
        return;
    }

    if (roundLost) {
        statusDisplay.innerHTML = loserMessage();
        modal.modal({
            backdrop: 'static',
            keyboard: false
        });
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

    changePlayer();
}
/**
 * Izvršava se na klik korisnika ili računara.
 * Proverava da li je igra aktivna i da li je traženo polje slobodno,
 * ukoliko su ispunjeni uslovi zauzima to polje
 * @param  {Event} clickedCellEvent
 */
function click(clickedCellEvent) {
    let clickedCell;
    let clickedCellIndex;
    if (currentPlayer === player) {
        clickedCell = clickedCellEvent.target;
        clickedCellIndex = parseInt(
            clickedCell.getAttribute('data-cell-index')
        );
        if (moveNumber === 0) {
            firstPlayerCell = clickedCellIndex;
        }
    } else if (currentPlayer === computer) {
        clickedCellIndex = findBestMove([...gameState]);
        clickedCell = document.querySelector(`div[data-cell-index="${clickedCellIndex}"]`);
    } else {
        return;
    }

    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}
/**
 * Postavlja parametre igre na početne vrednosti
 */
function restartGame() {
    gameActive = true;
    moveNumber = 0;
    currentPlayer = "";
    gameState = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
    cells.forEach(cell => cell.innerHTML = "");
    cells.forEach(cell => cell.style.background = '#30110D');
    statusDisplay.innerHTML = afterRestartMessage();
    setRandomInterval();
    setTimeout(setFirstPlayer, 3000);
}

/**
 * Proverava da li još ima praznih polja
 * @param {string[]} board
 */
function isMovesLeft(board) {
    for (let i = 0; i < 16; i++)
        if (board[i] === "")
            return true;
    return false;
}

/**
 * Vraća broj poena u zavisnosti od statusa igre
 * @param {string[]} board
 * @return {number}
 */
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

/**
 * Minimax algoritam
 * @param {string[]} board 
 * @param {number} depth 
 * @param {boolean} isMax 
 * @param {number} alpha 
 * @param {number} beta 
 * @return {number} Najbolji rezultat posle poteza
 */
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

/**
 * Pronalaženje najboljeg poteza za računar
 * @param {string[]} board 
 * @return {number} indeks najpovoljnig polja za potez
 */
function findBestMove(board) {
    if (firstPlayerCell === 5 && moveNumber === 1) {
        return 6;
    }

    let bestIndexes = [5, 6, 9, 10];

    let bestVal = -Infinity;
    let index = -1;

    for (let i = 0; i < 16; i++) {
        if (board[i] === "") {
            board[i] = computer;
            moveNumber++;
            let moveVal = minimax([...board], 0, false);
            board[i] = "";
            moveNumber--;

            if (moveVal > bestVal || (moveVal === bestVal && bestIndexes.includes(i))) {
                index = i;
                bestVal = moveVal;
            }
        }
    }
    return index;
}