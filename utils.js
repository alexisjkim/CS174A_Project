import * as THREE from 'three';

// creates an axis line with color from start to end
function createAxisLine(color, start, end) {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ color: color });
    return new THREE.Line(geometry, material);
}

// BROKEN: create camera basis in 4d to point towards the origin, given its position
function createCameraBasis4d(cameraPosition4D) {
    let wAxis = cameraPosition4D.clone().normalize().negate(); // Points toward the origin

    let tempUp = new THREE.Vector4(0, 1, 0, 0);
    if (Math.abs(wAxis.y) > 0.9) tempUp.set(1, 0, 0, 0); // Adjust to avoid parallel case

    let right = tempUp.clone().sub(wAxis.clone().multiplyScalar(wAxis.dot(tempUp))).normalize(); // Make perpendicular to wAxis
    let up = new THREE.Vector4().subVectors(tempUp, wAxis.clone().multiplyScalar(wAxis.dot(tempUp))).normalize(); // Perpendicular to both
    let forward = new THREE.Vector4().subVectors(wAxis, up.clone().multiplyScalar(wAxis.dot(up))).normalize(); // Final perpendicular axis

    let cameraBasis4D = new THREE.Matrix4().set(
        right.x, up.x, forward.x, wAxis.x,
        right.y, up.y, forward.y, wAxis.y,
        right.z, up.z, forward.z, wAxis.z,
        right.w, up.w, forward.w, wAxis.w
    );

    return cameraBasis4D;
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
    let scaleFactor;
    if (perspective) {
        // perspective projection: x', y', z' = x/w, y/w, z/w
        scaleFactor = w/d;
    } else {
        // orthographic projection: divide by camera distance
        scaleFactor = cameraPosition4D.w;
    }
    if (scaleFactor === 0) scaleFactor = 1e-6; // no div by zero
    projectedVector = new THREE.Vector3(x / scaleFactor, y / scaleFactor, z / scaleFactor);

    return projectedVector;
}


// Given a matrix of 4d vectors, rotate each one around the ZW axis by theta radians
function rotateZW(vertices, theta) {
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    
    return vertices.map(v => {
        const x = v.x;
        const y = v.y;
        const z = v.z * cosT - v.w * sinT;
        const w = v.z * sinT + v.w * cosT;
        
        return new THREE.Vector4(x, y, z, w);
    });
}


function rotateZW_mouse(v, theta) {
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    const x = v.x;
    const y = v.y;
    const z = v.z * cosT - v.w * sinT;
    const w = v.z * sinT + v.w * cosT;
    
    return new THREE.Vector4(x, y, z, w);
}


// Classes for 5d vector and 5d matrix; useful for homogeneous representation of 4d objects
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


export { createAxisLine, createCameraBasis4d, project4DTo3D, rotateZW, rotateZW_mouse, Vector5, Matrix5 };