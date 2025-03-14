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
    if(N < 4) {
        let x = vectorN.get(0) || 0;
        let y = vectorN.get(1) || 0;
        let z = vectorN.get(2) || 0;
        return new THREE.Vector3(x, y, z); 
    }

    const cameraND = camera.getCameraND(N);
    if(!cameraND) {
        console.error("Failed to project to 3D, did not find an N-th dimensional camera");
    }

    // transform vectr based on camera's position in n-dimensions
    const forward = cameraND.forward.clone().normalize();
    const transformedVector = vectorN.clone().subtract(cameraND.position);

    // apply inverse camera basis
    let inverseCameraBasis = cameraND.basis.clone().invert();
    if (!inverseCameraBasis) {
        console.error("camera basis inversion failed!");
        return new THREE.Vector3(0, 0, 0);
    }
    transformedVector.applyMatrixN(inverseCameraBasis); // Custom function for N-D matrix-vector multiplication

    // compute depth along the forward direction, by using the vectors projection onto the forward vector
    let depthComponent = transformedVector.dot(forward);
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
    
    return projectedVector;
}

// create ONB using gram schmidt process
function gramSchmidt(basis) {
    let orthogonalized = [];

    for (let i = 0; i < basis.length; i++) {
        let v = basis[i];

        // Subtract the projection of v onto all previous orthogonal vectors
        for (let j = 0; j < i; j++) {
            let projCoeff = v.dot(orthogonalized[j]);
            let proj = orthogonalized[j].clone().scale(projCoeff);
            v.subtract(proj);
        }

        // Add the orthogonalized vector to the list
        orthogonalized.push(v);
    }

    // Normalize all vectors to make them unit vectors
    return orthogonalized.map(v => v.normalize());
}

function generateBasis(forward, up) {
    let n = forward.size; // Dimension of the vectors
    let basis = [];

    // Normalize the forward vector as the first basis vector
    let e1 = forward.normalize();
    basis.push(e1);

    // Make sure the up vector is not parallel to forward
    let e2 = up.subtract(e1.clone().scale(e1.dot(up))).normalize();
    basis.push(e2);

    // Fill in additional vectors using arbitrary perpendicular choices
    for (let i = 2; i < n; i++) {
        let randomVec = VectorN.random(n); // Assume a function that generates a random vector
        let newVec = randomVec;

        // Remove components along existing basis vectors
        for (let j = 0; j < basis.length; j++) {
            newVec.subtract(basis[j].clone().scale(basis[j].dot(newVec)));
        }

        basis.push(newVec.normalize());
    }
    return basis;
}

function generateOrthonormalBasis(forward) {
    let N = forward.size;

    // Step 1: Find an appropriate 'up' vector that is not parallel to 'forward'
    let up = VectorN.random(N, true); // Generate a random unit vector

    // Ensure 'up' is not too close to 'forward' (to avoid near-zero cross products)
    while (Math.abs(forward.dot(up)) > 0.9) {
        up = VectorN.random(N, true); // Regenerate if too parallel
    }

    // Step 2: Construct an initial basis
    let basis = generateBasis(forward, up);

    // Step 3: Apply Gram-Schmidt process to make it orthonormal
    const arrayONB = gramSchmidt(basis);
    const matrixONB = new MatrixN(N);

    // Fill the matrix with basis vectors as columns
    for (let i = 0; i < N; i++) {
        let vector = arrayONB[i];
        for (let j = 0; j < N; j++) {
            matrixONB.set(j, i, vector.get(j));
        }
    }

    return matrixONB;
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
    let length = direction.length();
    if (length == 0) length = 0.1;

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
    generateOrthonormalBasis
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