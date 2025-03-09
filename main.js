import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createAxisLine } from './utils';
import Tesseract from './tesseract';

/* Set up the scene */ 

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

/* Change camera position */

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 2, 10); // Where the camera is.
controls.target.set(0, 5, 0); // Where the camera is looking towards.


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

/* Create Tesseract */

const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x00ff00,  // Green color
    linewidth: 5,     // Set the thickness of the lines (adjust as needed)
    linejoin: 'round'
});
let cameraPosition4D = new THREE.Vector4(0, 0, 0, 5);
let cameraBasis4D = new THREE.Matrix4().identity();

const tesseract = new Tesseract(
    2, // line length
    1, // depth factor?
    lineMaterial,
    cameraPosition4D,
    cameraBasis4D
)
scene.add(tesseract.getGeometry());

/* ANIMATION PARAMETERS */

let is_paused = false;
let use_perspective = true;
let animation_time = 0;
let delta_animation_time;
const period = 4; // number of seconds for the shape to make a full rotation
const clock = new THREE.Clock();

	
function animate() {
    if (!is_paused) {
        delta_animation_time = clock.getDelta();
        animation_time += delta_animation_time;

        let rotation_angle = (2 * Math.PI / period) * animation_time;
        tesseract.updateTesseract(rotation_angle, use_perspective);
    }

    controls.update(); // This will update the camera position and target based on the user input.

	renderer.render( scene,  camera );

}

// toggle animation (isPaused and clock)
function toggleAnimation() {
    is_paused = !is_paused;
    if (!is_paused) {
        clock.start(); // Reset delta time calculations when resuming
    } else {
        clock.stop(); // Stop updating delta time
    }
}
function togglePerspective() {
    use_perspective = !use_perspective;
}


document.addEventListener("keydown", (event) => {
    // pause on spacebar
    if (event.code === "Space") {
        toggleAnimation();
    } if (event.key === 'p' || event.key === 'P') {
        togglePerspective();
    }
});