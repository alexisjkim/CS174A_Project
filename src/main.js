import * as THREE from 'three';
import { createStars, generateOrthonormalBasis, onWindowResize } from './utils';
import Camera from './objects/camera';
import SolarSystem from './objects/solarSystem';
import Game from './objects/game';
import Display from './objects/display';
import VectorN from './objects/vectorN';
import MatrixN from './objects/matrixN';
import Sandbox from './objects/Sandbox';


/* SET UP THE SCENE */

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
renderer.shadowMap.enabled = true; // Enable shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
document.body.appendChild( renderer.domElement );

/* Set up backgound music */

const cameraForMusic = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const listener = new THREE.AudioListener();
cameraForMusic.add(listener);

const audioLoader = new THREE.AudioLoader();
const backgroundMusic = new THREE.Audio(listener);

audioLoader.load('assets/background_music.mp3', function(buffer) {
    backgroundMusic.setBuffer(buffer);
    backgroundMusic.setLoop(true);
    backgroundMusic.setVolume(0.5);
    console.log("Music loaded. Press 'M' to play!");
});

window.addEventListener('click', startMusic);
window.addEventListener('keydown', toggleMusic);


/* Setup Cameras for up to 8D */

let camera = new Camera(renderer, 1, true);
const gameInitialOffset = new THREE.Vector3(0, 2, 10);
const sandboxInitialOffset = new THREE.Vector3(0, 2, 6 );
camera.follow(null, gameInitialOffset, "reposition"); // position scene camera at initial offset, looking at origin

// create cameras in each dimension
const position8D = new VectorN(8, [0, 0, 0, 0, 0, 0, 0, 5]);
const basis8D = new MatrixN(8);
camera.setCameraND(8,position8D, basis8D);

const position7D = new VectorN(7, [0, 0, 0, 0, 0, 0, 5]);
const basis7D = new MatrixN(7);
camera.setCameraND(7,position7D, basis7D);

const position6D = new VectorN(6, [0, 0, 0, 0, 0, 5]);
const basis6D = new MatrixN(6);
camera.setCameraND(6,position6D, basis6D);

const position5D = new VectorN(5, [0, 0, 0, 0, 5]);
const basis5D = new MatrixN(5);
camera.setCameraND(5, position5D, basis5D);

const position4D = new VectorN(4, [0, 0, 0, 5]);
const basis4D = new MatrixN(4);
camera.setCameraND(4, position4D, basis4D);


/* SET UP THE WORLD */

const solarSystem = new SolarSystem(camera); // initially with sun, stars, no planets
const game = new Game(solarSystem, camera); // game state
const sandbox = new Sandbox(camera); // sandbox hypercubes
let playGame = true; // start with the game loaded

/* ADD SOME GAME LEVELS (creates planets in solar system) */

game.createLevel({
    time: 40,
    planetParams: { 
        cubeDimension: 1,
        edgeLength: 1,
        orbitDistance: 5,
        orbitSpeed: 0.3,
        cubeRotationSpeed: -0.15,
        edgeColor: new THREE.Color(0xffff00),
    }
});
game.createLevel({
    time: 40,
    planetParams: {
        cubeDimension: 2,
        edgeLength: 1,
        orbitDistance: 8,
        orbitSpeed: 0.24,
        cubeRotationSpeed: -0.15,
        edgeColor: new THREE.Color(0xf0f0f0),
    }
});
game.createLevel({
    time: 40,
    planetParams: {
        cubeDimension: 3,
        edgeLength: 1,
        orbitDistance: 12,
        orbitSpeed: 0.2,
        cubeRotationSpeed: -0.15,
        edgeColor: new THREE.Color(0x0033ee),
    }
});
game.createLevel({
    time: 50,
    planetParams: {
        orbitDistance: 15,
        orbitSpeed: 0.16,
        cubeRotationSpeed: 0.15,
        edgeColor: new THREE.Color(0x00ff00),
    }
});
game.createLevel({
    time: 60,
    planetParams: {
        cubeDimension: 5,
        orbitDistance: 19,
        orbitSpeed: 0.10,
        cubeRotationSpeed: -0.05,
        edgeColor: new THREE.Color(0x00ffff),
    }
});
game.createLevel({
    time: 70,
    planetParams: {
        cubeDimension: 6,
        orbitDistance: 24,
        orbitSpeed: 0.08,
        cubeRotationSpeed: 0.10,
        edgeColor: new THREE.Color(0xff00ff),
    }
});
game.createLevel({
    time: 40,
    planetParams: {
        cubeDimension: 7,
        edgeLength: 3.5,
        orbitDistance: 29,
        orbitSpeed: 0.06,
        cubeRotationSpeed: 0.15,
        edgeColor: new THREE.Color(0xff00cc),
    }
});
game.createLevel({
    time: 40,
    planetParams: {
        cubeDimension: 8,
        edgeLength: 3.5,
        orbitDistance: 35,
        orbitSpeed: 0.04,
        cubeRotationSpeed: -0.15,
        edgeColor: new THREE.Color(0xe0e000),
    }
});



/* SET UP DISPLAY */

const display = new Display(game, sandbox, loadGame, loadSandbox); 
game.setDisplay(display);

function loadGame() {
    console.log("Loading the game...")
    playGame = true;
    scene.add(game.mesh);
    scene.add(solarSystem.mesh);
    scene.remove(sandbox.mesh);
    camera.follow(null, gameInitialOffset, "reposition"); // position scene camera at initial offset, looking at origin
}
function loadSandbox() {
    console.log("Loading sandbox...")
    playGame = false;
    scene.add(sandbox.mesh);
    scene.remove(game.mesh);
    scene.remove(solarSystem.mesh);
    camera.follow(null, sandboxInitialOffset, "reposition"); // position scene camera at initial offset, looking at origin
}
loadGame();

