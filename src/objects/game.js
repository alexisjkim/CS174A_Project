import * as THREE from "three";
import Mouse from "./mouse";
import CheeseList from "./cheeseList";
import Cheese from "./cheese";

export default class Game {
    constructor(solarSystem, camera, display) {
        // objects
        this.camera = camera;
        this.solarSystem = solarSystem;
        this.mouse = null;
        this.cheeseList = new CheeseList(this);
        this.mesh = this.#createMesh();
        this.level = 0;

        // game state
        this.levels = [];
        this.timer = null;

    }

    setDisplay(display) {
        this.display = display;
    }

    // update game state every frame
    update(timeDelta) {
        if(this.mouse) this.mouse.walk(timeDelta);
        if(this.mouse) this.mouse.update();
        if(this.cheeseList) {
            this.cheeseList.update();
        }
        if(this.timer)  {
            this.timer -= timeDelta;
        }
    }

    linkDisplay() {
    }

    startLevel(levelNum) {
        if(levelNum < 0 || levelNum >= this.levels.length) {
            console.log("invalid level number");
            return;
        }
        let level = this.levels[levelNum];
        if (!level) {
            console.error("Level data is missing at index:", levelNum);
            return;
        }
        let requiredProps = ["planet", "numCheese", "mouseSpeed", "time"];
        for (let prop of requiredProps) {
            if (!level.hasOwnProperty(prop)) {
                console.error(`Level ${levelNum} is missing property: ${prop}`);
                return;
            }
        }

        // insert mouse
        this.mouse = new Mouse(level.planet.hypercube.randomEdge(), level.mouseSpeed);
        this.mesh.add(this.mouse.mesh);
        
        // add cheese
        this.cheeseList.resetCheese();
        for (let i = 0; i < level.numCheese; i++) {
            const edge = level.planet.hypercube.randomEdge();
            this.cheeseList.addCheese(new Cheese(this.cheeseList, edge));
        }

        console.log(this.cheeseList.length);

        // start timer
        this.timer = level.startTime;

        // have camera follow this planet
        const offset = { 
            type: "relative",
            vector: new THREE.Vector3(-5, 3, 0)
        }
        this.camera.follow(level.planet, offset);
    }

    nextLevel() {
        this.level += 1;
        this.mouse.hideMouse();
        this.mesh.remove(this.mouse);
        delete this.mouse;
        this.startLevel(this.level);
    }

    finishLevel() {
        this.display.showScreen("finish-level-screen");
    }

    // TEMP.. eventually be able to tune levels prob
    createLevel({
        time = 100000,
        mouseSpeed = 1,
        numCheese = 3,
        planetParams,
    } = {}) {
        // make a new planet for this level
        const newPlanet = this.solarSystem.createPlanet(planetParams)
        
        // add this level to our levels list
        this.levels.push({
            time: time,
            mouseSpeed: mouseSpeed,
            numCheese: numCheese,
            planet: newPlanet,
        })
    }

    #createMesh() {
        const mesh = new THREE.Group();
        mesh.add(this.cheeseList.mesh);
        return mesh;
    }
}