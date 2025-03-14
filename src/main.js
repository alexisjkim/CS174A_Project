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

// camera
let camera = new Camera(renderer, 1, true);
const cameraInitialOffset = new THREE.Vector3(0, 2, 10);
camera.follow(null, cameraInitialOffset, "reposition"); // position camera at initial offset, looking at origin

const position5D = new VectorN(4, [0, 0, 0, 0, 5]);
const basis5D = new MatrixN(5);
camera.setCameraND(4, position5D, basis5D);

const position4D = new VectorN(4, [0, 0, 0, 5]);
const basis4D = new MatrixN(4);
camera.setCameraND(4, position4D, basis4D);

const position3D = new VectorN(3, [0, 0, 5]);
const basis3D = new MatrixN(3);
camera.setCameraND(3, position3D, basis3D);

// lights
const pointLight = new THREE.PointLight(0xffffff, 100, 100);
pointLight.position.set(5, 5, 5); // Position the light
scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0.5, .0, 1.0).normalize();
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x505050);  // Soft white light
scene.add(ambientLight);

// axes 
// const axes = createAxes(5, 0xff0000, 0xffff00, 0x0000ff);
// scene.add(axes);

// sky
const stars = createStars(1.5, 0xffffff, 3000, 400, 900);
scene.add(stars);


/* SET UP THE WORLD */

// create solar system
const solarSystem = new SolarSystem(camera);
scene.add(solarSystem.mesh);

// // add hypercubes to the system
// solarSystem.createPlanet();
// solarSystem.createPlanet({
//     orbitDistance: 13,
//     orbitSpeed: 0.15,
//     cubeRotationSpeed: -0.15,
//     edgeColor: new THREE.Color(0x00ffff),
// });

// // add a single mouse, on the first hypercube
// const mouse = new Mouse(solarSystem.getPlanet(0).hypercube.randomEdge());
// scene.add(mouse.mesh);


const game = new Game(solarSystem, camera);
scene.add(game.mesh);

game.createLevel({
    time: 100000,
    planetParams: {
        orbitDistance: 8,
        orbitSpeed: 0.2,
        cubeRotationSpeed: -0.15,
        edgeColor: new THREE.Color(0xffff00),
    }
});
game.createLevel({
    time: 150000,
    planetParams: {
        orbitDistance: 10,
        orbitSpeed: 0.16,
        cubeRotationSpeed: 0.15,
        edgeColor: new THREE.Color(0x00ff00),
    }
});
game.createLevel({
    time: 100000,
    planetParams: {
        orbitDistance: 13,
        orbitSpeed: 0.10,
        cubeRotationSpeed: -0.05,
        edgeColor: new THREE.Color(0x00ffff),
    }
});

/* SET UP DISPLAY */


const display = new Display(game);
// const display = {
//     cheeseEaten: document.getElementById('cheese-eaten'),
//     cheeseRemaining: document.getElementById('cheese-remaining')

// }
// solarSystem.linkCheeseDisplay(0, display);

/* ANIMATION */

let timeDelta = 0;
const clock = new THREE.Clock();

	
function animate() {
    // hypercube rotates
    timeDelta = clock.getDelta();
    game.update(timeDelta);

    solarSystem.animate(timeDelta);
    solarSystem.update();

    camera.update();
	renderer.render( scene,  camera.camera3D );
}

let forwardWalkStarted = false;
let backwardWalkStarted = false;
document.addEventListener("keydown", (event) => {
    // pause on spacebar
    if (event.code === "Space") {
        solarSystem.toggleAnimation();
    } if (event.key === 'p' || event.key === 'P') {
        camera.togglePerspective();
    } if (event.code === "ArrowRight") {
        if (game.mouse) {
            game.mouse.switchEdge(1);
        }
    } if (event.code === "ArrowLeft") {
        if (game.mouse) {
            game.mouse.switchEdge(-1);
        }
    } if (event.key === "w" && forwardWalkStarted == false) {
        if(game.mouse) {
            game.mouse.toggleWalking(1, true);
        }
        forwardWalkStarted = true;
    } if (event.key === "s" && backwardWalkStarted == false) {
        if(game.mouse) {
            game.mouse.toggleWalking(-1, true);
        }
        backwardWalkStarted = true;
    } if (event.key === 'v') {
     //   hypercube.toggleVisibility();
    } if (event.key === 'Enter') {
        camera.follow(null, cameraInitialOffset, "reposition");
        game.mouse.showMouse();
    } if (event.key === 'Escape') {
        camera.follow(null, null, "free");
        game.mouse.showMouse();
    } if (event.key === 'm') {
        const relativeOffset = {
            type: "relative",
            vector: new THREE.Vector3(0, 1, 0)
        }
        if(game.mouse) {
            camera.follow(game.mouse, relativeOffset);
            game.mouse.hideMouse();
        }
    } if (event.key === '0') {
        const offsetSun = new THREE.Vector3(0, 20, 0);
        camera.follow(solarSystem.sun, offsetSun, "reposition");
        game.mouse.showMouse();
    } if (event.key === '1') {
        const relativeOffset = { 
            type: "relative",
            vector: new THREE.Vector3(-2, 2, 2)
        }
        camera.follow(solarSystem.getPlanet(0), relativeOffset);
        game.mouse.showMouse();
    } if (event.key === 't') {
        game.startLevel(0);
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

