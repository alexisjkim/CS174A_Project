import * as THREE from 'three';
import { createSphere, project4DTo3D, rotateZW } from '../utils';

export default class Vertex {

    constructor(x, y, z, w, index, radius, color, camera) {
        this.index = index;
        this.baseVector = new THREE.Vector4(x, y, z, w);
        this.transformedVector = this.baseVector;
        this.edges = []; // store edges connected to this vertex

        this.baseColor = color;
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

    setColor(color = this.baseColor, glowColor = "0x000000", glowIntensity = 0) {
        this.mesh.material.color.set(color);
        this.mesh.material.emissive.set(glowColor);
        this.mesh.material.emissiveIntensity = glowIntensity; 
    }

    addEdge(edge) {
        this.edges.push(edge);
    }

    getEdge(index) {
        return this.edges[index];
    }
}