import * as THREE from 'three';
import {  createAxisLine } from './utils';
import Tesseract from './tesseract';
import Cheese from './cheese';
import Mouse from './mouse';
import Camera from './camera';

/* Set up the scene */ 

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

/* Change camera position */

/* Set up lights */

const pointLight = new THREE.PointLight(0xffffff, 100, 100);
pointLight.position.set(5, 5, 5); // Position the light
scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0.5, .0, 1.0).normalize();
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x505050);  // Soft white light
scene.add(ambientLight);

/* Add x, y, z axes to the scene */

const xAxis = createAxisLine(0xff0000, new THREE.Vector3(0, 0, 0), new THREE.Vector3(5, 0, 0)); // Red
const yAxis = createAxisLine(0xffff00, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 5, 0)); // Yellow
const zAxis = createAxisLine(0x0000ff, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 5)); // Blue

scene.add(xAxis);
scene.add(yAxis);
scene.add(zAxis);

/* Add Sky */

const starVertices = [];
const numStars = 5000;
const maxDistance = 1000; 
const minDistance = 300;

for (let i = 0; i < numStars; i++) {
    let x, y, z, distance;

    // keep iterating until a point is beyond min distance... is there a better way
    do {
        x = (Math.random() - 0.5) * 2 * maxDistance;
        y = (Math.random() - 0.5) * 2 * maxDistance;
        z = (Math.random() - 0.5) * 2 * maxDistance;
        distance = Math.sqrt(x * x + y * y + z * z);
    } while (distance < minDistance);

    starVertices.push(x, y, z);
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

const starMaterial = new THREE.PointsMaterial({ 
    color: 0xffffff, 
    size: 1.5,
    sizeAttenuation: true 
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

/* Set 4D Camera */

// class Camera4D {
//     constructor(depth = 1, perspective = true) {
//         this.position = new THREE.Vector4(0, 0, 0, 5);
//         this.basis = new THREE.Matrix4().identity();
//         this.depth = depth;
//         this.perspective = perspective;
//     }
//     togglePerspective() {
//         this.perspective = !this.perspective;
//     }
// }
let camera = new Camera(renderer);

/* Set Up Tesseract */

const length = 4;
const meshParams = {
    edgeRadius: 0.05, 
    edgeColor: new THREE.Color(0x85f73e), 
    vertexRadius: 0.08, 
    vertexColor: new THREE.Color(0x881bb3)
}
const tesseract = new Tesseract(
    length,
    camera,
    meshParams
)

scene.add(tesseract.mesh);

/* Create mouse */
const startEdge = tesseract.randomEdge();
console.log(startEdge);
const mouse = new Mouse(startEdge, camera, 1);
scene.add(mouse.mesh);

const cheese = new Cheese(tesseract, camera);
// scene.add(cheese.mesh);

/* Create cheese */
//const cheese = new Cheese()

/* ANIMATION PARAMETERS */
let isPaused = false;
let animationTime = 0;
let timeDelta;
const period = 4; // number of seconds for the shape to make a full rotation
const clock = new THREE.Clock();

	
function animate() {
    if (!isPaused) {
        timeDelta = clock.getDelta();
        animationTime += timeDelta;
        let rotationAngle = (2 * Math.PI / period) * animationTime;

        // tesseract rotates
        tesseract.rotate(rotationAngle);
    }
    // set new mouse position and update

    mouse.walk(timeDelta);
    
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

// TODO: probably does not work rn. needs to be done inside animate (?)
// function toggleMousePov() {

//     mousePov = !mousePov;

//     if (mousePov) {
//         console.log("going to mouse pov");
//         camera.camera3D.position.lerp(mouse.mesh.position, 0.03);
//     }
//     else {
//         camera.camera3D.position.lerp(new THREE.Vector3(0, 2, 10), 0.03);
//         camera.camera3D.lookAt(0, 5, 0);
//     }
// }
let walkStarted = false;
document.addEventListener("keydown", (event) => {
    // pause on spacebar
    if (event.code === "Space") {
        toggleAnimation();
    } if (event.key === 'p' || event.key === 'P') {
        camera.togglePerspective();
    } if (event.code === "ArrowRight") {
        mouse.switchEdge();
    } if (event.key === "w" && walkStarted == false) {
        mouse.toggleWalking(1, true);
        walkStarted = true;
    } if (event.key === "s" && walkStarted == false) {
        mouse.toggleWalking(-1, true);
        walkStarted = true;
    } if (event.key === 'v') {
     //   tesseract.toggleVisibility();
    } if (event.key === 'e') {
        camera.toggleMousePov();
    }
});


document.addEventListener("keyup", (event) => {
    // pause on spacebar
    if (event.key === 'w') {
        console.log("stopping");
        mouse.toggleWalking(1, false);
        walkStarted = false;
    } if (event.key === 's') {
        mouse.toggleWalking(-1, false);
        walkStarted = false;
    }
});
