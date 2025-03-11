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

    getCoords(referenceVertex, offset, camera) { 
        // offset shd be in the range of 0 and 1
        if(offset < 0 || offset > 1) {
            console.error("offset must be in the range of 0 and 1");
            return;
        }

        const targetVertex = this.getOtherVertex(referenceVertex);
        if(!targetVertex) {
            console.error("reference vector is invalid, using vertex1");
            referenceVertex = this.vertex1;
            targetVertex = this.vertex2;
        }
        return referenceVertex.getCoords(camera).lerp(targetVertex.getCoords(camera), offset); // interpolate between reference and target
    }

    getOtherVertex(vertex) {
        if (!vertex.index == this.vertex1.index && !vertex.index == this.vertex2.index) {
            return null;
        }
        return vertex.index == this.vertex1.index ? this.vertex2 : this.vertex1;
    }

    getEdge(vertex) {
        return this; // idk yet
    }
}