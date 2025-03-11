import * as THREE from 'three';
import { project4DTo3D, rotateZW } from './utils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/** Cheese
 * 
 * Cheese
 */
export default class Cheese {
    // create tesseract
    constructor(startPosition, camera) {
        this.camera = camera;
        this.position = startPosition;

        // create a temporary mesh to join it to
        const geometry = new THREE.SphereGeometry(0.1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 'yellow' });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.visible = false; // hide the mesh because we don't want to be seeing that
        
        let position3D = project4DTo3D(this.position, this.camera);
        this.mesh.position.set(...position3D);
        console.log("sphere position: ", this.mesh.position);

        this.model = null;

        const loader = new GLTFLoader();
        loader.load('models/cheese.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(0.2, 0.2, 0.2); // adjust size of the mouse
            this.model.position.set(0, 0, 0); // this sets the position relative to the sphere
            this.mesh.add(this.model); // attach model to sphere so it moves together
        });

    }

    updateCheese(rotation_angle, use_perspective) {
    
    }
}