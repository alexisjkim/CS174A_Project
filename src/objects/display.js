export default class Display {
    constructor(game) {
        this.game = game;

        /* Link Buttons */

        // navigate to screens
        document.getElementById("start-btn").addEventListener("click", () => this.showScreen("game-screen"));
        document.getElementById("settings-btn").addEventListener("click", () => this.showScreen("settings-screen"));
        document.getElementById("controls-btn").addEventListener("click", () => this.showScreen("controls-screen"));
        document.getElementById("next-level-btn").addEventListener("click", () => this.nextLevel());
        document.querySelectorAll(".back-to-home").forEach(button => {
            button.addEventListener("click", () => this.showScreen("home-screen"));
        });
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll(".screen").forEach(screen => {
            screen.style.display = "none";
        });
    
        // Show the selected screen
        document.getElementById(screenId).style.display = "flex";

        // game screen
        if(screenId == "game-screen") {
            this.game.startLevel(1);
        }
    }
    
    // Event listeners for navigation
    
    nextLevel() {
        console.log("next!");
        this.game.nextLevel();
    }
}