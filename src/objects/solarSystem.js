import * as THREE from "three";
import Planet from "./planet";
import Tesseract from "./tesseract";

export default class SolarSystem {
    constructor(camera) {
        this.camera = camera;
        this.planets = [];
        this.sun = this.#createSun();
        this.mesh = this.#createMesh();
    }

    animate(animationTime) {
        this.planets.forEach((planet) => {
            planet.rotate(animationTime);
            planet.orbit(animationTime);
        });
        this.#animateSun(animationTime);
    }

    update() {
        this.planets.forEach((planet) => {
            planet.update();
        });
    }

    createPlanet({
        orbitDistance = 10,
        orbitSpeed = 0.25,
        numCheese = 1,
        edgeLength = 4,
        edgeRadius = 0.05,
        edgeColor = new THREE.Color(0x85f73e),
        vertexRadius = 0.08,
        vertexColor = new THREE.Color(0x881bb3),
        cubeRotationSpeed = 0.15,
    } = {}) {
        const hypercube = new Tesseract(this.camera, {
            edgeLength,
            edgeRadius,
            edgeColor,
            vertexRadius,
            vertexColor,
        });
    
        const planet = new Planet(hypercube, {
            orbitDistance,
            orbitSpeed,
            rotate4DSpeed: cubeRotationSpeed,
        });
    
        planet.createCheese(numCheese);
        this.planets.push(planet);
        this.mesh.add(planet.mesh);
    }

    getPlanet(planetNumber) {
        if (planetNumber < this.planets.length && planetNumber >= 0) {
            return this.planets[planetNumber];
        } else {
            console.error("invalid planet number provided to getPlanet()");
            return null;
        }
    }

    // TEMP
    linkCheeseDisplay(planetNum, display) {
        let planet = this.getPlanet(planetNum);
        if (planet) {
            console.log(planet)
            planet.cheeseList.linkDisplay(display.cheeseEaten, display.cheeseRemaining);
        }
    }

    #createSun(radius = 1, baseColor = 0xffffff) {
        let sunGeometry = new THREE.SphereGeometry(radius, 32, 32);
        let sunMaterial = new THREE.MeshBasicMaterial({ color: baseColor });
        return {
            position: new THREE.Vector3(0, 0, 0),
            mesh: new THREE.Mesh(sunGeometry, sunMaterial),
            light: new THREE.PointLight(0xffffff, 1, 0, 1),
        };
    }

    #animateSun(animationTime) {
        let period = animationTime % 10.0;
        let t = Math.abs(1 - period / 5);

        let radius = 1 + 2.0 * t;
        this.sun.mesh.scale.set(radius, radius, radius);

        let colorValue = new THREE.Color().lerpColors(
            new THREE.Color(0xff0000),
            new THREE.Color(0xffffff),
            t
        );
        this.sun.mesh.material.color.set(colorValue);

        // update sun light
        this.sun.light.color.set(colorValue);
        this.sun.light.power = Math.pow(10, radius);
    }

    #createMesh() {
        const mesh = new THREE.Group();
        mesh.add(this.sun.mesh);
        mesh.add(this.sun.light);
        return mesh;
    }
}
