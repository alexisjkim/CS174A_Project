import * as THREE from 'three';
import { createCylinder, createSphere, project4DTo3D, rotateZW, updateCylinder } from './utils';

/** Tesseract
 * 
 * Tesseract(l, camera, meshParams, wireframeMaterial) constructs the tesseract object.
 * updateGeometry(rotation_angle, use_perspective) to update position of tesseract.
 */
export default class Tesseract {
    // create tesseract
    constructor(l, camera, meshParams, wireframeMaterial) {
        // member vars
        this.l = l;
        this.vertices4D = [];
        this.edges = [];
        this.camera = camera;
        this.wireframeGeometry = new THREE.BufferGeometry();
        this.showMesh = true; // else display wireframe
        
        // create 4d vertices
        for(let i = 0; i < 16; i++) {
            this.vertices4D.push(new THREE.Vector4(
                (i&1) ? l : -l,
                (i&2) ? l : -l,
                (i&4) ? l : -l,
                (i&8) ? l : -l
            ));
        }
        
        // create edges
        for(let i = 0; i < 15; i++) {
            for(let j = i+1; j < 16; j++) {
                let diff = i ^ j;  // XOR to find differing bits
                if ((diff & (diff - 1)) === 0) { // Check if only one bit is different
                    this.edges.push([i, j]);
                }
            }
        }

        // project to 3d
        const vertices3D = [];
        for (let i = 0; i < this.vertices4D.length; i++) {
            vertices3D.push(project4DTo3D(this.vertices4D[i], camera));
        }
        
        this.wireframe = this.#createWireframe(vertices3D, wireframeMaterial);
        this.mesh = this.#createMesh(vertices3D, this.edges, meshParams);
    }

    update(rotationAngle) {
        // rotate vertices, then recalculate 3D projection
        let rotatedVertices4D = this.vertices4D.map(v => rotateZW(v, rotationAngle));
    
        const vertices3D = [];
        for (let i = 0; i < this.vertices4D.length; i++) {
            vertices3D.push(project4DTo3D(rotatedVertices4D[i], this.camera));
        }
    
        this.#updateWireframe(vertices3D);
        this.#updateMesh(vertices3D);
    }

    toggleVisibility() {
        // toggle between mesh and wireframe
        if(this.showMesh) {
            this.mesh.visible = true;
            this.wireframe.visible = false;
        } else {
            this.mesh.visible = false;
            this.wireframe.visible = true;
        }
        this.showMesh = !this.showMesh;
    }

    #createMesh(vertices, edges, params) {
        const group = new THREE.Group(); // collection of cylinders and spheres
        const cylinders = [];
        const spheres = [];
        const { edgeRadius, edgeColor, vertexRadius, vertexColor } = params;
    
        edges.forEach(edge => {
            const [startVertex, endVertex] = edge;
            const start = new THREE.Vector3(...vertices[startVertex]);
            const end = new THREE.Vector3(...vertices[endVertex]);
            const cylinder = createCylinder(start, end, edgeRadius, edgeColor);

            // store cylinders
            cylinders.push({ mesh: cylinder, startVertex, endVertex }); 
            group.add(cylinder);
        });

        vertices.forEach((vertex, index) => {
            const sphere = createSphere(vertex, vertexRadius, vertexColor);

            // store spheres
            spheres.push({ mesh: sphere, index }); 
            group.add(sphere);
        });

        group.attributes = { cylinders, spheres, vertices, edges }; // store attributes of the mesh
        return group;
    }

    #updateMesh(vertices) {
        const { cylinders, spheres } = this.mesh.attributes;
    
        // update cylinders
        cylinders.forEach(({ mesh, startVertex, endVertex }) => {
            const start = new THREE.Vector3(...vertices[startVertex]);
            const end = new THREE.Vector3(...vertices[endVertex]);
            updateCylinder(mesh, start, end);
        });
    
        // Update spheres (vertices)
        spheres.forEach(({ mesh, index }) => {
            mesh.position.set(...vertices[index]);
        });
    }

    #createWireframe(vertices3d, lineMaterial) {
        const positions = [];
        this.edges.forEach(edge => {
            const vertexA = vertices3d[edge[0]];
            const vertexB = vertices3d[edge[1]];

            positions.push(vertexA.x, vertexA.y, vertexA.z);
            positions.push(vertexB.x, vertexB.y, vertexB.z);
        });

        this.wireframeGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        let wireframe = new THREE.LineSegments(this.wireframeGeometry, lineMaterial);
        wireframe.matrixAutoUpdate = false;
        return wireframe;
    }

    #updateWireframe(vertices3D) {
        // Update wireframe geometry
        const positions = [];
        this.edges.forEach(edge => {
            const vertexA = vertices3D[edge[0]];
            const vertexB = vertices3D[edge[1]];
    
            positions.push(vertexA.x, vertexA.y, vertexA.z);
            positions.push(vertexB.x, vertexB.y, vertexB.z);
        });
    
        this.wireframeGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        this.wireframeGeometry.attributes.position.needsUpdate = true; // Ensure update
    }
}