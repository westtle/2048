let score = {
	currentScore: 0,
	bestScore: 0
};

let gameBoard = [
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0]
];

// HTML.
const gameBoardHTML = document.querySelector(".__gameboard");
const currentScoreHTML = document.querySelector("._current");
const bestScoreHTML = document.querySelector("._best");

const resetButton = document.querySelector(".__reset button");

function slide(rowOrCol, direction) {
	let filtered; // aka removed the 0.

	if (direction == "up" || direction == "down") {
		let column = [gameBoard[0][rowOrCol], gameBoard[1][rowOrCol], gameBoard[2][rowOrCol], gameBoard[3][rowOrCol]];
		filtered = column.filter(n => n != 0);
	} else {
		filtered = gameBoard[rowOrCol].filter(n => n != 0);
	};

	if (direction == "right" || direction == "down") {
		filtered.reverse();
	};

	// See if the number should combine or not.
	for (i = 0; i < filtered.length; i++) {
		let reversedI = (i == 0) ? 3 : (i == 1) ? 2 : (i == 2) ? 1 : null;

		let tileToAnimate;

		// Find element to animate.
		if (direction == "left") {
			tileToAnimate = document.getElementById(`${rowOrCol}-${i}`);
		} else if (direction == "right") {
			tileToAnimate = document.getElementById(`${rowOrCol}-${reversedI}`);
		} else if (direction == "up") {
			tileToAnimate = document.getElementById(`${i}-${rowOrCol}`);
		} else if (direction == "down") {
			tileToAnimate = document.getElementById(`${reversedI}-${rowOrCol}`);
		};

		if (filtered[i] == filtered[i+1]) {
			filtered[i] *= 2;
			filtered[i+1] = 0;
			score.currentScore += filtered[i];
			
			tileToAnimate.classList.remove("pop-up_");
			setTimeout(() => {
				tileToAnimate.classList.add("pop-up_");
			}, 200)

			displayScore();
		};
	};

	let filtered2 = filtered.filter(n => n != 0);

	// Moving the 0 to the last position & take only the needed value by using splice().
	filtered2.push(0);
	filtered2.push(0);
	filtered2.push(0);
	filtered2.push(0);

	// Return based on direction.
	if (direction == "left") {
		return filtered2.splice(0, 4);
	} else if (direction == "right") {
		return filtered2.splice(0, 4).reverse();
	} else if (direction == "up") {
		let filtered3 = filtered2.splice(0, 4);

		for (let i = 0; i < filtered3.length; i++) {
			gameBoard[i][rowOrCol] = filtered3[i];
		};

	} else if (direction == "down") {
		let filtered3 = filtered2.splice(0, 4).reverse();

		for (let i = 3; i >= 0; i--) {
			gameBoard[i][rowOrCol] = filtered3[i];
		};
	};
};

function spawnTwoOrFour() {
	let chance = Math.floor(Math.random() * 100);

	let randomRow = Math.floor(Math.random() * 4);
	let randomColumn = Math.floor(Math.random() * 4);
	let randomId = `${randomRow}-${randomColumn}`;

	if (!isGameBoardFull()) {
		if (gameBoard[randomRow][randomColumn] == 0) {
			let randomTile = document.getElementById(randomId);

			randomTile.classList.remove("pop-up_");

			if (chance >= 80) {
				randomTile.textContent = "4";
				gameBoard[randomRow][randomColumn] = 4;
			} else {
				randomTile.textContent = "2";
				gameBoard[randomRow][randomColumn] = 2;
			};

		} else {
			spawnTwoOrFour();
		};

		tileUpdate();
	} else {
		return;
	};
};

function tileUpdate() { // Update tile based on gameBoard array (and also the style + animation).
	for (let r = 0; r < gameBoard.length; r++) {
		for (let c = 0; c < gameBoard[r].length; c++) {
			let tile = document.getElementById(`${r}-${c}`);
			tile.innerText = gameBoard[r][c];
			let tileNum = tile.innerText;

			tile.classList.value = `_tile t${tileNum}`;
			if (parseInt(tileNum) >= 8192) {
				tile.classList.value = `_tile t8192-or-above`
			};

			tile.classList.remove("pop-up_");
			tile.classList.add("pop-up_");

			if (tileNum == 0) {
				tile.innerText = "";
			};
		};
	};
};

function resetGame() {
	gameBoard = [
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	];

	document.querySelector("._win").style.display = "none";

	score.currentScore = 0;
	displayScore();

	spawnTwoOrFour();
	spawnTwoOrFour();

	tileUpdate();
	saveGameData();
};

