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