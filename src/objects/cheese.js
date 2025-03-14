import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/** Cheese
 * 
 * Cheese
 */
export default class Cheese {
    // create hypercube
    constructor(cheeseList, edge, size = 0.2, positionOnEdge = 0.5, eatableTolerance = 0.2) {
        this.cheeseList = cheeseList;
        this.edge = edge;
        this.edge.addCheese(this); // insert self into edge
        this.position = this.edge.getCoords(this.edge.vertex1, positionOnEdge); // place halfway along edge
        this.eatableTolerance = eatableTolerance;

        // create a temporary mesh to join it to
        const geometry = new THREE.SphereGeometry(0.1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 'yellow', transparent: true, opacity: 0 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);

        this.model = null;
        this.sound = null;
        this.#loadModel(size);
        this.#loadSound();
    }

    updateMesh() {
        this.position = this.edge.getCoords(this.edge.vertex1, 0.5); // place halfway along edge
        this.mesh.position.copy(this.position);
    }

    eatable(mousePosition) {
        return this.position.distanceTo(mousePosition) <= this.eatableTolerance;
    }

    eat() {
        if (this.sound) {
            this.sound.play();
        }

        this.cheeseList.eatCheese(this);
        this.edge.removeCheese(this);
    }

    #loadSound() {
        const listener = new THREE.AudioListener();
        this.mesh.add(listener); // Attach to cheese

        const audioLoader = new THREE.AudioLoader();
        this.sound = new THREE.Audio(listener);

        audioLoader.load('assets/cheese_sound.wav', (buffer) => {
            this.sound.setBuffer(buffer);
            this.sound.setLoop(false); // Play only once
            this.sound.setVolume(1.0); // Adjust volume
            console.log("Sound loaded successfully!");
        });
    }

    #loadModel(size, position = [0, 0, 0]) {
        const loader = new GLTFLoader();
        loader.load('models/cheese.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(size, size, size); // adjust size of the cheese
            this.model.position.set(...position); // this sets the position relative to the sphere
            this.mesh.add(this.model); // attach model to sphere so it moves together
        });
    }
}