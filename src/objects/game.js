import * as THREE from "three";
import Mouse from "./mouse";
import CheeseList from "./cheeseList";
import Cheese from "./cheese";

export default class Game {
    constructor(solarSystem, camera, display) {
        // objects
        this.camera = camera;
        this.display = display;
        this.solarSystem = solarSystem;
        this.cheeseList = new CheeseList(this);
        this.mouse = null;
        
        // game state
        this.level = 0;
        this.levels = [];
        this.timer = null;
        
        this.sound = null;
        
        this.mesh = this.#createMesh();
        this.#loadSound();
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

            if (this.timer <= 0) this.lostLevel();
        }

        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById("timer-display");

        if (this.timer) {
            timerElement.style.display = 'block'; // make the timer visible
            if (timerElement) {
                timerElement.innerText = `Time Left: ${Math.ceil(this.timer)}`; // round up time to integer
            }
        }

        else {
            timerElement.style.display = 'none'; // hide the timer
        }

    }

    startLevel(levelNum) {
        // invalid level number
        if(levelNum < 0 || levelNum >= this.levels.length) {
            console.log("invalid level number: %d", levelNum);
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

        // start timer
        this.timer = level.time;

        // have camera follow this planet
        const offset = { 
            type: "relative",
            vector: new THREE.Vector3(-5, 3, 0)
        }
        this.camera.follow(level.planet, offset);
    }

    lostLevel() {
        this.level = 0;
        this.mouse.hideMouse();
        this.mesh.remove(this.mouse);
        delete this.mouse;
        this.timer = null;
        this.display.showScreen("lost-level-screen");
    }

    nextLevel() {
        this.mouse.hideMouse();
        this.mesh.remove(this.mouse);
        delete this.mouse;
        this.level += 1;

        // finished all levels
        if(this.level == this.levels.length) this.display.showScreen("game-complete-screen");
        else this.startLevel(this.level);
    }

    finishLevel() {
        this.display.showScreen("finish-level-screen");

        if (this.sound) {
            this.sound.play();
        }

        this.timer = null;
        
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

    #loadSound() {
        const listener = new THREE.AudioListener();
        this.mesh.add(listener); // Attach to the mesh

        const audioLoader = new THREE.AudioLoader();
        this.sound = new THREE.Audio(listener);

        audioLoader.load('assets/level_completed_sound.wav', (buffer) => {
            this.sound.setBuffer(buffer);
            this.sound.setLoop(false); // Play only once
            this.sound.setVolume(1.0); // Adjust volume
            console.log("Sound loaded successfully!");
        });
    }
}