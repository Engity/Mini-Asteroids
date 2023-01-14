const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

//ASSET_MANAGER.queueDownload("./resource/sonic_sprite.png")

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");

	gameEngine.init(ctx);

    //Add main character
    let mainChar = new Starship(gameEngine, params.CANVAS_SIZE / 2, params.CANVAS_SIZE / 2);
    gameEngine.addEntity(mainChar);

	gameEngine.start();
});