/* ANIMATE THE SCENE */

let timeDelta = 0;
const clock = new THREE.Clock();

function animate() {
    timeDelta = clock.getDelta();

    if(playGame) {  
        game.update(timeDelta); // update game state

        solarSystem.animate(timeDelta); // update the solar system
        solarSystem.update();    
    } else {
        sandbox.update(timeDelta);
    }

    
    camera.update(); // update camera positioning
 	renderer.render( scene,  camera.camera3D );
}

/* CONTROLS */

let forwardWalkStarted = false;
let backwardWalkStarted = false;
document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "v":
            solarSystem.toggleVisibility();
            break;
        case "r":
            solarSystem.toggleRotation();
            sandbox.toggleRotation();
            break;
        case "o":
            solarSystem.toggleOrbit();
            break;
        

        // Camera controls
        case "p":
            camera.togglePerspective(); // orthographic perspective
            break;
        case "m":
            if (game.mouse) { // track mouse if it exists
                camera.follow(game.mouse, {
                    type: "relative",
                    vector: new THREE.Vector3(0, 1, 0)
                });
                if(game.mouse) game.mouse.hideMouse();
            }
            break;
        case "Esc":
            camera.follow(null, null, "free"); // stop tracking on esc
            if(game.mouse) game.mouse.showMouse();
            break;
        case "Enter":
            camera.follow(null, cameraInitialOffset, "reposition"); // reset
            if(game.mouse) game.mouse.showMouse();
            break;
        case "0":
            const offsetSun = new THREE.Vector3(0, 20, 0);
            camera.follow(solarSystem.sun, offsetSun, "reposition");
            if(game.mouse) game.mouse.showMouse();
            break;
        case "1":
            camera.follow(solarSystem.getPlanet(0), { 
                type: "relative",
                vector: new THREE.Vector3(-1.8, 0.7, 0.2)
            });
            if(game.mouse) game.mouse.showMouse();
            break;
        case "2":
            camera.follow(solarSystem.getPlanet(1), { 
                type: "relative",
                vector: new THREE.Vector3(-2.5, 0.7, 0.5)
            });
            if(game.mouse) game.mouse.showMouse();
            break;
        case "3":
            camera.follow(solarSystem.getPlanet(2), { 
                type: "relative",
                vector: new THREE.Vector3(-3, 0.8, 1)
            });
            if(game.mouse) game.mouse.showMouse();
            break;
        case "4":
            camera.follow(solarSystem.getPlanet(3), { 
                type: "relative",
                vector: new THREE.Vector3(-4.3, 2, 2)
            });
            if(game.mouse) game.mouse.showMouse();
            break;
        case "5":
            camera.follow(solarSystem.getPlanet(4), { 
                type: "relative",
                vector: new THREE.Vector3(-4.3, 2, 2)
            });
            if(game.mouse) game.mouse.showMouse();
            break;
        case "6":
            camera.follow(solarSystem.getPlanet(5), { 
                type: "relative",
                vector: new THREE.Vector3(-4.3, 2, 2)
            });
            if(game.mouse) game.mouse.showMouse();
            break;
        case "7":
            camera.follow(solarSystem.getPlanet(6), { 
                type: "relative",
                vector: new THREE.Vector3(-4.3, 2, 2)
            });
            if(game.mouse) game.mouse.showMouse();
            break;
        case "8":
            camera.follow(solarSystem.getPlanet(7), { 
                type: "relative",
                vector: new THREE.Vector3(-4.3, 2, 2)
            });
            if(game.mouse) game.mouse.showMouse();
            break;
        
    
        // Mouse controls
        case "w":
            if (game.mouse && !forwardWalkStarted) game.mouse.toggleWalking(1, true);
            forwardWalkStarted = true;
            break;
        case "s":
            if (game.mouse && !backwardWalkStarted) game.mouse.toggleWalking(-1, true);
            backwardWalkStarted = true;
            break;


        case "=":
            console.log("toggle");
            toggleMode();
            break;
    }

    switch(event.code) {
        case "Space":
            solarSystem.toggleAnimation();
            break;
        case "ArrowRight":
            if (game.mouse) game.mouse.switchEdge(1);
            break;
        case "ArrowLeft":
            if (game.mouse) game.mouse.switchEdge(-1);
            break;
    }
});


document.addEventListener("keyup", (event) => {
    // pause on spacebar
    if (event.key === 'w') {
        forwardWalkStarted = false;
        if(backwardWalkStarted == false && game.mouse) {
            game.mouse.toggleWalking(1, false);
        }
    } if (event.key === 's') {
        backwardWalkStarted = false;
        if(forwardWalkStarted == false && game.mouse) {
            game.mouse.toggleWalking(-1, false);
        }
    } if (event.key == 'a') {
        if (game.mouse) game.mouse.switchEdge(-1);
    } if (event.key == 'd') {
        if (game.mouse) game.mouse.switchEdge(1);
    }
});

window.addEventListener('resize', () => onWindowResize(camera, renderer), false);



function startMusic() {
    if (backgroundMusic.isPlaying) return; // Prevent multiple starts

    if (listener.context.state === 'suspended') {
        listener.context.resume();
    }

    backgroundMusic.play();
    console.log("Music started!");

    // Remove event listener after first click
    window.removeEventListener('click', startMusic);
}

function toggleMusic(event) {
    if (event.key.toLowerCase() === 'q') {
        if (backgroundMusic.isPlaying) {
            backgroundMusic.stop();
            console.log("Music stopped.");
        } else {
            backgroundMusic.play();
            console.log("Music playing...");
        }
    }
}