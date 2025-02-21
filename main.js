import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// Setting up the lights
const pointLight = new THREE.PointLight(0xffffff, 100, 100);
pointLight.position.set(5, 5, 5); // Position the light
scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0.5, .0, 1.0).normalize();
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x505050);  // Soft white light
scene.add(ambientLight);

const phong_material = new THREE.MeshPhongMaterial({
    color: 0x00ff00, // Green color
    shininess: 100   // Shininess of the material
});

class Vector5 {
    constructor(x = 0, y = 0, z = 0, w = 0, v = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        this.v = v;
    }

    set(x, y, z, w, v) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        this.v = v;
        return this;
    }

    log() {
        console.log(`Vector5(${this.x}, ${this.y}, ${this.z}, ${this.w}, ${this.v})`);
    }
}

class Matrix5 {
    constructor() {
        this.elements = new Float32Array(25).fill(0); // Initialize with zeros
    }

    set(row, col, value) {
        this.elements[row * 5 + col] = value;
    }

    get(row, col) {
        return this.elements[row * 5 + col];
    }

    log() {
        for (let i = 0; i < 5; i++) {
            console.log(this.elements.slice(i * 5, i * 5 + 5));
        }
    }
}

 /** Given a 4d vector, return its perspective or orthographic projection onto 3d.
  * vector4D: Initial vector
  * cameraPosition: position of 3d axis in 4d space
  * cameraMatrix: matrix that transforms to camera basis
  * d: depth factor (only perspective projection)
  * perspective: use perspective or orthographic projection
  */
 function project4DTo3D (vector4D, cameraPosition4D, cameraBasis4D, d, perspective) {
    // transform 4d vector by subtracting camera position and multiplying by the inverse of the cameraBasis
    let transformedVector = new THREE.Vector4().subVectors(vector4D, cameraPosition4D);
    let inverseCameraBasis = new THREE.Matrix4().copy(cameraBasis4D).invert();
    transformedVector.applyMatrix4(inverseCameraBasis);
    let projectedVector;

    // project to 3d, with perspective or orthographic projection
    let { x, y, z, w } = transformedVector;
    if (perspective) {
        // perspective projection: x', y', z' = x/w, y/w, z/w
        let scaleFactor = w/d;
        if (scaleFactor === 0) scaleFactor = 1e-6; // no div by zero
        projectedVector = new THREE.Vector3(x / scaleFactor, y / scaleFactor, z / scaleFactor);
    } else {
        // orthographic projection = drop the w-coordinate
        projectedVector = new THREE.Vector3(x, y, z);
    }

    return projectedVector;
}

const vertices4d = [];
for(let i = 0; i < 16; i++) {
    vertices4d.push(new THREE.Vector4(
        (i&1) ? 1 : -1,
        (i&2) ? 1 : -1,
        (i&4) ? 1 : -1,
        (i&8) ? 1 : -1
    ));
}

const edges3d = [
    [0, 1],
    [0, 2],
    [0, 4],
    [0, 8],
    [1, 3],
    [1, 5],
    [1, 9],
    [2, 3],
    [2, 6],
    [2, 10],
    [3, 7],
    [3, 11],
    [4, 5],
    [4, 6],
    [4, 12],
    [5, 7],
    [5, 13],
    [6, 7],
    [6, 14],
    [7, 15],
    [8, 9],
    [8, 10],
    [8, 12],
    [9, 11],
    [9, 13],
    [10, 11],
    [10, 14],
    [11, 15],
    [12, 13],
    [12, 14],
    [13, 15],
    [14, 15]
];

console.log("vertices before projection: ", vertices4d);
console.log("edges before projection: ", edges3d);

//camera.position.z = 2;

function createAxisLine(color, start, end) {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ color: color });
    return new THREE.Line(geometry, material);
}



/* Project the 4d vertices and edges to 3d */

// Define a camera in 4d space
let cameraPosition4D = new THREE.Vector4(0, 0, 0, 5); // Camera at w = 5
let cameraBasis4D = new THREE.Matrix4().identity(); // Default orientation
let d = 1; // depth factor

const vertices3d = [];
for (let i = 0; i < vertices4d.length; i++) {
    vertices3d.push(project4DTo3D(vertices4d[i], cameraPosition4D, cameraBasis4D, d, true))
}

// const edges3d = [];
// for (let i = 0; i < vertices4d.length; i++) {
//     edges3d.push(project4DTo3D(edges4d[i], cameraPosition4D, cameraBasis4D, d, true))
// }

console.log("vertices after projection: ", vertices3d);
console.log("edges after projection: ", edges3d);


// Create axis lines
const xAxis = createAxisLine(0xff0000, new THREE.Vector3(0, 0, 0), new THREE.Vector3(5, 0, 0)); // Red
const yAxis = createAxisLine(0x00ff00, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 5, 0)); // Green
const zAxis = createAxisLine(0x0000ff, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 5)); // Blue

// Add axes to scene
scene.add(xAxis);
scene.add(yAxis);
scene.add(zAxis);


// add shape to scene
const x = new Float32Array();
for (let i = 0; i < x.length; i++) {
    for (let j = 0; j < 3; j++) {
        x.push(vertices3d[i][j]);
    }
}

const positions = [];
edges3d.forEach(edge => {
    const vertexA = vertices3d[edge[0]];
    const vertexB = vertices3d[edge[1]];

    positions.push(vertexA.x, vertexA.y, vertexA.z);
    positions.push(vertexB.x, vertexB.y, vertexB.z);
});

const wireframe_geometry = new THREE.BufferGeometry();
wireframe_geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));

let tesseract = new THREE.LineSegments(wireframe_geometry, phong_material);
tesseract.matrixAutoUpdate = false;
scene.add(tesseract);


// Change camera position
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 5, 10); // Where the camera is.
controls.target.set(0, 5, 0); // Where the camera is looking towards.
	

function animate() {

    controls.update(); // This will update the camera position and target based on the user input.

	renderer.render( scene, camera );

}