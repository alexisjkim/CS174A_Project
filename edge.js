import * as THREE from 'three';
import { createCylinder, createSphere, project4DTo3D, rotateZW, updateCylinder } from './utils';

export default class Edge {

    constructor(start, end, radius, color) {

        this.start = start;
        this.end = end;
        this.axis;

        for(let i = 0; i < 4; i++) {
            if(start.getComponent(i) != end.getComponent(i)) {
                this.axis = i;
                break;
            }
        }
        
        this.mesh = createCylinder(start, end, radius, color);
    }

    update() {
        updateCylinder(this.mesh, this.start, this.end);
    }

    getCoords(pos) {    // pos is in the range of 0 and 1
        if(pos < 0 || pos > 1) {
            console.error("pos must be in the range of 0 and 1");
            return;
        }

        let coords = this.start;
        coords.setComponent(this.axis, pos*2*l-l);
        return coords;
    }
}