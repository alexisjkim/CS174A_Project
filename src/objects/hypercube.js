import * as THREE from 'three';
import Edge from './edge';
import Vertex from './vertex';
import { projectNDto3D } from '../utils';
import MatrixN from './matrixN';
import VectorN from './vectorN';

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
        this.dimension = dimension;
        this.transformationMatrixND = new MatrixN(dimension);
        this.transformationMatrix3D = new THREE.Matrix4();
        
        this.wireframeGeometry = new THREE.BufferGeometry();
        this.mesh = this.#createMesh(dimension, meshParams);
        this.showMesh = true; // else display wireframe
    }

    // state only changes when update is explicitly called
    update() {
        this.vertices.forEach(vertex => {
            vertex.applyNDTransformation(this.transformationMatrixND);
            vertex.projectTo3D(this.camera);
            vertex.apply3DTransformation(this.transformationMatrix3D);
            vertex.updateMesh();
        });
        this.edges.forEach(edge => {
            edge.updateMesh(this.camera);
        })
    }
    
    /* Apply transformations to the hypercube in 4D and 3D */
    applyNDTransformation(matrix) {
        this.transformationMatrixND.multiply(matrix);
    }
    copyNDTransformation(matrix) {
        this.transformationMatrixND.copy(matrix);
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
        const centerND = new VectorN(this.dimension);
        centerND.applyMatrixN(this.transformationMatrixND);
        const center3D = projectNDto3D(centerND, this.camera);
        center3D.applyMatrix4(this.transformationMatrix3D);
        return center3D;
    }

    #createMesh(dimension, params) {
        const mesh = new THREE.Group(); // collection of cylinders and spheres
        const { edgeLength, edgeRadius, edgeColor, vertexRadius, vertexColor } = params;
        
        // create N*N vertices, represented with N-d Vectors
        this.#generateVertices(dimension, edgeLength, vertexRadius, vertexColor, mesh);

        // add edges between connected vertices
        this.#generateEdges(dimension, this.vertices, edgeRadius, edgeColor, mesh);

        return mesh;
    }

    // generate vertices for an N dimensional hypercube
    #generateVertices(N, edgeLength, vertexRadius, vertexColor, mesh) {
        let numVertices = 1 << N; // 2^N vertices

        for (let i = 0; i < numVertices; i++) {
            let coords = new Array(N).fill(0);
    
            // Assign coordinates based on bitwise operations
            for (let j = 0; j < N; j++) {
                coords[j] = (i & (1 << j)) ? edgeLength / 2 : -edgeLength / 2;
            }
    
            // Create a VectorN (assuming it can take an array of values)
            let vector = new VectorN(N, coords);
    
            // Create and store the vertex
            const newVertex = new Vertex(
                vector,  // Pass the VectorN object
                i, 
                vertexRadius, 
                vertexColor,
                this.camera
            );
    
            this.vertices.push(newVertex);
            mesh.add(newVertex.mesh);
        }
    }

    #generateEdges(N, vertices, edgeRadius, edgeColor, mesh) {
        let numVertices = 1 << N; // 2^N vertices
    
        for (let i = 0; i < numVertices; i++) {
            for (let j = i + 1; j < numVertices; j++) {
                let diff = i ^ j;  // find all bits that differ
    
                // if only one bit differs, they're adjacent vertices
                if ((diff & (diff - 1)) === 0) {                     
                    const vertex1 = vertices[i];
                    const vertex2 = vertices[j];
    
                    // Create a new edge
                    const newEdge = new Edge(vertex1, vertex2, edgeRadius, edgeColor); 
                    this.edges.push(newEdge);
                    mesh.add(newEdge.mesh);
    
                    // Add edge to the connected vertices
                    vertex1.addEdge(newEdge);
                    vertex2.addEdge(newEdge);
                }
            }
        }
    }   
}