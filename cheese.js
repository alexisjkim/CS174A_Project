import * as THREE from 'three';
import { project4DTo3D, rotateZW } from './utils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/** Cheese
 * 
 * Cheese(l, camera4D) constructs the cheese
 * updateGeometry(rotation_angle, use_perspective) to update position of tesseract.
 */
export default class Cheese {
    // create tesseract
    constructor(scene, camera4D) {
        this.camera = camera4D;

        const loader = new GLTFLoader();
        loader.load(
            'models/cheese.glb',
            function (gltf) {
                const cheese = gltf.scene;
                cheese.position.set(0, 0, 0);
                cheese.scale.set(1, 1, 1);
                scene.add(cheese);
            },
            function (xhr) {
                console.log(`Loading: ${(xhr.loaded / xhr.total) * 100}% completed`);
            },
            function (error) {
                console.error('Error loading model:', error);
            }
        );

    }

    updateCheese(rotation_angle, use_perspective) {
    
    }
}