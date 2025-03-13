import * as THREE from 'three';
import Edge from './edge';
import Vertex from './vertex';
import { project4DTo3D } from '../utils';

/** hypercube
 * 
 * hypercube(length, camera, meshParams, wireframeMaterial) constructs the hypercube object.
 * updateGeometry(rotation_angle, use_perspective) to update position of hypercube.
 */
export default class Hypercube {
    // create hypercube
    constructor(dimension, camera, meshParams) {
        // objects
        this.camera = camera;
        this.vertices = [];
        this.edges = [];

        // matrices store 4d and 3d transformations to the hypercube
        this.transformationMatrix4D = new THREE.Matrix4(); // need something else for other dimensions?
        this.transformationMatrix3D = new THREE.Matrix4();
        
        this.wireframeGeometry = new THREE.BufferGeometry();
        this.mesh = this.#createMesh(dimension, meshParams);
        this.showMesh = true; // else display wireframe
    }

    // state only changes when update is explicitly called
    update() {
        this.vertices.forEach(vertex => {
            vertex.apply4DTransformation(this.transformationMatrix4D);
            //vertex.projectTo3D(this.projectionMatrix);
            vertex.projectTo3D(this.camera);
            vertex.apply3DTransformation(this.transformationMatrix3D);
            vertex.updateMesh();
        });
        this.edges.forEach(edge => {
            edge.updateMesh(this.camera);
        })
    }
    
    /* Apply transformations to the hypercube in 4D and 3D */
    apply4DTransformation(matrix) {
        this.transformationMatrix4D.multiply(matrix);
    }
    copy4DTransformation(matrix) {
        this.transformationMatrix4D.copy(matrix);
    }

    apply3DTransformation(matrix) {
        this.transformationMatrix3D.multiply(matrix);
    }
    copy3DTransformation(matrix) {
        this.transformationMatrix3D.copy(matrix);
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

    getPosition() {
        const center4D = new THREE.Vector4(0, 0, 0, 0);
        center4D.applyMatrix4(this.transformationMatrix4D);
        const center3D = project4DTo3D(center4D, this.camera);
        center3D.applyMatrix4(this.transformationMatrix3D);
        return center3D;
    }

    #createMesh(dimension, params) {
        // DO SOMETHING WITH DIMENSION

        const mesh = new THREE.Group(); // collection of cylinders and spheres
        const { edgeLength, edgeRadius, edgeColor, vertexRadius, vertexColor } = params;
        
        // create 16 vertices, with 4D coords
        for(let i = 0; i < 16; i++) {
            const newVertex = new Vertex(
                // coordinates
                (i&8) ? edgeLength/2 : -edgeLength/2,
                (i&4) ? edgeLength/2 : -edgeLength/2,
                (i&2) ? edgeLength/2 : -edgeLength/2,
                (i&1) ? edgeLength/2 : -edgeLength/2,
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
                    const newEdge = new Edge(vertex1, vertex2, edgeRadius, edgeColor); 
                    this.edges.push(newEdge);
                    mesh.add(newEdge.mesh);

                    // add edge to the connected vertices
                    vertex1.addEdge(newEdge);
                    vertex2.addEdge(newEdge);
                }
            }
        }
        return mesh;
    }
}