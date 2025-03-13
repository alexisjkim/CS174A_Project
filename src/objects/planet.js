import * as THREE from "three";
import { rotationMatrixY, rotationMatrixZW, translationMatrix } from "../utils";
import CheeseList from "./cheeseList";
import Cheese from "./cheese";

export default class Planet {
    constructor(
        hypercube,
        animParams = { orbitDistance: 8, orbitSpeed: 0.25, rotate4DSpeed: 0.15 }
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

    rotate(time) {
        let modelTransform4D = new THREE.Matrix4();
        modelTransform4D.multiply(
            rotationMatrixZW(2 * this.animParams.rotate4DSpeed * Math.PI * time)
        );
        this.hypercube.apply4DTransformation(modelTransform4D);
    }

    orbit(time) {
        // orbits around (0, 0, 0)
        let modelTransform3D = new THREE.Matrix4();
        modelTransform3D.premultiply(
            translationMatrix(this.animParams.orbitDistance, 0, 0)
        );
        modelTransform3D.premultiply(
            rotationMatrixY(this.animParams.orbitSpeed * time)
        );
        this.hypercube.apply3DTransformation(modelTransform3D);
    }

    createCheese(numCheese) {
        for (let i = 0; i < numCheese; i++) {
            const edge = this.hypercube.randomEdge();
            this.cheeseList.addCheese(new Cheese(this.cheeseList, edge));
        }
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
