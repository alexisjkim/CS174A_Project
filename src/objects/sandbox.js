import * as THREE from "three";
import Hypercube from "./hypercube";
import { createRotationMatrixN } from "../utils";
import MatrixN from "./matrixN";

// Scene
export default class Sandbox {
    constructor(camera) {
        this.camera = camera;
        this.params = {
            dimension: 4,
            cubeRotationSpeed: 0.15,
            rotate: true,
            orbit: true,
            rotationTime: 0,
            rotationNumber: 1,
        };
        this.cubeAttributes = {
            edgeLength: 4,
            edgeRadius: 0.05,
            edgeColor: new THREE.Color(0x555ba1),
            vertexRadius: 0.08,
            vertexColor: new THREE.Color(0xc2c7fc),
        };
        this.hypercube = new Hypercube(this.params.dimension, camera, this.cubeAttributes);
        this.mesh = this.#createMesh();
    }

    
    update(timeDelta) {
        this.rotate(timeDelta);
        this.hypercube.update();
    }

    changeDimension(dimension) {
        if (dimension > 0) {
            this.params.dimension = dimension;
            this.mesh.remove(this.hypercube.mesh);
            console.log("new cube", this.params.dimension, this.camera, this.cubeAttributes);
            this.hypercube = new Hypercube(
                this.params.dimension,
                this.camera,
                this.cubeAttributes
            );
            console.log(this.hypercube)
            this.mesh.add(this.hypercube.mesh);
        }
    }

    changeRotation(number) {
        if (number > 0)
        this.params.rotationNumber = number;
    }

    changeEdgeLength(number) {
        if (number > 0);
        {
            this.cubeAttributes.edgeLength = number;
            this.mesh.remove(this.hypercube.mesh);
            console.log("new cube", this.params.dimension, this.camera, this.cubeAttributes);
            this.hypercube = new Hypercube(
                this.params.dimension,
                this.camera,
                this.cubeAttributes
            );
            this.mesh.add(this.hypercube.mesh);
        }
    }

    changeColor() {
            this.cubeAttributes.edgeColor = this.getRandomColorHex();
            this.cubeAttributes.vertexColor = this.getRandomColorHex();
            this.mesh.remove(this.hypercube.mesh);
            console.log("new cube", this.params.dimension, this.camera, this.cubeAttributes);
            this.hypercube = new Hypercube(
                this.params.dimension,
                this.camera,
                this.cubeAttributes
            );
            this.mesh.add(this.hypercube.mesh);
    }

    toggleRotation() {
        this.params.rotate = !this.params.rotate;
    }

    getRandomColorHex() {
        return 0x000000 + Math.floor(Math.random() * 0xFFFFFF);
    }

    rotate(timeDelta) {
        if (this.params.rotate) {
            // get angle of rotation
            this.params.rotationTime += timeDelta;
            const angle =
                2 *
                this.params.cubeRotationSpeed *
                Math.PI *
                this.params.rotationTime;

            // rotate around a plane
            let modelTransformND = this.#rotationMatrix(angle);

            // apply that transformation matrix to the tesseract
            this.hypercube.copyNDTransformation(modelTransformND);
        }
    }

    #rotationMatrix(angle) {
        let modelTransformND = new MatrixN(this.hypercube.dimension);
        for (
            let i = 1;
            i <= this.hypercube.dimension - this.params.rotationNumber &&
            this.params.rotationNumber >= 1;
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

    #createMesh() {
        // create a ground plane
        const textureLoader = new THREE.TextureLoader();
        const groundTexture = textureLoader.load('../assets/grass_texture.png');
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshStandardMaterial({
            map: groundTexture,
            color: 0x93ff91,
            side: THREE.DoubleSide,
        }); 
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);

        // set its positioning
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(0, -5, 0);
        ground.receiveShadow = true;

        // add lights
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        const ambientLight = new THREE.AmbientLight(0x505050);
        directionalLight.position.set(0.5, 0.0, 1.0).normalize();
        
        // Add a Sun
        const sun = new THREE.DirectionalLight(0xfff8dc, 1.5); // Warm sunlight color
        sun.position.set(10, 20, 10);
        sun.castShadow = true;

        // Configure shadow properties
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 50;

        // add sky
        const skyGeometry = new THREE.SphereGeometry(100, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            side: THREE.BackSide,
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);

        const mesh = new THREE.Group();
        mesh.add(this.hypercube.mesh);
        mesh.add(ground);
        mesh.add(directionalLight);
        mesh.add(ambientLight);
        mesh.add(sun);
        mesh.add(sky);
        return mesh;
    }
}