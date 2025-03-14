import * as THREE from "three";
import { rotationMatrixY, rotationMatrixZW, translationMatrix } from "../utils";
import CheeseList from "./cheeseList";
import Cheese from "./cheese";

export default class Planet {
    constructor(
        hypercube,
        animParams = { orbitDistance: 8, orbitSpeed: 0.25, cubeRotationSpeed: 0.15,  animate: true, orbitTime: 0, rotationTime: 0 }
    ) {
        this.animParams = animParams;
        this.hypercube = hypercube;
        this.cheeseList = new CheeseList();
        this.mesh = this.#createMesh();

        this.position = this.hypercube.getPosition();
        this.direction = this.#directionToOrigin();
    }

    update() {
        this.cheeseList.update();
        this.hypercube.update();
        this.position = this.hypercube.getPosition();
        this.direction = this.#directionToOrigin();
    }

    rotate(timeDelta) {
        this.animParams.rotationTime += timeDelta;
        let modelTransform4D = new THREE.Matrix4();
        modelTransform4D.multiply(
            rotationMatrixZW(2 * this.animParams.cubeRotationSpeed * Math.PI * this.animParams.rotationTime)
        );
        this.hypercube.copy4DTransformation(modelTransform4D);
    }

    orbit(timeDelta) {
        // orbits around (0, 0, 0)
        this.animParams.orbitTime += timeDelta;
        let modelTransform3D = new THREE.Matrix4();
        modelTransform3D.premultiply(
            translationMatrix(this.animParams.orbitDistance, 0, 0)
        );
        modelTransform3D.premultiply(
            rotationMatrixY(this.animParams.orbitSpeed * this.animParams.orbitTime)
        );
        this.hypercube.copy3DTransformation(modelTransform3D);
    }

    createCheese(numCheese) {
        
    }

    #directionToOrigin() {
        return new THREE.Vector3()
            .subVectors(new THREE.Vector3(0, 0, 0), this.position)
            .normalize();
    }

    #createMesh() {
        const mesh = new THREE.Group();
        mesh.add(this.hypercube.mesh);
        mesh.add(this.cheeseList.mesh);
        return mesh;
    }
}
