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
          result.elements[i][j] = 0;
          for (let k = 0; k < this.size; k++) {
            result.elements[i][j] += this.elements[i][k] * matrix.elements[k][j];
          }
        } 
      }
      return result;
    }

    premultiply(matrix) {
      if (matrix.size !== this.size) {
        throw new Error('Matrices must be the same size for multiplication');
      }
  
      const result = new MatrixN(this.size);
      for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
          for (let k = 0; k < this.size; k++) {
            result.elements[i][j] += matrix.elements[i][k] * this.elements[k][j];
          }
        }
      }
      return result;
    }

    get(i, j) {
      return this.elements[i][j];
    }

    set(i, j, value) {
      this.elements[i][j] = value;
    }
  
    // Copy the current matrix to another MatrixN instance
    clone() {
      const newMatrix = new MatrixN(this.size);
      for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
          newMatrix.elements[i][j] = this.elements[i][j];
        }
      }
      return newMatrix;
    }

    copy(matrix) {
      if(matrix.size !== this.size) {
        console.error("tried copying a matrix of different size");
        return null;
      }
      for(let i = 0; i < this.size; i++) {
        for(let j = 0; j < this.size; j++) {
          this.elements[i][j] = matrix.elements[i][j];
        }
      }

      return this;
    }

    // invert a nxn matrix
    invert() {
      const N = this.size;
      const identity = new MatrixN(N);
  
      // make it (A | I) for RREF
      for (let i = 0; i < N; i++) {
          for (let j = 0; j < N; j++) {
              this.elements[i].push(identity.elements[i][j]); // Expanding matrix size to 2N
          }
      }
  
      // use gaussian elimination
      for (let col = 0; col < N; col++) {
          // Partial pivoting: Find the largest value in the current column
          let maxRow = col;
          for (let row = col + 1; row < N; row++) {
              if (Math.abs(this.elements[row][col]) > Math.abs(this.elements[maxRow][col])) {
                  maxRow = row;
              }
          }
  
          // Swap rows if needed
          if (maxRow !== col) {
              [this.elements[col], this.elements[maxRow]] = [this.elements[maxRow], this.elements[col]];
          }
  
          // Make the diagonal element 1
          let diag = this.elements[col][col];
          if (Math.abs(diag) < 1e-10) throw new Error("Matrix is singular and cannot be inverted.");
  
          for (let j = 0; j < 2 * N; j++) {
              this.elements[col][j] /= diag;
          }
  
          // Zero out the other rows in this column
          for (let row = 0; row < N; row++) {
              if (row !== col) {
                  let factor = this.elements[row][col];
                  for (let j = 0; j < 2 * N; j++) {
                      this.elements[row][j] -= factor * this.elements[col][j];
                  }
              }
          }
      }
  
      // Extract the right half of the augmented matrix (which is now the inverse)
      for (let i = 0; i < N; i++) {
          this.elements[i] = this.elements[i].slice(N, 2 * N);
      }
      return this;
  }

    // need a clone and invert function
  }