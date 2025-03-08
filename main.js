import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { project4DTo3D, createAxisLine, rotateZW } from './utils';
import Tesseract from './tesseract';
import Cheese from './cheese';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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

// material for wireframe
const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x00ff00,  // Green color
    linewidth: 5,     // Set the thickness of the lines (adjust as needed)
    linejoin: 'round'
});

/* Add x, y, z axes to the scene */

const xAxis = createAxisLine(0xff0000, new THREE.Vector3(0, 0, 0), new THREE.Vector3(5, 0, 0)); // Red
const yAxis = createAxisLine(0xffff00, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 5, 0)); // Yellow
const zAxis = createAxisLine(0x0000ff, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 5)); // Blue

scene.add(xAxis);
scene.add(yAxis);
scene.add(zAxis);

/* Create Tesseract */

const l = 2;
const d = 1;
let cameraPosition4D = new THREE.Vector4(0, 0, 0, 5);
let cameraBasis4D = new THREE.Matrix4().identity();
let mesh_visibility = true;

const tesseract = new Tesseract(
    l,
    d,
    lineMaterial,
    cameraPosition4D,
    cameraBasis4D,
    0.05,
    new THREE.Color(0x85f73e),
    0.08,
    new THREE.Color(0x881bb3),
)

tesseract.setMeshVisibility(mesh_visibility);
tesseract.setWireframeVisibility(!mesh_visibility);

scene.add(tesseract.mesh);
scene.add(tesseract.wireframe);

/* Create mouse */

const mouse_geometry = new THREE.SphereGeometry(0.1, 32, 32);
const mouse_material = new THREE.MeshBasicMaterial({ color: 'red' });
const mouse = new THREE.Mesh(mouse_geometry, mouse_material);

const walkingSpeed = 1;   // units per second
let walking = false;
let selectedEdge = 0;
let direction;

/* Set mouse position */
let mouse_position4d = new THREE.Vector4(l,l,l,l);
let mouse_position3d = project4DTo3D(mouse_position4d, cameraPosition4D, cameraBasis4D, d, true);
mouse.position.set(...mouse_position3d);
console.log(mouse_position3d);
scene.add(mouse);


/* Create cheese */
const cheese = new Cheese(scene, l, d, cameraPosition4D, cameraBasis4D);

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

        // mouse walk
        if(walking) {
            if(mouse_position4d.getComponent(selectedEdge) == direction*l) walking = false;
            else {
                mouse_position4d.setComponent(selectedEdge, mouse_position4d.getComponent(selectedEdge)+direction*walkingSpeed*delta_animation_time);
                if(mouse_position4d.getComponent(selectedEdge) > l) mouse_position4d.setComponent(selectedEdge, l);
                if(mouse_position4d.getComponent(selectedEdge) < -l) mouse_position4d.setComponent(selectedEdge, -l);
                //console.log(mouse_position4d.x);
            }
        }

        let mouse4d_rotated = rotateZW(mouse_position4d, rotation_angle);
        mouse_position3d = project4DTo3D(mouse4d_rotated, cameraPosition4D, cameraBasis4D, d, use_perspective);
        mouse.position.set(...mouse_position3d);
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
function switchEdge() {
    if(!walking) {
        selectedEdge++;
        if(selectedEdge == 4) selectedEdge = 0;
    }
    console.log(selectedEdge);
}
function walk() {
    if(!walking) {
        walking = true;
        direction = mouse_position4d.getComponent(selectedEdge) == l ? -1 : 1;
        console.log("walking!");
    }
}


document.addEventListener("keydown", (event) => {
    // pause on spacebar
    if (event.code === "Space") {
        toggleAnimation();
    } if (event.key === 'p' || event.key === 'P') {
        togglePerspective();
    } if (event.code === "ArrowRight") {
        switchEdge();
    } if (event.key === "Enter") {
        walk();
    } if (event.key === 'v') {
        mesh_visibility = !mesh_visibility;
        tesseract.setMeshVisibility(mesh_visibility);
        tesseract.setWireframeVisibility(!mesh_visibility);
    }
});