import * as THREE from 'three';
import { project4DTo3D, rotateZW } from './utils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Tesseract from './tesseract';

/** Cheese
 * 
 * Cheese
 */
export default class Cheese {
    // create tesseract
    constructor(tesseract, camera) {
        this.tesseract = tesseract;
        this.camera = camera;
        this.edge = this.tesseract.randomEdge();
        this.position = new THREE.Vector4(0,0,0,0);
        //this.position = this.edge.getCoords(Math.random());

        // create a temporary mesh to join it to
        const geometry = new THREE.SphereGeometry(0.1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 'yellow', transparent: true, opacity: 0 });
        this.mesh = new THREE.Mesh(geometry, material);
        
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
}