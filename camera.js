import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class Camera {
    // create a camera, controls, and manually initialize 4D camera params
    constructor(renderer, depth4D = 1, perspective4D = true) {
        // 3D camera
        this.camera3D = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.controls3D = new OrbitControls(this.camera3D, renderer.domElement);
        this.useMousePov = false; // true if you are looking from the mouse pov; false if birds eye view

        // 4D camera
        this.position4D = new THREE.Vector4(0, 0, 0, 5);
        this.basis4D = new THREE.Matrix4().identity();
        this.depth4D = depth4D;
        this.usePerspective4D = perspective4D;
        
        // set 3D camera position
        this.camera3D.position.set(0, 2, 10); // Where the camera is.
        this.controls3D.target.set(0, 5, 0); // Where the camera is looking towards.
        
    }

    update(mousePosition) {
        if (this.useMousePov) {
            let targetPosition = new THREE.Vector3().copy(mousePosition).add(new THREE.Vector3(0, 2, -5));
            this.camera3D.position.lerp(targetPosition, 0.05);
            
            this.controls3D.target.copy(mousePosition);
        }
        this.controls3D.update();
    }
    
    toggleMousePov() {
        this.useMousePov = !this.useMousePov;
        if (this.useMousePov) {
            // Set OrbitControls to focus on the mouse
            this.camera3D.controls3D.enabled = true;
            this.camera3D.controls3D.target.copy(mouse.mesh.position);  
            this.camera3D.controls3D.enablePan = false; // Disable panning
        }
    }

    togglePerspective() {
        this.usePerspective4D = !this.usePerspective4D;
    }
}