import * as THREE from 'three';
import {  createAxes, createStars, rotationMatrixY, rotationMatrixZW, translationMatrix } from './utils';
import Tesseract from './objects/tesseract';
import Cheese from './objects/cheese';
import Mouse from './objects/mouse';
import Camera from './objects/camera';
import CheeseList from './objects/cheeseList';
import SolarSystem from './objects/solarSystem';


/* SET UP THE SCENE */ 

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// camera
let camera = new Camera(renderer, 1, true);
const cameraInitialOffset = new THREE.Vector3(0, 2, 10);
camera.follow(null, cameraInitialOffset, "reposition");

function onWindowResize() {
    camera.camera3D.aspect = window.innerWidth / window.innerHeight;
    camera.camera3D.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

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
const axes = createAxes(5, 0xff0000, 0xffff00, 0x0000ff);
scene.add(axes);

// sky
const stars = createStars(1.5, 0xffffff, 3000, 400, 900);
scene.add(stars);


/* SET UP THE WORLD */

// create solar system
const solarSystem = new SolarSystem(camera);
scene.add(solarSystem.mesh);

// add tesseracts to the system
solarSystem.createPlanet();
solarSystem.createPlanet({
    orbitDistance: 13,
    orbitSpeed: 0.15,
    cubeRotationSpeed: -0.15,
    edgeColor: new THREE.Color(0x00ffff),
});

// add a single mouse, on the first tesseract
const mouse = new Mouse(solarSystem.getPlanet(0).hypercube.randomEdge());
scene.add(mouse.mesh);

/* SET UP DISPLAY */

const display = {
    cheeseEaten: document.getElementById('cheese-eaten'),
    cheeseRemaining: document.getElementById('cheese-remaining')

}
solarSystem.linkCheeseDisplay(0, display);




/* ANIMATION */

let isPaused = false;
let animationTime = 0;
let timeDelta = 0;
const clock = new THREE.Clock();

	
function animate() {
    // tesseract rotates
    if (!isPaused) {
        timeDelta = clock.getDelta();
        animationTime += timeDelta;

        solarSystem.animate(animationTime);
    }
    
    solarSystem.update();

    // mouse updates position
    mouse.walk(timeDelta);
    camera.update();
	renderer.render( scene,  camera.camera3D );
}

// toggle animation (isPaused and clock)
function toggleAnimation() {
    isPaused = !isPaused;
    if (!isPaused) {
        clock.start(); // Reset delta time calculations when resuming
    } else {
        clock.stop(); // Stop updating delta time
    }
}

let forwardWalkStarted = false;
let backwardWalkStarted = false;
document.addEventListener("keydown", (event) => {
    // pause on spacebar
    if (event.code === "Space") {
        toggleAnimation();
    } if (event.key === 'p' || event.key === 'P') {
        camera.togglePerspective();
    } if (event.code === "ArrowRight") {
        mouse.switchEdge(1);
    } if (event.code === "ArrowLeft") {
        mouse.switchEdge(-1);
    } if (event.key === "w" && forwardWalkStarted == false) {
        mouse.toggleWalking(1, true);
        forwardWalkStarted = true;
    } if (event.key === "s" && backwardWalkStarted == false) {
        mouse.toggleWalking(-1, true);
        backwardWalkStarted = true;
    } if (event.key === 'v') {
     //   tesseract.toggleVisibility();
    } if (event.key === 'Escape') {
        camera.follow(null, cameraInitialOffset, "reposition");
    } if (event.key === 'm') {
        camera.follow(mouse);
    } if (event.key === '0') {
        const offsetSun = new THREE.Vector3(0, 20, 0);
        camera.follow(solarSystem.sun, offsetSun, "reposition");
    } if (event.key === '1') {
        const relativeOffset = { 
            type: "relative",
            vector: new THREE.Vector3(-5, 0, 0)
        }
        camera.follow(solarSystem.getPlanet(0), relativeOffset);
    }
});


document.addEventListener("keyup", (event) => {
    // pause on spacebar
    if (event.key === 'w') {
        forwardWalkStarted = false;
        if(backwardWalkStarted == false) {
            mouse.toggleWalking(1, false);
        }
    } if (event.key === 's') {
        backwardWalkStarted = false;
        if(forwardWalkStarted == false) {
            mouse.toggleWalking(-1, false);
        }
    }
});

window.addEventListener('resize', onWindowResize, false);

