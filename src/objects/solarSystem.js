import * as THREE from "three";
import Planet from "./planet";
import Hypercube from "./hypercube";

export default class SolarSystem {
    constructor(camera) {
        this.camera = camera;
        this.planets = [];
        this.sun = this.#createSun();
        this.mesh = this.#createMesh();
    }

    animate(timeDelta) {
        this.planets.forEach((planet) => {
            if (planet.animParams.animate) {
                planet.rotate(timeDelta);
                planet.orbit(timeDelta);
            }
        });
        if (this.sun.animate) {
            this.#animateSun(timeDelta);
        }
    }

    update() {
        this.planets.forEach((planet) => {
            planet.update();
        });
    }

    toggleAnimation(object) {
        if(!object) {
            // toggle all animations
            this.planets.forEach((planet) => {
                planet.animParams.animate = !planet.animParams.animate;
            })
            this.sun.animate = !this.sun.animate;
        }
        // TODO toggle each one individually
    }

    createPlanet({
        animate = true,
        rotationTime = 0,
        orbitTime = 0,
        orbitDistance = 10,
        orbitSpeed = 0.25,
        numCheese = 1,
        edgeLength = 4,
        edgeRadius = 0.05,
        edgeColor = new THREE.Color(0x85f73e),
        vertexRadius = 0.08,
        vertexColor = new THREE.Color(0x881bb3),
        cubeRotationSpeed = 0.15,
        cubeDimension = 4,
    } = {}) {
        const hypercube = new Hypercube(cubeDimension, this.camera, {
            edgeLength,
            edgeRadius,
            edgeColor,
            vertexRadius,
            vertexColor,
        });

        const planet = new Planet(hypercube, {
            orbitDistance,
            orbitSpeed,
            cubeRotationSpeed,
            animate,
            orbitTime,
            rotationTime,
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
            console.log(planet);
            planet.cheeseList.linkDisplay(
                display.cheeseEaten,
                display.cheeseRemaining
            );
        }
    }

    #createSun(radius = 1, baseColor = 0xffffff) {
        let sunGeometry = new THREE.SphereGeometry(radius, 32, 32);
        let sunMaterial = new THREE.MeshBasicMaterial({ color: baseColor });
        return {
            position: new THREE.Vector3(0, 0, 0),
            animate: true,
            time: 0,
            mesh: new THREE.Mesh(sunGeometry, sunMaterial),
            light: new THREE.PointLight(0xffffff, 1, 0, 1),
        };
    }

    #animateSun(timeDelta) {
        this.sun.time += timeDelta;
        let period = this.sun.time % 10.0;
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
