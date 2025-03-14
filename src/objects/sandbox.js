import * as THREE from "three";
import Hypercube from "./hypercube";
import { createRotationMatrixN } from "../utils";
import MatrixN from "./matrixN";

// Scene
export default class Sandbox {
    constructor(camera) {
        this.mesh = new THREE.Group();
        this.camera = camera;
        this.dimension = 4;
        this.animParams = {
            cubeRotationSpeed: 0.15,
            animate: true,
            rotationTime: 0,
            rotationNumber: 1,
        };
        this.params = {
            edgeLength: 4,
            edgeRadius: 0.05,
            edgeColor: new THREE.Color(0x555ba1),
            vertexRadius: 0.08,
            vertexColor: new THREE.Color(0xc2c7fc),
        };
        this.hypercube = new Hypercube(this.dimension, camera, this.params);
        this.mesh.add(this.hypercube.mesh);

        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x93ff91,
            side: THREE.DoubleSide,
        }); 
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(0, -5, 0);
        ground.receiveShadow = true;
        this.mesh.add(ground);

        // Add a Sun
        const sun = new THREE.DirectionalLight(0xfff8dc, 1.5); // Warm sunlight color
        sun.position.set(10, 20, 10);
        sun.castShadow = true;

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0.5, 0.0, 1.0).normalize();
        this.mesh.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0x505050); // Soft white light
        this.mesh.add(ambientLight);

        // Configure Shadow Properties
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 50;

        this.mesh.add(sun);
        // add sky

        const skyGeometry = new THREE.SphereGeometry(100, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            side: THREE.BackSide,
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.mesh.add(sky);
    }

    update(timeDelta) {
        this.rotate(timeDelta);
        this.hypercube.update();
    }

    changeDimension(dimension) {
        if (dimension > 0) {
            this.dimension = dimension;
            this.mesh.remove(this.hypercube.mesh);
            console.log("new cube", this.dimension, this.camera, this.params);
            this.hypercube = new Hypercube(
                this.dimension,
                this.camera,
                this.params
            );
            this.mesh.add(this.hypercube.mesh);
        }
    }

    changeRotation(number) {
        if (number > 0)
        this.animParams.rotationNumber = number;
    }

    changeEdgeLength(number) {
        if (number > 0);
        {
            this.params.edgeLength = number;
            this.mesh.remove(this.hypercube.mesh);
            console.log("new cube", this.dimension, this.camera, this.params);
            this.hypercube = new Hypercube(
                this.dimension,
                this.camera,
                this.params
            );
            this.mesh.add(this.hypercube.mesh);
        }
    }

    changeColor() {
            this.params.edgeColor = this.getRandomColorHex();
            this.params.vertexColor = this.getRandomColorHex();
            this.mesh.remove(this.hypercube.mesh);
            console.log("new cube", this.dimension, this.camera, this.params);
            this.hypercube = new Hypercube(
                this.dimension,
                this.camera,
                this.params
            );
            this.mesh.add(this.hypercube.mesh);
    }

    getRandomColorHex() {
        return 0x000000 + Math.floor(Math.random() * 0xFFFFFF);
    }

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

    #rotationMatrix(angle) {
        let modelTransformND = new MatrixN(this.hypercube.dimension);
        for (
            let i = 1;
            i <= this.hypercube.dimension - this.animParams.rotationNumber &&
            this.animParams.rotationNumber >= 1;
            i++
        ) {
            const rotate = createRotationMatrixN(
                this.hypercube.dimension,
                this.hypercube.dimension - i,
                this.hypercube.dimension - i - 1,
                angle
            );
            modelTransformND = modelTransformND.multiply(rotate);
        }
        return modelTransformND;
    }
}