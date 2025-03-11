import { createCylinder, updateCylinder } from './utils';

export default class Edge {

    constructor(vertex1, vertex2, radius, color, camera) {
        this.vertex1 = vertex1;
        this.vertex2 = vertex2;
        this.mesh = createCylinder(this.vertex1.getCoords(camera), this.vertex2.getCoords(camera), radius, color);
    }

    updateMesh(camera) {
        updateCylinder(this.mesh, this.vertex1.getCoords(camera), this.vertex2.getCoords(camera));
    }

    getCoords(referenceVertex, offset) { 
        // offset shd be in the range of 0 and 1
        if(offset < 0 || offset > 1) {
            console.error("offset must be in the range of 0 and 1");
            return;
        }

        // set a reference and target vector, if valid
        const referenceVector = referenceVertex.vector.clone();
        if (!referenceVector.equals(this.vertex1.vector) && !referenceVector.equals(this.vertex2.vector)) {
            console.error("reference vector is invalid");
        }
        const targetVector = referenceVector.equals(this.vertex1.vector) ? this.vertex2.vector : this.vertex1.vector;

        return referenceVector.lerp(targetVector, offset); // interpolate between reference and target
    }
}