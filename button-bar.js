async function fetchGameLibrary() {
	const response = await fetch("games.json");
	if (!response.ok) {
		throw new Error(response.statusText);
	}
	return await response.json();
}

window.addEventListener("load", _ => {
	const addGameButton = document.getElementById("add-game-button");
	const addGameDialog = document.getElementById("add-game-dialog");
	addGameButton.addEventListener("click", () => {
		const gameLibraryElement = addGameDialog.querySelector("#game-library");
		gameLibraryElement.innerHTML = "";
		fetchGameLibrary().then(gameLibrary => {
			gameLibrary.forEach(game => {
				const renderedTemplate = gameTemplate.content.cloneNode(true);
				const gameElement = renderedTemplate.querySelector(".game");
				gameElement.classList.add("available-game");
				gameElement.dataset.gameId = game.id;
				gameElement.style.backgroundImage = `url(${game.cover})`;
				const gameNameElement = gameElement.querySelector(".game-name");
				gameNameElement.innerText = game.name;
				gameElement.addEventListener("click", _ => {
					const gameNameInput = addGameDialog.querySelector("#game-name-input");
					gameNameInput.value = game.name;
					const gameIDInput = addGameDialog.querySelector("#game-id-input");
					gameIDInput.value = game.id;
					const gameImageInput = addGameDialog.querySelector("#game-image-input");
					fetch(game.cover).then(response => {
						if (response.ok) {
							return response.blob();
						} else {
							throw new Error(response.statusText);
						}
					}).then(blob => {
						const dataTransfer = new DataTransfer();
						const file = new File([blob], game.cover.split("/").pop().split("?").shift(), {type: blob.type})
						dataTransfer.items.add(file);
						gameImageInput.files = dataTransfer.files;
					});
				});
				gameLibraryElement.appendChild(gameElement);
			});
			addGameDialog.showModal();
		});
	});
	const addGameForm = document.getElementById("add-game-form");
	addGameForm.addEventListener("submit", _ => {
		const name = document.getElementById("game-name-input").value;
		const id = document.getElementById("game-id-input").value;
		const coverFile = document.getElementById("game-image-input").files[0];
		const canvas = document.getElementById("downscale-canvas");
		const ctx = canvas.getContext("2d");
		const img = new Image();
		img.addEventListener("load", _ => {
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			const aspectRatio = img.width / img.height;
			let desiredWidth, desiredHeight;
			if (viewportWidth / viewportHeight > aspectRatio) {
				desiredHeight = viewportHeight;
				desiredWidth = desiredHeight * aspectRatio;
			} else {
				desiredWidth = viewportWidth;
				desiredHeight = desiredWidth / aspectRatio;
			}
			canvas.width = desiredWidth;
			canvas.height = desiredHeight;
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			const cover = canvas.toDataURL("image/jpeg");
			const game = {name, id, cover};
			const currentGames = fetchGames();
			const games = currentGames.filter(game => game.id !== id)
			games.unshift(game);
			localStorage.games = JSON.stringify(games);
			renderGames();
		});
		const reader = new FileReader();
		reader.addEventListener("load", e => {
			img.src = e.target.result;
		});
		reader.readAsDataURL(coverFile);
	});
	const resetGamesButton = document.getElementById("reset-games-button");
	resetGamesButton.addEventListener("click", _ => {
		localStorage.games = JSON.stringify([]);
		renderGames();
		addGameDialog.close();
	});
});
