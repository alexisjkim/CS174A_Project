import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Mouse {
    constructor(startEdge, speed = 1, size = 0.2) {  
        // objects
        this.edge = startEdge; // start on a provided edge
        this.vertex = this.edge.vertex1; // start on the edge's fist vertex

        // state
        this.position = this.vertex.projectedVector.clone();
        this.direction = this.#directionToTargetVertex();
        this.offset = 0; // offset from vertex, 0 - 1
        this.nextEdgeIndex = 0;
        this.speed = speed; // units per sec, neg is backwards
        this.walking = false; // true when the mouse is currently moving
        
        // temp mouse, sphere
        const geometry = new THREE.SphereGeometry(0.1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: "white", transparent: true, opacity: 0 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);

        this.animation = null; 
        this.model = null;
        this.#loadModel(size); // load mouse model

        this.#highlightCurrentPosition(); // change colors of current edge/vertices 
    }

    // update actual mouse mesh
    update() {
        this.mesh.position.copy(this.position);
    }

    // update position
    walk(timeDelta) {
        if(this.walking) {
            // update offset when when walking
            this.offset += timeDelta*this.speed;
            // stop walking when offset reaches 0 or 1
            if(this.offset >= 1) {
                this.offset = 1;
                this.walking = false;
            } else if (this.offset < 0) {
                this.offset = 0;
                this.walking = false;
            }
        }
        // update based on offset
        this.position = this.edge.getCoords(this.vertex, this.offset);
        this.direction = this.#directionToTargetVertex();
        this.edge.checkCheeses(this.position);
    }

    // start/stop walking, can provide new speed
    toggleWalking(newSpeed = this.speed, walking = !this.walking) {
        this.walking = walking;
        this.speed = newSpeed;
    }

    switchEdge(direction = 1) {
        // update current vertex and previous edge
        this.#unhighlightCurrentPosition();

        if(this.offset >= 1) {
            this.vertex = this.edge.getOtherVertex(this.vertex);
        }

        // find next edge
        let edge;
        do {
            let d = this.vertex.getDimension();
            this.nextEdgeIndex = ((this.nextEdgeIndex + 1 * direction) % d + d) % d;
            edge = this.vertex.getEdge(this.nextEdgeIndex);
        } while (edge == this.edge);

        this.offset = 0;
        this.edge = edge;
        this.#highlightCurrentPosition();
    }

    hideMouse() {
        this.mesh.material.visible = false;
        if (this.model) this.model.visible = false;
    }

    showMouse() {
        this.mesh.material.visible = true;
        if (this.model) this.model.visible = true;
    }

    #directionToTargetVertex() {
        return new THREE.Vector3().subVectors(this.edge.getOtherVertex(this.vertex).projectedVector.clone(), this.position).normalize();
    }

    #highlightCurrentPosition() {
        this.edge.setColor(0xff0000, 0xff0000, 1);
        this.vertex.setColor(0x0000FF, 0x0000FF, 1);
        const otherVertex = this.edge.getOtherVertex(this.vertex);
        if(otherVertex) otherVertex.setColor(0xFFFF00, 0xFFFF00, 1);
    }

    #unhighlightCurrentPosition() {
        this.edge.setColor();
        this.vertex.setColor();
        const otherVertex = this.edge.getOtherVertex(this.vertex);
        if(otherVertex) otherVertex.setColor();
    }


    #loadModel(size, position = [0, 0, 0]) {
        const loader = new GLTFLoader();
        loader.load('models/mouse.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(size, size, size); // adjust size of the mouse
            this.model.position.set(...position); // this sets the position relative to the sphere
            this.mesh.add(this.model); // attach model to sphere so it moves together

            this.animation = new THREE.AnimationMixer(this.model);

            if (gltf.animations.length > 0) {
                let action = this.animation.clipAction(gltf.animations[0]); 
                action.play();
            }
        });
    }
}