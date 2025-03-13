import { createCylinder, updateCylinder } from '../utils';

export default class Edge {

    constructor(vertex1, vertex2, radius, color) {
        this.vertex1 = vertex1;
        this.vertex2 = vertex2;
        this.cheeses = []; // i love cheese
        this.baseColor = color;
        this.mesh = createCylinder(this.vertex1.projectedVector, this.vertex2.projectedVector, radius, color);
    }

    updateMesh() {
        updateCylinder(this.mesh, this.vertex1.projectedVector, this.vertex2.projectedVector);
    }

    getCoords(referenceVertex, offset) { 
        // offset shd be in the range of 0 and 1
        if(offset < 0 || offset > 1) {
            console.error("offset must be in the range of 0 and 1");
            return;
        }
        
        // return position somewhere between the vertices
        const targetVertex = this.getOtherVertex(referenceVertex);
        if(!targetVertex) {
            console.error("reference vector is invalid, using vertex1");
            referenceVertex = this.vertex1;
            targetVertex = this.vertex2;
        }
        return referenceVertex.projectedVector.lerp(targetVertex.projectedVector, offset); // interpolate between reference and target
    }

    getOtherVertex(vertex) {
        if (!vertex.index == this.vertex1.index && !vertex.index == this.vertex2.index) {
            return null;
        }
        return vertex.index == this.vertex1.index ? this.vertex2 : this.vertex1;
    }

    /* Deal with cheeeses stored on this edge */
    addCheese(cheese) {
        this.cheeses.push(cheese);
        // if more than 1 cheese, maybe offset their positions?
    }

    checkCheeses(position) {
        this.cheeses = this.cheeses.filter(cheese => {
            if (cheese.eatable(position)) {
                cheese.eat();
                return false;
            }
            return true;
        });
    }

    setColor(color = this.baseColor, glowColor = 0x000000, glowIntensity = 0) {
        this.mesh.material.color.set(color);
        this.mesh.material.emissive.set(glowColor);
        this.mesh.material.emissiveIntensity = glowIntensity; 
    }
}