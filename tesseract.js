import * as THREE from 'three';
import { createCylinder, createSphere, project4DTo3D, rotateZW, updateCylinder } from './utils';
import Edge from './edge';

/** Tesseract
 * 
 * Tesseract(l, camera, meshParams, wireframeMaterial) constructs the tesseract object.
 * updateGeometry(rotation_angle, use_perspective) to update position of tesseract.
 */
export default class Tesseract {
    // create tesseract
    constructor(l, camera, meshParams) {
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
                (i&8) ? l : -l,
                (i&4) ? l : -l,
                (i&2) ? l : -l,
                (i&1) ? l : -l
            ));
        }
        // this.vertices4D is of the form: [ [-2,-2,-2,-2], [2,-2,-2,-2], .....]

        
        // create edges list
        let edgesList = [];
        for(let i = 0; i < 15; i++) {
            for(let j = i+1; j < 16; j++) {
                let diff = i ^ j;  // XOR to find differing bits

                // if only one bit is different, the two vertices should be connected  with an edge
                if ((diff & (diff - 1)) === 0) { 
                    edgesList.push([i, j]);
                }
            }
        }

        // project to 3d
        const vertices3D = [];
        for (let i = 0; i < this.vertices4D.length; i++) {
            vertices3D.push(project4DTo3D(this.vertices4D[i], camera));
        }
        
        this.mesh = this.#createMesh(vertices3D, edgesList, meshParams);
    }

    update(rotationAngle) {
        // rotate vertices, then recalculate 3D projection
        let rotatedVertices4D = this.vertices4D.map(v => rotateZW(v, rotationAngle));
    
        const vertices3D = [];
        for (let i = 0; i < this.vertices4D.length; i++) {
            vertices3D.push(project4DTo3D(rotatedVertices4D[i], this.camera));
        }
    
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

    randomEdge() {
        return this.edges[Math.floor(Math.random()*32)];
    }

    #createMesh(vertices, edges, params) {

        const group = new THREE.Group(); // collection of cylinders and spheres
      //  const cylinders = [];
        const spheres = [];
        const { edgeRadius, edgeColor, vertexRadius, vertexColor } = params;
    
        edges.forEach(edge => {
            const [vertex1, vertex2] = edge;

            const start = new THREE.Vector3(...vertices[vertex1]);
            const end = new THREE.Vector3(...vertices[vertex2]);

            const newEdge = new Edge(start, end, edgeRadius, edgeColor);

            this.edges.push(newEdge);
            group.add(newEdge.mesh);
        });

        vertices.forEach((vertex, index) => {
            const sphere = createSphere(vertex, vertexRadius, vertexColor);

            // store spheres
            spheres.push({ mesh: sphere, index }); 
            group.add(sphere);
        });

        group.attributes = { spheres, vertices, edges }; // store attributes of the mesh
        return group;
    }

    #updateMesh(vertices) {
        const { spheres } = this.mesh.attributes;
    
        this.edges.forEach(edge => {
            edge.update();
        });
    
        // Update spheres (vertices)
        spheres.forEach(({ mesh, index }) => {
            mesh.position.set(...vertices[index]);
        });
    }
}