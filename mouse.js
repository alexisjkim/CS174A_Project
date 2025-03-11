import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Mouse {
    constructor(startEdge, camera, speed = 1) {  
        // member vars
        this.camera = camera;
        this.edge = startEdge; // start on a provided edge
        this.vertex = this.edge.vertex1; // start on the edge's fist vertex
        this.position = this.vertex.getCoords(camera);
        this.offset = 0; // offset from vertex, 0 - 1
        this.speed = speed; // units per sec, neg is backwards
        this.walking = false; // true when the mouse is currently moving
        
        // temp mouse, sphere
        const geometry = new THREE.SphereGeometry(0.1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: "white", transparent: false, opacity: 1 });
        this.mesh = new THREE.Mesh(geometry, material);
        
        this.mesh.position.copy(this.position);
        console.log("sphere position: ", this.mesh.position);

        this.mouseMixer = null;
        this.model = null;

        const loader = new GLTFLoader();
        loader.load('models/mouse.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(0.2, 0.2, 0.2); // adjust size of the mouse
            this.model.position.set(0, 0, 0); // this sets the position relative to the sphere
            this.mesh.add(this.model); // attach model to sphere so it moves together

            console.log("model position: ", this.model.position);

            this.mouseMixer = new THREE.AnimationMixer(this.model);

            if (gltf.animations.length > 0) {
                let action = this.mouseMixer.clipAction(gltf.animations[0]); 
                action.play();
            }
        });

        this.highlightCurrentPosition();
    }

    // update actual mouse mesh
    updateMesh() {
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
        this.position = this.edge.getCoords(this.vertex, this.offset, this.camera);
        this.updateMesh();
    }

    // start/stop walking, can provide new speed
    toggleWalking(newSpeed = this.speed, walking = !this.walking) {
        this.walking = walking;
        this.speed = newSpeed;
    }

    highlightCurrentPosition() {
        this.edge.setColor(0xff0000, 0xff0000, 1);
        this.vertex.setColor(0x0000FF, 0x0000FF, 1);
        const otherVertex = this.edge.getOtherVertex(this.vertex);
        if(otherVertex) otherVertex.setColor(0xFFFF00, 0xFFFF00, 1);
    }

    switchEdge() {
        if(!this.walking && this.offset == 1) {
            this.vertex = this.edge.getOtherVertex(this.vertex);
            this.offset = 0;
        }
        console.log("Selected new edge:", this.edge);
    }
}