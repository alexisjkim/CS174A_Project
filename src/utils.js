import * as THREE from "three";
import MatrixN from "./objects/matrixN";
import VectorN from "./objects/vectorN";

// creates an axis line with color from start to end
function createAxisLine(color, start, end) {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ color: color });
    return new THREE.Line(geometry, material);
}

function createAxes(length, xColor, yColor, zColor) {
    const axes = new THREE.Group();
    axes.add(
        createAxisLine(
            xColor,
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(length, 0, 0)
        )
    ); // Red
    axes.add(
        createAxisLine(
            yColor,
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, length, 0)
        )
    ); // Yellow
    axes.add(
        createAxisLine(
            zColor,
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, length)
        )
    ); // Blue
    return axes;
}



function projectNDto3D(vectorN, camera) {
    const N = vectorN.size;
    const cameraND = camera.getCameraND(N);
    if(!cameraND) {
        console.error("Failed to project to 3D, did not find an N-th dimensional camera");
    }

    // transform vectr based on camera's position in n-dimensions
    const transformedVector = vectorN.clone().subtract(cameraND.position);

    // apply inverse camera basis
    let inverseCameraBasis = cameraND.basis.clone().invert();
    transformedVector.applyMatrixN(inverseCameraBasis); // Custom function for N-D matrix-vector multiplication

     // define a forward vector as first column of basis
    let forwardVector = new VectorN(N);
    for (let i = 0; i < N; i++) {
        forwardVector.set(i, cameraND.basis.get(i, N-1));
    }

    // compute depth along the forward direction, by using the vectors projection onto the forward vector
    let depthComponent = transformedVector.dot(forwardVector);
    let scaleFactor = 1; // Default scale for orthographic

    if (cameraND.usePerspective) {
        scaleFactor = depthComponent / cameraND.depth; // perspective scaling
    }

    if (Math.abs(scaleFactor) < 1e-6) scaleFactor = 1e-6; // dont divide by zero
    
    // Step 4: Extract the first three spatial components for 3D projection
    let projectedVector = new THREE.Vector3(
        transformedVector.get(0) / scaleFactor,
        transformedVector.get(1) / scaleFactor,
        transformedVector.get(2) / scaleFactor
    );

    const v = new THREE.Vector4(
        vectorN.get(0),
        vectorN.get(1),
        vectorN.get(2),
        vectorN.get(3)
    );
    
    return projectedVector;
}


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


// function rotationMatrixZW(theta) {
//     let cos = Math.cos(theta);
//     let sin = Math.sin(theta);

//     // Create a rotation matrix for the XY plane
//     return new THREE.Matrix4().set(
//         1, 0, 0, 0,
//         0, 1, 0, 0,
//         0, 0, cos, -sin,
//         0, 0, sin, cos
//     );
// }

// create a rotation matrix along axis i  & j, for an nxn matrix.
function createRotationMatrixN(n, i, j, theta) {
    // Create an identity matrix of size n x n
    if(i >= n || j >= n) {
        console.warn(`tried to rotate an ${n}x${n} matrix around an axes ${i} and ${j}`);
        return null;
    }
    let matrix = new MatrixN(n);

    // Set rotation values in the i-j plane
    let cosTheta = Math.cos(theta);
    let sinTheta = Math.sin(theta);

    matrix.elements[i][i] = cosTheta;
    matrix.elements[j][j] = cosTheta;
    matrix.elements[i][j] = -sinTheta;
    matrix.elements[j][i] = sinTheta;

    return matrix;
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
    const midpoint = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5);
    cylinder.position.copy(midpoint);

    // Align the cylinder with the edge direction
    cylinder.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize()
    );

    return cylinder;
}

function updateCylinder(cylinder, start, end) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();

    // Update position
    const midpoint = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5);
    cylinder.position.copy(midpoint);

    // Update rotation
    cylinder.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize()
    );

    // Update scale
    cylinder.scale.set(1, length / cylinder.geometry.parameters.height, 1);
}

// create a sphere at a position
function createSphere(position, radius, color) {
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: color });
    const sphere = new THREE.Mesh(geometry, material);

    sphere.position.copy(position);
    return sphere;
}

