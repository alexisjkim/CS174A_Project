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
 function project4DTo3D (vector4D, camera) {
    // transform 4d vector by subtracting camera position and multiplying by the inverse of the cameraBasis
    let transformedVector = new THREE.Vector4().subVectors(vector4D, camera.position4D);
    let inverseCameraBasis = new THREE.Matrix4().copy(camera.basis4D).invert();
    transformedVector.applyMatrix4(inverseCameraBasis);
    let projectedVector;

    // project to 3d, with perspective or orthographic projection
    let { x, y, z, w } = transformedVector;
    let scaleFactor;
    if (camera.usePerspective4D) {
        // perspective projection: x', y', z' = x/w, y/w, z/w
        scaleFactor = w/camera.depth4D;
    } else {
        // orthographic projection: divide by camera distance
        scaleFactor = camera.position4D.w;
    }
    if (scaleFactor === 0) scaleFactor = 1e-6; // no div by zero
    projectedVector = new THREE.Vector3(x / scaleFactor, y / scaleFactor, z / scaleFactor);

    return projectedVector;
}


// Given a matrix of 4d vectors, rotate each one around the ZW axis by theta radians

function rotateZW(v, theta) {
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    const x = v.x;
    const y = v.y;
    const z = v.z * cosT - v.w * sinT;
    const w = v.z * sinT + v.w * cosT;
    
    return new THREE.Vector4(x, y, z, w);
}

// create cylinder along an edge
function createCylinder(start, end, radius, color) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    
    // Create a cylinder along the Y-axis
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 16);
    const material = new THREE.MeshStandardMaterial({ color: color });
    const cylinder = new THREE.Mesh(geometry, material);

    // Position the cylinder at the midpoint
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    cylinder.position.copy(midpoint);

    // Align the cylinder with the edge direction
    cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());

    return cylinder;
}

function updateCylinder(cylinder, start, end) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    
    // Update position
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    cylinder.position.copy(midpoint);

    // Update rotation
    cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());

    // Update scale
    cylinder.scale.set(1, length / cylinder.geometry.parameters.height, 1);
}

// create a sphere at a position
function createSphere(position, radius, color) {
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: color });
    const sphere = new THREE.Mesh(geometry, material);
    
    sphere.position.set(...position);
    return sphere;
}


export { createAxisLine, createCameraBasis4d, project4DTo3D, rotateZW, createCylinder, updateCylinder, createSphere };