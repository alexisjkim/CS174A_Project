import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createAxisLine, project4DTo3D, rotateZW, rotateZW_mouse } from './utils';
import { cameraPosition } from 'three/tsl';


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

/* TESSERACT PARAMETERS */

let l = 2; // side length of tesseract
let d = 1; // depth factor
let cameraPosition4D = new THREE.Vector4(0, 0, 0, 5); // camera in 4d space
let cameraBasis4D = new THREE.Matrix4().identity(); // camera orientation

/* Generate a 4d hypercube */


const vertices4d = [];
for(let i = 0; i < 16; i++) {
    vertices4d.push(new THREE.Vector4(
        (i&1) ? l : -l,
        (i&2) ? l : -l,
        (i&4) ? l : -l,
        (i&8) ? l : -l
    ));
}

const edges = []; // edges stay the same regardless of dimension
for(let i = 0; i < 15; i++) {
    for(let j = i+1; j < 16; j++) {
        let diff = i ^ j;  // XOR to find differing bits
        if ((diff & (diff - 1)) === 0) { // Check if only one bit is different
            edges.push([i, j]);
        }
    }
}

console.log("vertices before projection: ", vertices4d);


/* Project the 4d vertices to 3d */

const vertices3d = [];
for (let i = 0; i < vertices4d.length; i++) {
    vertices3d.push(project4DTo3D(vertices4d[i], cameraPosition4D, cameraBasis4D, d, true));
}


/* Add the hypercube to the scene */

const positions = [];
edges.forEach(edge => {
    const vertexA = vertices3d[edge[0]];
    const vertexB = vertices3d[edge[1]];

    positions.push(vertexA.x, vertexA.y, vertexA.z);
    positions.push(vertexB.x, vertexB.y, vertexB.z);
});

const wireframe_geometry = new THREE.BufferGeometry();
wireframe_geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));

let tesseract = new THREE.LineSegments(wireframe_geometry, lineMaterial);
tesseract.matrixAutoUpdate = false;
scene.add(tesseract);

/* Create mouse */

const mouse_geometry = new THREE.SphereGeometry(0.1, 32, 32);
const mouse_material = new THREE.MeshBasicMaterial({ color: 'red' });
const mouse = new THREE.Mesh(mouse_geometry, mouse_material);

/* Set mouse position */

let mouse_position4d = new THREE.Vector4(l,l,l,l);
let mouse_position3d = project4DTo3D(mouse_position4d, cameraPosition4D, cameraBasis4D, d, true);
mouse.position.set(...mouse_position3d);
console.log(mouse_position3d);
scene.add(mouse);

/* ANIMATION PARAMETERS */

let isPaused = false;
let usePerspective = true;
let animation_time = 0;
let delta_animation_time;
const period = 4; // number of seconds for the shape to make a full rotation
const clock = new THREE.Clock();

	
function animate() {
    if (!isPaused) {
        delta_animation_time = clock.getDelta();
        animation_time += delta_animation_time;

        let rotation_angle = (2 * Math.PI / period) * animation_time;
        let vertices4d_rotated = rotateZW(vertices4d, rotation_angle);
        let mouse4d_rotated = rotateZW_mouse(mouse_position4d, rotation_angle);

        // Project the rotated 4D vertices to 3D
        const vertices3d = [];
        for (let i = 0; i < vertices4d.length; i++) {
            vertices3d.push(project4DTo3D(vertices4d_rotated[i], cameraPosition4D, cameraBasis4D, d, usePerspective));
        }

        mouse_position3d = project4DTo3D(mouse4d_rotated, cameraPosition4D, cameraBasis4D, d, usePerspective);

        // Update wireframe geometry
        const positions = [];
        edges.forEach(edge => {
            const vertexA = vertices3d[edge[0]];
            const vertexB = vertices3d[edge[1]];

            positions.push(vertexA.x, vertexA.y, vertexA.z);
            positions.push(vertexB.x, vertexB.y, vertexB.z);
        });

        wireframe_geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        wireframe_geometry.attributes.position.needsUpdate = true; // Ensure update
        mouse.position.set(...mouse_position3d);
    }

    controls.update(); // This will update the camera position and target based on the user input.

	renderer.render( scene, camera );

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
function togglePerspective() {
    usePerspective = !usePerspective;
}


document.addEventListener("keydown", (event) => {
    // pause on spacebar
    if (event.code === "Space") {
        toggleAnimation();
    } if (event.key === 'p' || event.key === 'P') {
        togglePerspective();
    }
});