function createStars(size, color, number, minDistance, maxDistance) {
    const starVertices = [];

    for (let i = 0; i < number; i++) {
        let x, y, z, distance;

        // keep iterating until a point is beyond min distance... is there a better way?
        do {
            x = (Math.random() - 0.5) * 2 * maxDistance;
            y = (Math.random() - 0.5) * 2 * maxDistance;
            z = (Math.random() - 0.5) * 2 * maxDistance;
            distance = Math.sqrt(x * x + y * y + z * z);
        } while (distance < minDistance);

        starVertices.push(x, y, z);
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(starVertices, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
        color: color,
        size: size,
        sizeAttenuation: true,
    });

    return new THREE.Points(starGeometry, starMaterial);
}

function onWindowResize(camera, renderer) {
    camera.camera3D.aspect = window.innerWidth / window.innerHeight;
    camera.camera3D.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

export {
    projectNDto3D,
    translationMatrix,
    rotationMatrixY,
    createCylinder,
    updateCylinder,
    createSphere,
    createStars,
    createAxes,
    onWindowResize,
    createRotationMatrixN,
};



// Given a matrix of 4d vectors, rotate each one around the ZW axis by theta radians

// function rotateZW(v, theta) {
//     const cosT = Math.cos(theta);
//     const sinT = Math.sin(theta);

//     const x = v.x;
//     const y = v.y;
//     const z = v.z * cosT - v.w * sinT;
//     const w = v.z * sinT + v.w * cosT;

//     return new THREE.Vector4(x, y, z, w);
// }
// function createProjectionMatrix(camera) {
//     let cameraPosition4D = camera.position4D; // seperate vector representing cameras position in 4d (so we dont need homogeneous matrices)
//     let cameraBasis4D = camera.basis4D; // matrix representing camera coordinate system

//     // translate based ond camera position, and use inverse of basis
//     let cameraTransformationMatrix = new THREE.Matrix4();
//     cameraTransformationMatrix
//         .identity()
//         .makeTranslation(
//             -cameraPosition4D.x,
//             -cameraPosition4D.y,
//             -cameraPosition4D.z
//         )
//         .multiply(new THREE.Matrix4().copy(cameraBasis4D).invert()); // Inverse of camera basis

//     // create actual projection matrix
//     let projectionMatrix = new THREE.Matrix4();

//     if (camera.usePerspective4D) {
//         // perspective, with depth factor
//         let depthFactor = camera.depth4D;

//         projectionMatrix.set(
//             1,
//             0,
//             0,
//             0,
//             0,
//             1,
//             0,
//             0,
//             0,
//             0,
//             1,
//             0,
//             0,
//             0,
//             -1 / depthFactor,
//             1
//         );
//     } else {
//         // orthographic
//         projectionMatrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
//     }

//     // Combine the camera transformation with the projection matrix
//     projectionMatrix.multiply(cameraTransformationMatrix);

//     return projectionMatrix;
// }

// // BROKEN: create camera basis in 4d to point towards the origin, given its position
// function createCameraBasis4D(cameraPosition4D) {
//     let wAxis = cameraPosition4D.clone().normalize().negate(); // Points toward the origin

//     let tempUp = new THREE.Vector4(0, 1, 0, 0);
//     if (Math.abs(wAxis.y) > 0.9) tempUp.set(1, 0, 0, 0); // Adjust to avoid parallel case

//     let right = tempUp
//         .clone()
//         .sub(wAxis.clone().multiplyScalar(wAxis.dot(tempUp)))
//         .normalize(); // Make perpendicular to wAxis
//     let up = new THREE.Vector4()
//         .subVectors(tempUp, wAxis.clone().multiplyScalar(wAxis.dot(tempUp)))
//         .normalize(); // Perpendicular to both
//     let forward = new THREE.Vector4()
//         .subVectors(wAxis, up.clone().multiplyScalar(wAxis.dot(up)))
//         .normalize(); // Final perpendicular axis

//     let cameraBasis4D = new THREE.Matrix4().set(
//         right.x,
//         up.x,
//         forward.x,
//         wAxis.x,
//         right.y,
//         up.y,
//         forward.y,
//         wAxis.y,
//         right.z,
//         up.z,
//         forward.z,
//         wAxis.z,
//         right.w,
//         up.w,
//         forward.w,
//         wAxis.w
//     );

//     return cameraBasis4D;
// }