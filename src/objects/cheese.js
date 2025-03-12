import * as THREE from 'three';
import { project4DTo3D } from '../utils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/** Cheese
 * 
 * Cheese
 */
export default class Cheese {
    // create tesseract
    constructor(tesseract, camera) {
        this.camera = camera;
        this.edge = tesseract.randomEdge();
        this.edge.addCheese(this); // insert self into edge
        this.position = this.edge.getCoords(this.edge.vertex1, 0.5, camera); // place halfway along edge

        // create a temporary mesh to join it to
        const geometry = new THREE.SphereGeometry(0.1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 'yellow', transparent: true, opacity: 0 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);

        this.model = null;

        const loader = new GLTFLoader();
        loader.load('models/cheese.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(0.2, 0.2, 0.2); // adjust size of the mouse
            this.model.position.set(0, 0, 0); // this sets the position relative to the sphere
            this.mesh.add(this.model); // attach model to sphere so it moves together
        });
    }

    updateMesh() {
        this.position = this.edge.getCoords(this.edge.vertex1, 0.5, this.camera); // place halfway along edge
        this.mesh.position.copy(this.position);
    }
}