function displayScore() {
	currentScoreHTML.innerText = score.currentScore;
	setBestScore();
};

function setBestScore() {
	if (score.currentScore > score.bestScore) {
		score.bestScore = score.currentScore;
		bestScoreHTML.innerText = `(${score.bestScore})`;
	};
};

function checkIfWin() {
	gameBoard.forEach((board, index) => {
		if (gameBoard[index].includes(2048)) {
			document.querySelector("._win").style.display = "inline-block";
			return;
		};
	});
};

function isGameBoardFull() {
	if (!gameBoard[0].includes(0) && !gameBoard[1].includes(0) && !gameBoard[2].includes(0) && !gameBoard[3].includes(0)) {
		return true;
	};
};

// Local Storage.
const game_score = "Game_Score";
const game_progress = "Game_Progress";

function saveGameData() {
	localStorage.setItem(game_score, JSON.stringify(score));
	localStorage.setItem(game_progress, JSON.stringify(gameBoard));
};

function loadGameData() {
	const scoreFromStorage = JSON.parse(localStorage.getItem(game_score));
	const progressFromStorage = JSON.parse(localStorage.getItem(game_progress));

    if (scoreFromStorage == null || progressFromStorage == null) {
    	return;
    } else {
    	if (scoreFromStorage.currentScore == 0) {
    		gameBoard = [
	    		[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0]
			];
    	} else {
	    	gameBoard = progressFromStorage;
	    	checkIfWin();
    	};

    	score.currentScore = scoreFromStorage.currentScore;
		score.bestScore = scoreFromStorage.bestScore;

		bestScoreHTML.innerText = `(${scoreFromStorage.bestScore})`;
		currentScoreHTML.innerText = scoreFromStorage.currentScore;
    };
};

// Swipe For Mobile (not my code).
var xDown = null;                                                        
var yDown = null;

function getTouches(evt) {
	return evt.touches;
};                                                     
                                                                         
function handleTouchStart(evt) {
	const firstTouch = getTouches(evt)[0]; 
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
};                                                
                                                                         
function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;
                                                                         
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            gameBoard = [slide(0, "left"), slide(1, "left"), slide(2, "left"), slide(3, "left")];
			spawnTwoOrFour();
			saveGameData();
			checkIfWin();
        } else {
            gameBoard = [slide(0, "right"), slide(1, "right"), slide(2, "right"), slide(3, "right")];
			spawnTwoOrFour();
			saveGameData();
			checkIfWin();
        };                      
    } else {
        if (yDiff > 0) {
            slide(0, "up"); slide(1, "up"); slide(2, "up"); slide(3, "up");
			spawnTwoOrFour();
			saveGameData();
			checkIfWin();
        } else { 
            slide(0, "down"); slide(1, "down"); slide(2, "down"); slide(3, "down");
			spawnTwoOrFour();
			saveGameData();
			checkIfWin();
        };
        
        tileUpdate();                                                              
    };

    xDown = null;
    yDown = null;                                             
};

gameBoardHTML.addEventListener('touchstart', handleTouchStart, false);        
gameBoardHTML.addEventListener('touchmove', handleTouchMove, false);

resetButton.addEventListener("click", resetGame);

document.addEventListener('keyup', (e) => {
	if (e.code == "ArrowLeft" || e.code == "KeyA") {
		gameBoard = [slide(0, "left"), slide(1, "left"), slide(2, "left"), slide(3, "left")];
		spawnTwoOrFour();
		saveGameData();
		checkIfWin();
	} else if (e.code == "ArrowRight" || e.code == "KeyD") {
		gameBoard = [slide(0, "right"), slide(1, "right"), slide(2, "right"), slide(3, "right")];
		spawnTwoOrFour();
		saveGameData();
		checkIfWin();
	} else if (e.code == "ArrowUp" || e.code == "KeyW") {
		slide(0, "up"); slide(1, "up"); slide(2, "up"); slide(3, "up");
		spawnTwoOrFour();
		saveGameData();
		checkIfWin();
	} else if (e.code == "ArrowDown" || e.code == "KeyS") {
		slide(0, "down"); slide(1, "down"); slide(2, "down"); slide(3, "down");
		spawnTwoOrFour();
		saveGameData();
		checkIfWin();
	};

	tileUpdate();
});

document.addEventListener("DOMContentLoaded", () => {
	loadGameData();

	if (score.currentScore == 0) {
		spawnTwoOrFour();
		spawnTwoOrFour();
	};

	tileUpdate();
});