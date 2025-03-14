export default class VectorN {
    constructor(size, elements = null) {
      this.size = size;
      // Initialize vector elements
      this.elements = elements || Array(size).fill(0);
    }
  
    // Apply a MatrixN transformation to the vector
    applyMatrix4(matrix) {
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
  
    // Copy the current vector
    copy() {
      const newVector = new VectorN(this.size);
      newVector.elements = [...this.elements];
      return newVector;
    }
  }