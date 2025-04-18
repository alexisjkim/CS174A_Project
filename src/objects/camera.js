import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { generateOrthonormalBasis } from "../utils";
import MatrixN from "./matrixN";

export default class Camera {
    // create a camera, controls, and manually initialize 4D camera params
    constructor(renderer, depth4D = 1, perspective4D = true) {
        // 3D camera
        this.camera3D = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.controls3D = new OrbitControls(this.camera3D, renderer.domElement);
        this.coi = null; // center of interest (mouse, hypercube, etc...)
        this.offset = new THREE.Vector3(0, 0, 0); // offset from coi
        this.controlMode = "free";

        // store a list of cameras in arbitrary dimensions
        this.camerasND = [];
        // this.position4D = new THREE.Vector4(0, 0, 0, 5);
        // this.basis4D = new THREE.Matrix4().identity();
        // this.usePerspective4D = perspective4D;

        // set 3D camera position
        this.camera3D.position.copy(new THREE.Vector3(0, 2, 10)); 
        this.controls3D.target.copy(new THREE.Vector3(0, 5, 0));
    }

    // update camera's position
    update(smoothing = 0.5) {
        if (this.controlMode !== "free") {
            // retrieve objects position, or use origin
            let objectPosition;
            this.coi?.position
                ? (objectPosition = this.coi.position)
                : (objectPosition = new THREE.Vector3(0, 0, 0));

            // camera looks in object's specified direction, or at the object
            let direction;
            this.coi?.direction
                ? (direction = new THREE.Vector3()
                      .copy(this.coi.direction)
                      .normalize())
                : (direction = new THREE.Vector3(0, 0, 0));

            // use camera offset, either a global or relative value
            let offset;
            this.offset?.type === "relative"
                ? (offset = this.#computeRelativeOffset(this.offset.vector, direction))
                : (offset = this.offset);

            // camera positioned at object, with an offset, and looks in direciton
            const cameraPosition = new THREE.Vector3()
                .copy(objectPosition)
                .add(offset);
            const targetPosition = new THREE.Vector3()
                .copy(objectPosition)
                .add(direction);

            this.camera3D.position.lerp(cameraPosition, smoothing);
            this.controls3D.target.lerp(targetPosition, smoothing);

            // return to free camera if just repositioning
            if (
                this.controlMode === "reposition" &&
                this.camera3D.position.distanceTo(cameraPosition) < 0.01
            ) {
                this.controlMode = "free";
            }
        }
        this.controls3D.update(); // update the camera position and target based on the user input.
    }

    // follow an arbitrary object, which must have an accessible .position member var (vector)
    follow(
        object = null,
        offset = new THREE.Vector3(0, 0, 0),
        controlMode = "track"
    ) {
        this.coi = object;
        this.offset = offset;
        this.controlMode = controlMode;
    }

    getCameraND(N) {
        let camera = this.camerasND.find(camera => camera.dimension === N);
        if (camera) {
            return camera;
        } else {
            console.warn(`No camera found for ${N} dimensions.`);
            return null; // Return null if camera is not found
        }
    }

    setCameraND(N, position, basis, depth = 1, perspective = true) {
        let index = this.camerasND.findIndex(camera => camera.dimension === N);
        const forward = position.clone().normalize();

        const cameraND = {
            dimension: N,
            position: position,
            forward: forward,
            basis: basis,
            depth: depth,
            usePerspective: perspective,
        };

        if (index !== -1) {
            // replace with new camera if that dimension camera exists
            this.camerasND[index] = cameraND
        } else {
            // otherwise add a new camera for this dimension
            this.camerasND.push(cameraND);
        }
    }

    // set4D(
    //     position,
    //     basis,
    //     depth = this.depth4D,
    //     perspective = this.usePerspective4D
    // ) {
    //     this.position4D = position;
    //     this.basis4D = basis;
    //     this.depth4D = depth;
    //     this.usePerspective4D = perspective;
    // }

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


    // given a relative offset, which represents an offset relative to the camera direction so +x is +direction, transform the vector into world space
    #computeRelativeOffset(offset, direction) {
        const up = new THREE.Vector3(0, 1, 0); // define an up vector for the world space

        // right vector (k? from class)
        const right = new THREE.Vector3().crossVectors(up, direction).normalize();

        // if direction is almost parallel to up
        if (Math.abs(direction.dot(up)) > 0.999) {
            right.set(0, 0, 1); // Default right vector if direction is nearly vertical
        }

        // new up vector(j?)
        const newUp = new THREE.Vector3().crossVectors(direction, right).normalize();

        // transformation matrix into world space
        const matrix = new THREE.Matrix4();
        matrix.makeBasis(direction, newUp, right);

        // transform the offset into world space
        return offset.clone().applyMatrix4(matrix);
    }
}
