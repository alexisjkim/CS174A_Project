import * as THREE from 'three';
import { createCylinder, createSphere, project4DTo3D, rotateZW, updateCylinder } from './utils';

/** Tesseract
 * 
 * Tesseract(l, d, lineMaterial, cameraPosition4D, cameraBasis4D) constructs the tesseract object.
 * updateGeometry(rotation_angle, use_perspective) to update position of tesseract.
 */
export default class Tesseract {
    // create tesseract
    constructor(l, d, lineMaterial, cameraPosition4D, cameraBasis4D, edge_radius, edge_color, vertex_radius, vertex_color) {
        // member vars
        this.l = l;
        this.d = d;
        this.vertices4d = [];
        this.edges = [];
        this.cameraPosition4D = cameraPosition4D;
        this.cameraBasis4D = cameraBasis4D;
        this.wireframe_geometry = new THREE.BufferGeometry();
        
        // create 4d vertices
        for(let i = 0; i < 16; i++) {
            this.vertices4d.push(new THREE.Vector4(
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
        const vertices3d = [];
        for (let i = 0; i < this.vertices4d.length; i++) {
            vertices3d.push(project4DTo3D(this.vertices4d[i], cameraPosition4D, cameraBasis4D, d, true));
        }
        
        this.wireframe = this.#createWireframe(vertices3d, lineMaterial);
        this.mesh = this.#createMesh(vertices3d, this.edges, edge_radius, edge_color, vertex_radius, vertex_color);
    }

    updateTesseract(rotation_angle, use_perspective) {
        let vertices4d_rotated = this.vertices4d.map(v => rotateZW(v, rotation_angle));
    
        // Project the rotated 4D vertices to 3D
        const vertices3d = [];
        for (let i = 0; i < this.vertices4d.length; i++) {
            vertices3d.push(project4DTo3D(vertices4d_rotated[i], this.cameraPosition4D, this.cameraBasis4D, this.d, use_perspective));
        }
    
        this.#updateWireframe(vertices3d);
        this.#updateMesh(vertices3d);
    }

    setMeshVisibility(visible) {
        if(visible) {
            this.mesh.visible = true;
        } else {
            this.mesh.visible = false;
        }
    }

    setWireframeVisibility(visible) {
        if(visible) {
            this.wireframe.visible = true;
        } else {
            this.wireframe.visible = false;
        }
    }

    #createMesh(vertices, edges, cylinder_radius, cylinder_color, sphere_radius, sphere_color) {
        const group = new THREE.Group(); // collection of cylinders and spheres
        const cylinders = [];
        const spheres = [];
    
        edges.forEach(edge => {
            const [start_vertex, end_vertex] = edge;
            const start = new THREE.Vector3(...vertices[start_vertex]);
            const end = new THREE.Vector3(...vertices[end_vertex]);
            const cylinder = createCylinder(start, end, cylinder_radius, cylinder_color);

            // store cylinders
            cylinders.push({ mesh: cylinder, start_vertex, end_vertex }); 
            group.add(cylinder);
        });

        vertices.forEach((vertex, index) => {
            const sphere = createSphere(vertex, sphere_radius, sphere_color);

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
        cylinders.forEach(({ mesh, start_vertex, end_vertex }) => {
            const start = new THREE.Vector3(...vertices[start_vertex]);
            const end = new THREE.Vector3(...vertices[end_vertex]);
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

        this.wireframe_geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        let wireframe = new THREE.LineSegments(this.wireframe_geometry, lineMaterial);
        wireframe.matrixAutoUpdate = false;
        return wireframe;
    }

    #updateWireframe(vertices3d) {
        // Update wireframe geometry
        const positions = [];
        this.edges.forEach(edge => {
            const vertexA = vertices3d[edge[0]];
            const vertexB = vertices3d[edge[1]];
    
            positions.push(vertexA.x, vertexA.y, vertexA.z);
            positions.push(vertexB.x, vertexB.y, vertexB.z);
        });
    
        this.wireframe_geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        this.wireframe_geometry.attributes.position.needsUpdate = true; // Ensure update
    }
}