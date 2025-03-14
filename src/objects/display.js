export default class Display {
    constructor() {
        // Link homescreen
        document.getElementById("start-btn").addEventListener("click", () => this.showScreen("game-screen"));
        document.getElementById("settings-btn").addEventListener("click", () => this.showScreen("settings-screen"));
        document.getElementById("home-btn").addEventListener("click", () => this.showScreen("home-screen"));
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
    
}