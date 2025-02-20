import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

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

const vertices4d = [];
for(let i = 0; i < 16; i++) {
    vertices4d.push(new THREE.Vector4(
        (i&1) ? 1 : -1,
        (i&2) ? 1 : -1,
        (i&4) ? 1 : -1,
        (i&8) ? 1 : -1
    ));
}

const edges4d = [];
for(let i = 0; i < 15; i++) {
    for(let j = i+1; j < 16; j++) {
        if(i^j == 1) edges4d.push([i, j]);
    }
}

camera.position.z = 5;

function createAxisLine(color, start, end) {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ color: color });
    return new THREE.Line(geometry, material);
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

// Create axis lines
const xAxis = createAxisLine(0xff0000, new THREE.Vector3(0, 0, 0), new THREE.Vector3(5, 0, 0)); // Red
const yAxis = createAxisLine(0x00ff00, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 5, 0)); // Green
const zAxis = createAxisLine(0x0000ff, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 5)); // Blue

// Add axes to scene
scene.add(xAxis);
scene.add(yAxis);
scene.add(zAxis);


// Change camera position
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 5, 10); // Where the camera is.
controls.target.set(0, 5, 0); // Where the camera is looking towards.
	

function animate() {

    controls.update(); // This will update the camera position and target based on the user input.

	renderer.render( scene, camera );

}