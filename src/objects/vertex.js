import * as THREE from 'three';
import { createSphere, projectNDto3D } from '../utils';

export default class Vertex {

    constructor(vector, index, radius, color, camera) {
        this.index = index;
        this.edges = []; // store edges connected to this vertex
        this.baseVector = vector;
        this.transformedVector = this.baseVector.clone();
        this.projectedVector = projectNDto3D(this.transformedVector, camera);
        
        this.baseColor = color;
        this.mesh = createSphere(this.projectedVector, radius, color);
    }

    // update mesh in scene
    updateMesh() {
        this.mesh.position.copy(this.projectedVector);
    }

    /* Transform vertex in ND, project to 3D, transform in 3D */
    applyNDTransformation(matrix) {
        this.transformedVector = this.baseVector.clone();
        this.transformedVector.applyMatrixN(matrix);
    }

    projectTo3D(camera) {   
        this.projectedVector = projectNDto3D(this.transformedVector, camera);
    }


    apply3DTransformation(matrix) {
        this.projectedVector.applyMatrix4(matrix);
    }


    /* edges */
    addEdge(edge) {
        this.edges.push(edge);
    }

    getEdge(index) {
        return this.edges[index];
    }

    // customize color of an edge, call with no params to reset to original color
    setColor(color = this.baseColor, glowColor = "0x000000", glowIntensity = 0) {
        this.mesh.material.color.set(color);
        this.mesh.material.emissive.set(glowColor);
        this.mesh.material.emissiveIntensity = glowIntensity; 
    }
}