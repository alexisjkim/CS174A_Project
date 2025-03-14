export default class Display {
    constructor(game, solarSystem, sandbox, scene, playGame) {
        this.game = game;
        this.solarSystem = solarSystem;
        this.sandbox = sandbox;
        this.scene = scene;
        this.playGame = playGame;

        /* Link Buttons */

        // navigate to screens
        document.getElementById("start-btn").addEventListener("click", () => this.startGame());
        document.getElementById("controls-btn").addEventListener("click", () => this.showScreen("controls-screen"));
        document.getElementById("next-level-btn").addEventListener("click", () => this.nextLevel());
        document.getElementById("restart-btn").addEventListener("click", () => this.showScreen("home-screen"));
        document.querySelectorAll(".back-to-home").forEach(button => {
            button.addEventListener("click", () => this.showScreen("home-screen"));
        });

        document.getElementById("sandbox-btn").addEventListener("click", () => this.startSandbox());
        document.getElementById("game-btn").addEventListener("click", () => this.restartGame());
        document.getElementById("inc-dimension").addEventListener("click", () => this.changeDimension(1));
        document.getElementById("dec-dimension").addEventListener("click", () => this.changeDimension(-1));
        document.getElementById("inc-rotation").addEventListener("click", () => this.changeRotation(1));
        document.getElementById("dec-rotation").addEventListener("click", () => this.changeRotation(-1));
        document.getElementById("inc-size").addEventListener("click", () => this.changeSize(1));
        document.getElementById("dec-size").addEventListener("click", () => this.changeSize(-1));
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll(".screen").forEach(screen => {
            screen.style.display = "none";
        });
    
        // Show the selected screen
        document.getElementById(screenId).style.display = "flex";
    }

    startSandbox() {
        this.playGame = false;
        console.log("toggled")

        this.showScreen("sandbox-screen");
        this.unloadGame();
        this.loadSandbox();
    }

    restartGame() {
        this.playGame = true;
        console.log("toggled")

        this.showScreen("home-screen");
        this.unloadSandbox();
        this.loadGame();
    }

    changeDimension(change) {
        console.log(change);
        this.sandbox.changeDimension(this.sandbox.dimension + change)
    }

    changeRotation(change) {
        console.log(change);
        this.sandbox.changeRotation(this.sandbox.animParams.rotationNumber + change)
    }

    changeSize(change) {
        console.log(change);
        this.sandbox.changeEdgeLength(this.sandbox.params.edgeLength + change)
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

    loadGame() {
        this.scene.add(this.game.mesh);
        this.scene.add(this.solarSystem.mesh);
    }
    unloadGame() {
        this.scene.remove(this.game.mesh);
        this.scene.remove(this.solarSystem.mesh);
    }
    loadSandbox() {
        console.log("start sandbox");
        this.scene.add(this.sandbox.mesh);
    }
    unloadSandbox() {
        console.log("remove sandbox", this.sandbox)
        this.scene.remove(this.sandbox.mesh);
    }x 

    // lostLevel() {
    //     this.showScreen("lost-level-screen");
    //     this.this.game.lostLevel();
    // }
}