import * as THREE from 'three';
import { createSphere, project4DTo3D, rotateZW } from './utils';

export default class Vertex {

    constructor(x, y, z, w, index, radius, color, camera) {
        this.index = index;
        this.baseVector = new THREE.Vector4(x, y, z, w);
        this.transformedVector = this.baseVector;
        this.mesh = createSphere(project4DTo3D(this.transformedVector, camera), radius, color);

    }

    updateMesh(camera) {
        this.mesh.position.copy(project4DTo3D(this.transformedVector, camera));
    }

    rotate(rotationAngle) {
        this.transformedVector = rotateZW(this.baseVector, rotationAngle);
    }

    getCoords(camera) {
        // return vertex vector projected into 3d
        return project4DTo3D(this.transformedVector, camera);
    }
}