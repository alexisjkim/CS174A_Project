

export default class MatrixN {
    constructor(size) {
      this.size = size;
      // Initialize the matrix as a square matrix (identity matrix)
      this.elements = Array.from({ length: size }, () => Array(size).fill(0));
      for (let i = 0; i < size; i++) {
        this.elements[i][i] = 1; // Identity matrix
      }
    }
  
    // Multiply two matrices
    multiply(matrix) {
      if (matrix.size !== this.size) {
        throw new Error('Matrices must be the same size for multiplication');
      }
  
      const result = new MatrixN(this.size);
      for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
          for (let k = 0; k < this.size; k++) {
            result.elements[i][j] += this.elements[i][k] * matrix.elements[k][j];
          }
        }
      }
      return result;
    }
  
    // Copy the current matrix to another MatrixN instance
    copy() {
      const newMatrix = new MatrixN(this.size);
      for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
          newMatrix.elements[i][j] = this.elements[i][j];
        }
      }
      return newMatrix;
    }
  }