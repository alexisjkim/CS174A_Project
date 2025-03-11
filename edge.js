import * as THREE from 'three';
import { createCylinder, createSphere, project4DTo3D, rotateZW, updateCylinder } from './utils';

export default class Edge {

    constructor(start, end, radius, color) {

        this.start = start;
        this.end = end;
        
        this.mesh = createCylinder(start, end, radius, color);
    }

    update() {
    }
}