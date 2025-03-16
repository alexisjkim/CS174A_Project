import * as THREE from "three";
import { createRotationMatrixN, rotationMatrixY, translationMatrix } from "../utils";
import MatrixN from "./matrixN";

export default class Planet {
    constructor(
        hypercube,
        animParams = {
            orbitDistance: 8,
            orbitSpeed: 0.25,
            cubeRotationSpeed: 0.15,
            rotate: true,
            orbit: true,
            orbitTime: 0,
            rotationTime: 0,
        }
    ) {
        this.animParams = animParams;
        this.hypercube = hypercube;
        this.mesh = this.#createMesh();

        this.position = this.hypercube.getPosition();
        this.direction = this.#directionToOrigin();
    }

    // update state of planet's hypercube, and planets position/direciton vectors
    update() {
        this.hypercube.update();
        this.position = this.hypercube.getPosition();
        this.direction = this.#directionToOrigin();
    }

    // rotate the hypercube along a plane in n-dimensions
    rotate(timeDelta) {
        // get angle of rotation
        this.animParams.rotationTime += timeDelta;
        const angle =
            2 *
            this.animParams.cubeRotationSpeed *
            Math.PI *
            this.animParams.rotationTime;

        // rotate around a plane
        let modelTransformND = this.#rotationMatrix(angle);
                
        // apply that transformation matrix to the tesseract
        this.hypercube.copyNDTransformation(modelTransformND);
    }

    // orbits around (0, 0, 0)
    orbit(timeDelta) {
        this.animParams.orbitTime += timeDelta;
        let modelTransform3D = new THREE.Matrix4();

        // transformation matrix translates to orbit distance, then rotates based on speed
        modelTransform3D.premultiply(
            translationMatrix(this.animParams.orbitDistance, 0, 0)
        );
        modelTransform3D.premultiply(
            rotationMatrixY(
                this.animParams.orbitSpeed * this.animParams.orbitTime
            )
        );

        // apply transformation matrix to hypercube
        this.hypercube.copy3DTransformation(modelTransform3D);
    }

    #rotationMatrix(angle) {
        let modelTransformND = new MatrixN(this.hypercube.dimension);
        for(let i = 1; i <= this.hypercube.dimension-2; i++) {
            const rotate = createRotationMatrixN(
                this.hypercube.dimension,
                this.hypercube.dimension - i,
                this.hypercube.dimension - i-1,
                angle
            )
            modelTransformND = modelTransformND.multiply(rotate);
        }
        return modelTransformND; 
    }

    #directionToOrigin() {
        return new THREE.Vector3()
            .subVectors(new THREE.Vector3(0, 0, 0), this.position)
            .normalize();
    }

    #createMesh() {
        const mesh = new THREE.Group();
        mesh.add(this.hypercube.mesh);
        mesh.add(this.hypercube.wireframe.mesh);
        return mesh;
    }
}
