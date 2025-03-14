export default class VectorN {
    constructor(size, elements = null) {
      this.size = size;
      // Initialize vector elements
      this.elements = elements || Array(size).fill(0);
    }
  
    // Apply a MatrixN transformation to the vector
    applyMatrixN(matrix) {
      if (matrix.size !== this.size) {
        throw new Error('Matrix and vector must have the same size');
      }
  
      const result = new Array(this.size).fill(0);
      for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
          result[i] += matrix.elements[i][j] * this.elements[j];
        }
      }
  
      // Update the vector's elements with the transformed result
      this.elements = result;
      return this;
    }

    get(i) {
      return this.elements[i];
    }

    set(i, value) {
      this.elements[i] = value;
    }
  
    // copy the current vector
    clone() {
      const newVector = new VectorN(this.size);
      newVector.elements = [...this.elements];
      return newVector;
    }

    dot(vector) {
      if(vector.size !== this.size) {
        console.error("trying to dot two vectors of different size");
        return null;
      }

      let dotProduct = 0;
      for(let i = 0; i < this.size; i++) {
        dotProduct += this.elements[i]*vector.get(i);
      }
      return dotProduct;
    }

    scale(scalar) {
      this.elements = this.elements.map(c => c * scalar);
      return this;
    }

    subtract(vector) {
      if(vector.size !== this.size) {
        console.error("trying to subtract two vectors of different size");
        return null;
      }

      for(let i = 0; i < this.size; i++) {
        this.elements[i] -= vector.get(i);
      }
      return this;
    }

    normalize() {
      const magnitude = Math.sqrt(this.elements.reduce((sum, component) => sum + component * component, 0));

      if (magnitude === 0) {
        return this;
      }

      this.elements = this.elements.map(component => component / magnitude);
      
      return this;
    } 

  static random(size, normalized = false) {
    let components = Array.from({ length: size }, () => Math.random() * 2 - 1); // Random values in range [-1,1]
    let vector = new VectorN(size, components);
    return normalized ? vector.normalize() : vector;
  }
}