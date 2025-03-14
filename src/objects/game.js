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

        // game state
        this.levels = [];
        this.timer = null;

    }

    setDisplay(display) {
        this.display = display;
    }

    // update game state every frame
    update(timeDelta) {
        if(this.mouse) {
            this.mouse.walk(timeDelta);
            this.mouse.update();
        }
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
        const level = this.levels[levelNum];

        // insert mouse
        this.mouse = new Mouse(level.planet.hypercube.randomEdge(), level.mouseSpeed);
        this.mesh.add(this.mouse.mesh);
        
        // add cheese
        this.cheeseList.resetCheese();
        for (let i = 0; i < level.numCheese; i++) {
            const edge = level.planet.hypercube.randomEdge();
            this.cheeseList.addCheese(new Cheese(this.cheeseList, edge));
        }

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
        this.startLevel(this.level+1);
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