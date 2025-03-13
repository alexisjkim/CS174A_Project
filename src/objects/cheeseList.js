import * as THREE from 'three';

export default class CheeseList {
    constructor(eatenCounter, remainingCounter) {
        this.cheeses = [];
        this.mesh = new THREE.Group();
        this.eaten = 0;
        this.eatenCounter = null;
        this.remainingCounter = null;
    }

    update() {
        this.cheeses.forEach(cheese => {
            cheese.updateMesh();
        });
    }

    addCheese(cheese) {
        this.cheeses.push(cheese);
        this.mesh.add(cheese.mesh);
        this.#updateCheeseDisplay();
    }

    eatCheese(cheese) {
        const index = this.cheeses.indexOf(cheese);
        if (index !== -1) {
            this.cheeses.splice(index, 1);
            this.mesh.remove(cheese.mesh);
            this.eaten++;
        }
        this.#updateCheeseDisplay();
    }

    linkDisplay(eatenCounter, remainingCounter) {
        this.eatenCounter = eatenCounter;
        this.remainingCounter = remainingCounter;
        this.#updateCheeseDisplay();
    }

    #updateCheeseDisplay() {
        if(this.remainingCounter) {
            this.remainingCounter.innerText = `Cheese Remaining: ${this.cheeses.length}`;
        }
        if(this.eatenCounter) {
            this.eatenCounter.innerText = `Cheese Eaten: ${this.eaten}`;
        }
    }
}