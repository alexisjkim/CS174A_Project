import * as THREE from 'three';
import { createStars, onWindowResize } from './utils';
import Camera from './objects/camera';
import SolarSystem from './objects/solarSystem';
import Game from './objects/game';
import Display from './objects/display';
import VectorN from './objects/vectorN';
import MatrixN from './objects/matrixN';


/* SET UP THE SCENE */ 

// scene
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );


// lights
const pointLight = new THREE.PointLight(0xffffff, 100, 100);
pointLight.position.set(5, 5, 5); // Position the light
scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0.5, .0, 1.0).normalize();
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x505050);  // Soft white light
scene.add(ambientLight);


// camera
let camera = new Camera(renderer, 1, true);
const cameraInitialOffset = new THREE.Vector3(0, 2, 10);
camera.follow(null, cameraInitialOffset, "reposition"); // position camera at initial offset, looking at origin

// create cameras in each dimension
const position6D = new VectorN(6, [0, 0, 0, 0, 0, 5]);
const basis6D = new MatrixN(6);
camera.setCameraND(6, position6D, basis6D);

const position5D = new VectorN(5, [0, 0, 0, 0, 5]);
const basis5D = new MatrixN(5);
camera.setCameraND(5, position5D, basis5D);

const position4D = new VectorN(4, [0, 0, 0, 5]);
const basis4D = new MatrixN(4);
camera.setCameraND(4, position4D, basis4D);



/* SET UP THE WORLD */

// sky
const stars = createStars(1.5, 0xffffff, 3000, 400, 900);
scene.add(stars);

// create solar system
const solarSystem = new SolarSystem(camera);
scene.add(solarSystem.mesh);

// create the game
const game = new Game(solarSystem, camera);
scene.add(game.mesh);

/* ADD GAME LEVELS */
game.createLevel({
    time: 100000,
    planetParams: {
        cubeDimension: 3,
        edgeLength: 1,
        orbitDistance: 8,
        orbitSpeed: 0.2,
        cubeRotationSpeed: -0.15,
        edgeColor: new THREE.Color(0xffff00),
    }
});
game.createLevel({
    time: 150000,
    planetParams: {
        orbitDistance: 12,
        orbitSpeed: 0.16,
        cubeRotationSpeed: 0.15,
        edgeColor: new THREE.Color(0x00ff00),
    }
});
game.createLevel({
    time: 100000,
    planetParams: {
        cubeDimension: 5,
        orbitDistance: 15,
        orbitSpeed: 0.10,
        cubeRotationSpeed: -0.05,
        edgeColor: new THREE.Color(0x00ffff),
    }
});
game.createLevel({
    time: 100000,
    planetParams: {
        cubeDimension: 6,
        orbitDistance: 20,
        orbitSpeed: 0.08,
        cubeRotationSpeed: 0.10,
        edgeColor: new THREE.Color(0xff00ff),
    }
});

/* Background music */
const cameraForMusic = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const listener = new THREE.AudioListener();
cameraForMusic.add(listener);
const audioLoader = new THREE.AudioLoader();
const backgroundMusic = new THREE.Audio(listener);

audioLoader.load('assets/background_music.mp3', function(buffer) {
    backgroundMusic.setBuffer(buffer);
    backgroundMusic.setLoop(true);  // Loop the music
    backgroundMusic.setVolume(0.5); // Adjust volume (0.0 to 1.0)
    backgroundMusic.play();
});

/* SET UP DISPLAY */
const display = new Display(game);
game.setDisplay(display);
// const display = {
//     cheeseEaten: document.getElementById('cheese-eaten'),
//     cheeseRemaining: document.getElementById('cheese-remaining')

// }
// solarSystem.linkCheeseDisplay(0, display);

/* ANIMATION */

let timeDelta = 0;
const clock = new THREE.Clock();

function animate() {
    timeDelta = clock.getDelta();

    game.update(timeDelta); // update game state

    solarSystem.animate(timeDelta); // update the solar system
    solarSystem.update();

    camera.update(); // update camera positioning
 	renderer.render( scene,  camera.camera3D );
}

/* CONTROLS */

let forwardWalkStarted = false;
let backwardWalkStarted = false;
document.addEventListener("keydown", (event) => {
    console.log(event)
    switch (event.key) {
        case "v":
            //   hypercube.toggleVisibility();
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
    
        // Mouse controls
        case "w":
            if (game.mouse && !forwardWalkStarted) game.mouse.toggleWalking(1, true);
            forwardWalkStarted = true;
            break;
        case "s":
            if (game.mouse && !backwardWalkStarted) game.mouse.toggleWalking(-1, true);
            backwardWalkStarted = true;
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
    }
});

window.addEventListener('resize', () => onWindowResize(camera, renderer), false);

