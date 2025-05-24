let gamesElement = null;
let gameTemplate = null;

function games_checkForVariables() {
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
	games_checkForVariables();
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
	games_checkForVariables();
	const games = fetchGames();
	target.innerHTML = "";
	games.forEach(game => {
		game.cover = game.cover || "about:blank";
		const renderedTemplate = template.content.cloneNode(true);
		const gameElement = renderedTemplate.querySelector(".game");
		gameElement.dataset.gameId = game.id;
		gameElement.style.backgroundImage = `url(${game.cover})`;
		const gameName = renderedTemplate.querySelector(".game-name");
		gameName.innerText = game.name;
		target.appendChild(renderedTemplate);
	});
	const firstGame = gamesElement.querySelector(".game");
	if (firstGame) {
		switchGame(firstGame.dataset.gameId); // Switch to 1st game
	}
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
	games_checkForVariables();
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
	games_checkForVariables();
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
	document.addEventListener("keydown", (event) => {
		if (event.key === "ArrowLeft") {
			prevGame();
		} else if (event.key === "ArrowRight") {
			nextGame();
		} else if (["Enter", " "].includes(event.key)) {
			startGame(getCurrentGame());
		}
	});
	const mc = new Hammer(window, {});
	mc.on("swipeleft swiperight", e => {
		switch (e.type) {
			case "swiperight":
				prevGame();
				break;
			case "swipeleft":
				nextGame();
				break;
		}
	});
});