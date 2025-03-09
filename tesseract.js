import * as THREE from 'three';
import { project4DTo3D, rotateZW } from './utils';

/** Tesseract
 * 
 * Tesseract(l, d, lineMaterial, cameraPosition4D, cameraBasis4D) constructs the tesseract object.
 * getGeometry() to get geometry of the tesseract.
 * updateGeometry(rotation_angle, use_perspective) to update position of tesseract.
 */
export default class Tesseract {
    // create tesseract
    constructor(l, d, lineMaterial, cameraPosition4D, cameraBasis4D) {
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

        const positions = [];
        this.edges.forEach(edge => {
            const vertexA = vertices3d[edge[0]];
            const vertexB = vertices3d[edge[1]];

            positions.push(vertexA.x, vertexA.y, vertexA.z);
            positions.push(vertexB.x, vertexB.y, vertexB.z);
        });

        this.wireframe_geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));

        // create geometry
        this.tesseract_geometry = new THREE.LineSegments(this.wireframe_geometry, lineMaterial);
        this.tesseract_geometry.matrixAutoUpdate = false;
    }

    getGeometry () {
        return this.tesseract_geometry;
    }

    updateTesseract(rotation_angle, use_perspective) {
        let vertices4d_rotated = rotateZW(this.vertices4d, rotation_angle);
    
        // Project the rotated 4D vertices to 3D
        const vertices3d = [];
        for (let i = 0; i < this.vertices4d.length; i++) {
            vertices3d.push(project4DTo3D(vertices4d_rotated[i], this.cameraPosition4D, this.cameraBasis4D, this.d, use_perspective));
        }
    
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