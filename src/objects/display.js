export default class Display {
    constructor(game) {
        this.game = game;

        /* Link Buttons */

        // navigate to screens
        document.getElementById("start-btn").addEventListener("click", () => this.startGame());
        document.getElementById("controls-btn").addEventListener("click", () => this.showScreen("controls-screen"));
        document.getElementById("next-level-btn").addEventListener("click", () => this.nextLevel());
        document.getElementById("restart-btn").addEventListener("click", () => this.showScreen("home-screen"));
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll(".screen").forEach(screen => {
            screen.style.display = "none";
        });
    
        // Show the selected screen
        document.getElementById(screenId).style.display = "flex";
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

    // lostLevel() {
    //     this.showScreen("lost-level-screen");
    //     this.game.lostLevel();
    // }
}