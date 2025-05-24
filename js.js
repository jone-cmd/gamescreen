let gamesElement = null;
let gameTemplate = null;

function checkForVariables() {
	const errorMsgNotFound = "VARIABLE not found. Is the page fully loaded?";
	const checkForNull = (variable, name) => {
		if (variable === null) {
			throw new Error(errorMsgNotFound.replace("VARIABLE", name));
		}
	}
	checkForNull(gamesElement, "Games element");
	checkForNull(gameTemplate, "Game template");
}

function switchGame(gameID) {
	checkForVariables();
	const gameElement = gamesElement.querySelector(`[data-game-id=${gameID}]`);
	if (gameElement === null) {
		throw new Error("Game not found");
	}
	["prev-game", "current-game", "next-game"].forEach(id => {
		const matchingElementForID = gamesElement.querySelector(`#${id}`);
		if (matchingElementForID) {
			matchingElementForID.removeAttribute("id");
		}
	});
	gameElement.id = "current-game";
	let prevGame = gameElement.previousSibling;
	while (prevGame && prevGame.nodeType !== prevGame.ELEMENT_NODE) {
		prevGame = prevGame.previousSibling;
	}
	if (prevGame) {
		prevGame.id = "prev-game";
	}
	let nextGame = gameElement.nextSibling;
	while (nextGame && nextGame.nodeType !== nextGame.ELEMENT_NODE) {
		nextGame = nextGame.nextSibling;
	}
	if (nextGame) {
		nextGame.id = "next-game";
	}
}

function fetchGames() {
	let games = localStorage.getItem("games") || "[]";
	games = JSON.parse(games);
	return games;
}

function renderGames(template = gameTemplate, target = gamesElement) {
	checkForVariables();
	const games = fetchGames();
	games.forEach(game => {
		game.cover = "about:blank";
		const renderedTemplate = template.content.cloneNode(true);
		const gameElement = renderedTemplate.querySelector(".game");
		gameElement.dataset.gameId = game.id;
		const gameCover = renderedTemplate.querySelector(".game-cover");
		gameCover.src = game.cover;
		const gameName = renderedTemplate.querySelector(".game-name");
		gameName.innerText = game.name;
		target.appendChild(renderedTemplate);
	});
}

function startGame(gameID) {
	window.location.href = `gamescreen://start/${gameID}`;
}

function getCurrentGameElement() {
	const currentGameElement = gamesElement.querySelector("#current-game");
	if (currentGameElement === null) {
		return null;
	} else {
		return currentGameElement;
	}
}

function getCurrentGame() {
	return getCurrentGameElement().dataset.gameId;
}

function prevGame() {
	checkForVariables();
	let gameElement = getCurrentGameElement();
	let prevGame = gameElement.previousSibling;
	while (prevGame && prevGame.nodeType !== prevGame.ELEMENT_NODE) {
		prevGame = prevGame.previousSibling;
	}
	if (prevGame) {
		switchGame(prevGame.dataset.gameId);
	}
}

function nextGame() {
	checkForVariables();
	let gameElement = getCurrentGameElement();
	let nextGame = gameElement.nextSibling;
	while (nextGame && nextGame.nodeType !== nextGame.ELEMENT_NODE) {
		nextGame = nextGame.nextSibling;
	}
	if (nextGame) {
		switchGame(nextGame.dataset.gameId);
	}
}

window.addEventListener("load", () => {
	gameTemplate = document.querySelector("#game-template");
	gamesElement = document.querySelector("#games");
	renderGames();
	const firstGame = gamesElement.querySelector(".game");
	if (firstGame) {
		switchGame(firstGame.dataset.gameId); // Switch to 1st game
	}
	gamesElement.addEventListener("click", (event) => {
		let gameElement = event.target;
		while (gameElement && !gameElement.classList.contains("game")) {
			gameElement = gameElement.parentElement;
		}
		if (gameElement && gameElement.dataset.gameId) {
			const gameID = gameElement.dataset.gameId;
			if (gameElement.id === "current-game") {
				startGame(gameID);
			} else {
				switchGame(gameID)
			}
		} else {
			console.warn("No game ID or invalid game!", gameElement)
		}
	});
});