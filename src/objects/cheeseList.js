import * as THREE from 'three';

export default class CheeseList {
    constructor(eatenCounter, remainingCounter) {
        this.cheeses = [];
        this.mesh = new THREE.Group();
        this.eaten = 0;
        this.eatenCounter = eatenCounter;
        this.remainingCounter = remainingCounter;
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

    #updateCheeseDisplay() {
        this.remainingCounter.innerText = `Cheese Remaining: ${this.cheeses.length}`;
        this.eatenCounter.innerText = `Cheese Eaten: ${this.eaten}`;
    }
}