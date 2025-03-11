import * as THREE from 'three';
import Edge from './edge';
import Vertex from './vertex';

/** Tesseract
 * 
 * Tesseract(length, camera, meshParams, wireframeMaterial) constructs the tesseract object.
 * updateGeometry(rotation_angle, use_perspective) to update position of tesseract.
 */
export default class Tesseract {
    // create tesseract
    constructor(length, camera, meshParams) {
        // member vars
        this.length = length;
        this.vertices = [];
        this.edges = [];
        this.camera = camera;
        this.wireframeGeometry = new THREE.BufferGeometry();
        this.showMesh = true; // else display wireframe
        this.mesh = this.#createMesh(meshParams);
    }

    rotate(rotationAngle) {
        // rotate vertices
        this.vertices.forEach(vertex => vertex.rotate(rotationAngle));

        // update meshes for vertices and edges
        this.vertices.forEach(vertex => vertex.updateMesh(this.camera));
        this.edges.forEach(edge => edge.updateMesh(this.camera));
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

    #createMesh(params) {
        const mesh = new THREE.Group(); // collection of cylinders and spheres
        const { edgeRadius, edgeColor, vertexRadius, vertexColor } = params;
        
        // create 16 vertices, with 4D coords
        for(let i = 0; i < 16; i++) {
            const newVertex = new Vertex(
                // coordinates
                (i&8) ? this.length/2 : -this.length/2,
                (i&4) ? this.length/2 : -this.length/2,
                (i&2) ? this.length/2 : -this.length/2,
                (i&1) ? this.length/2 : -this.length/2,
                i, 
                vertexRadius, 
                vertexColor,
                this.camera
            )
            this.vertices.push(newVertex);
            mesh.add(newVertex.mesh);
        }
        
        // add edges between connected vertices
        for(let i = 0; i < 15; i++) {
            for(let j = i+1; j < 16; j++) {
                let diff = i ^ j;  // XOR to find differing bits
                // if only one bit is different, the two vertices should be connected with an edge
                if ((diff & (diff - 1)) === 0) {                     
                    const vertex1 = this.vertices[i];
                    const vertex2 = this.vertices[j];

                    // new edge from adjacent vertices
                    const newEdge = new Edge(vertex1, vertex2, edgeRadius, edgeColor, this.camera); 
                    this.edges.push(newEdge);
                    mesh.add(newEdge.mesh);
                }
            }
        }
        return mesh;
    }
}