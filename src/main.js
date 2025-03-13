import * as THREE from 'three';
import {  createAxes, createStars } from './utils';
import Tesseract from './objects/tesseract';
import Cheese from './objects/cheese';
import Mouse from './objects/mouse';
import Camera from './objects/camera';
import CheeseList from './objects/cheeseList';

/* Set up the scene */ 

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// camera

let camera = new Camera(renderer, 1, true);

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

/* Set Up Tesseract */

const meshParams = {
    edgeLength: 4,
    edgeRadius: 0.05, 
    edgeColor: new THREE.Color(0x85f73e), 
    vertexRadius: 0.08, 
    vertexColor: new THREE.Color(0x881bb3)
}
const tesseract = new Tesseract(
    camera,
    meshParams
)
scene.add(tesseract.mesh);

/* Create mouse */

const mouse = new Mouse(tesseract.randomEdge(), 1);
scene.add(mouse.mesh);

/* Add a Cheese */

const cheeseEatenCounter = document.getElementById('cheese-eaten');
const cheeseRemainingCounter = document.getElementById('cheese-remaining');
const cheeseList = new CheeseList(cheeseEatenCounter, cheeseRemainingCounter);
scene.add(cheeseList.mesh);

// add a number of cheeses to random edges of the tesseract
const numCheeses = 3;
for(let i = 0; i < numCheeses; i++) {
    const edge = tesseract.randomEdge();
    cheeseList.addCheese(new Cheese(cheeseList, edge, camera));
}

/* ANIMATION */

let isPaused = false;
let animationTime = 0;
let timeDelta = 0;
const period = 4; // number of seconds for the shape to make a full rotation
const clock = new THREE.Clock();

function translationMatrix(tx, ty, tz) {
	return new THREE.Matrix4().set(
		1, 0, 0, tx,
		0, 1, 0, ty,
		0, 0, 1, tz,
		0, 0, 0, 1
	);
}
function rotationMatrixY(theta) {
    return new THREE.Matrix4().set(
        Math.cos(theta), 0, Math.sin(theta), 0,
        0, 1, 0, 0,
        -Math.sin(theta), 0, Math.cos(theta), 0,
        0, 0, 0, 1
    );
}

function rotationMatrixXY(theta) {
    let cos = Math.cos(theta);
    let sin = Math.sin(theta);
    
    // Create a rotation matrix for the XY plane
    return new THREE.Matrix4().set(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, cos, -sin,
        0, 0, sin, cos
    );
}
	
function animate() {
    // tesseract rotates
    if (!isPaused) {
        timeDelta = clock.getDelta();
        animationTime += timeDelta;
        
        let angle4D = (2 * Math.PI / period) * animationTime;
        let distance = 5
        let speed = 1
        let angle3D = animationTime * speed;
        
        // rotate tesseract in 4D
        let modelTransform4D = new THREE.Matrix4(); 
        modelTransform4D.multiply(rotationMatrixXY(angle4D));
        tesseract.apply4DTransformation(modelTransform4D);
        
        // tesseract orbits in 3D
        let modelTransform3D = new THREE.Matrix4(); 
        modelTransform3D.premultiply(translationMatrix(distance, 0, 0));
        modelTransform3D.premultiply(rotationMatrixY(angle3D));
        tesseract.apply3DTransformation(modelTransform3D);
    }

    tesseract.update();
    // mouse updates position
    mouse.walk(timeDelta);
    cheeseList.update();

    camera.update(mouse.mesh.position);
    camera.controls3D.update(); // This will update the camera position and target based on the user input.

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
    } if (event.key === 'e') {
        camera.toggleMousePov();
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

