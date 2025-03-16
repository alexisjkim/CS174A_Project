export default class Display {
    constructor(
        game,
        sandbox,
        loadGame,
        loadSandbox,
    ) {
        this.game = game;
        this.sandbox = sandbox;
        this.loadGame = loadGame;
        this.loadSandbox = loadSandbox;

        /* Link Buttons */

        // navigate to screens
        document
            .getElementById("start-btn")
            .addEventListener("click", () => this.startGame());
        document
            .getElementById("controls-btn")
            .addEventListener("click", () =>
                this.showScreen("controls-screen")
            );
        document
            .getElementById("next-level-btn")
            .addEventListener("click", () => this.nextLevel());
        document
            .getElementById("restart-btn")
            .addEventListener("click", () => this.showScreen("home-screen"));
        document.querySelectorAll(".back-to-home").forEach((button) => {
            button.addEventListener("click", () =>
                this.showScreen("home-screen")
            );
        });

        this.dimensionDisplay = document.getElementById("dimension-value");
        this.rotationDisplay = document.getElementById("rotation-value");
        this.sizeDisplay = document.getElementById("size-value");
        document
            .getElementById("sandbox-btn")
            .addEventListener("click", () => this.startSandbox());
        document
            .getElementById("game-btn")
            .addEventListener("click", () => this.restartGame());
        document
            .getElementById("inc-dimension")
            .addEventListener("click", () => this.changeDimension(1));
        document
            .getElementById("dec-dimension")
            .addEventListener("click", () => this.changeDimension(-1));
        document
            .getElementById("inc-rotation")
            .addEventListener("click", () => this.changeRotation(1));
        document
            .getElementById("dec-rotation")
            .addEventListener("click", () => this.changeRotation(-1));
        document
            .getElementById("inc-size")
            .addEventListener("click", () => this.changeSize(1));
        document
            .getElementById("dec-size")
            .addEventListener("click", () => this.changeSize(-1));
        document
            .getElementById("change-color")
            .addEventListener("click", () => this.changeColor());
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll(".screen").forEach((screen) => {
            screen.style.display = "none";
        });

        // Show the selected screen
        document.getElementById(screenId).style.display = "flex";
    }

    startSandbox() {
        this.showScreen("sandbox-screen");
        this.loadSandbox();
    }

    restartGame() {
        this.showScreen("home-screen");
        this.loadGame();
    }

    changeDimension(change) {
        this.sandbox.changeDimension(this.sandbox.params.dimension + change);
        this.dimensionDisplay.textContent = this.sandbox.params.dimension;
    }

    changeRotation(change) {
        this.sandbox.changeRotation(
            this.sandbox.params.rotationNumber + change
        );
        this.rotationDisplay.textContent =
            this.sandbox.params.rotationNumber;
    }

    changeSize(change) {
        this.sandbox.changeEdgeLength(this.sandbox.cubeAttributes.edgeLength + change);
        this.sizeDisplay.textContent = this.sandbox.cubeAttributes.edgeLength;
    }

    changeColor() {
        this.sandbox.changeColor();
    }

    // Event listeners for navigation
    startGame() {
        this.showScreen("game-screen");
        this.game.startLevel(0);
    }

    nextLevel() {
        this.showScreen("game-screen");
        this.game.nextLevel();
    }
}