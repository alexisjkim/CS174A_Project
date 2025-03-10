import * as THREE from 'three';
import { project4DTo3D, rotateZW } from './utils';

export default class Mouse {
    constructor(startPosition, edgeLength, camera, speed = 1) {
        this.walking = false; // true when the mouse is currently moving
        this.speed = speed; // units per sec
        this.selectedEdge = 0;
        this.direction = 1;
        this.camera = camera;
        this.position = startPosition;
        this.edgeLength = edgeLength; // is there a better way of detecting vertices?

        // temp mouse, sphere
        const geometry = new THREE.SphereGeometry(0.1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 'red' });
        this.mesh = new THREE.Mesh(geometry, material);
        
        let position3D = project4DTo3D(this.position, this.camera);
        this.mesh.position.set(...position3D);
        console.log(position3D);
    }

    // update actual mouse mesh
    update(rotationAngle) {
        let rotatedPosition4D = rotateZW(this.position, rotationAngle);
        let position3D = project4DTo3D(rotatedPosition4D, this.camera);
        this.mesh.position.set(...position3D);
    }

    // update position
    walk(timeDelta) {
        if(this.walking) {
            if(this.position.getComponent(this.selectedEdge) == this.direction*this.edgeLength) {
                // stop walking when a vertex is reached
                this.walking = false;
            }
            else {
                // otherwise increment position along selected edge
                this.position.setComponent(this.selectedEdge, this.position.getComponent(this.selectedEdge) + this.direction*this.speed*timeDelta);
                if(this.position.getComponent(this.selectedEdge) > this.edgeLength) this.position.setComponent(this.selectedEdge, this.edgeLength);
                if(this.position.getComponent(this.selectedEdge) < -this.edgeLength) this.position.setComponent(this.selectedEdge, -this.edgeLength);
            }
        }
    }

    toggleWalking() {
        this.walking = !this.walking;
        this.direction = this.position.getComponent(this.selectedEdge) == this.direction*this.edgeLength ? -this.direction : this.direction;
        console.log(this.direction);
    }

    switchEdge() {
        if(!this.walking) {
            this.selectedEdge++;
            if(this.selectedEdge == 4) this.selectedEdge = 0;
        }
        console.log("Selected new edge:", this.selectedEdge);
    }
}