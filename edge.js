import * as THREE from 'three';
import { createCylinder, createSphere, project4DTo3D, rotateZW, updateCylinder } from './utils';

export default class Edge {

    constructor(vertex1, vertex2, radius, color) {

        this.vertex1 = vertex1;
        this.vertex2 = vertex2;

        this.start = new THREE.Vector3(...vertices[vertex1]);
        this.end = new THREE.Vector3(...vertices[vertex2]);
        
        this.mesh = createCylinder(start, end, radius, color);
    }

    update() {
    }
}