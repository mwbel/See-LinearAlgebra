(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.LinearAlgebraDeterminantCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function validateOrder(order) {
    if (!Number.isInteger(order) || order < 2 || order > 5) throw new RangeError('矩阵阶数必须为 2–5');
  }

  function validateMatrix(matrix) {
    if (!Array.isArray(matrix) || matrix.length < 2 || matrix.length > 5) throw new TypeError('矩阵必须是 2–5 阶方阵');
    const n = matrix.length;
    if (matrix.some((row) => !Array.isArray(row) || row.length !== n || row.some((value) => typeof value !== 'number' || !Number.isFinite(value)))) {
      throw new TypeError('矩阵必须是只包含有限数值的方阵');
    }
    return n;
  }

  function inversionCount(indices) {
    let count = 0;
    for (let i = 0; i < indices.length; i += 1) {
      for (let j = i + 1; j < indices.length; j += 1) if (indices[i] > indices[j]) count += 1;
    }
    return count;
  }

  function enumeratePermutations(order) {
    validateOrder(order);
    const result = [];
    const indices = [];
    const used = Array(order).fill(false);
    function visit() {
      if (indices.length === order) {
        const inversions = inversionCount(indices);
        result.push({ indices: [...indices], inversions, sign: inversions % 2 ? -1 : 1 });
        return;
      }
      for (let value = 0; value < order; value += 1) {
        if (!used[value]) {
          used[value] = true;
          indices.push(value);
          visit();
          indices.pop();
          used[value] = false;
        }
      }
    }
    visit();
    return result;
  }

  function determinantByColumns(matrix) {
    const n = validateMatrix(matrix);
    return enumeratePermutations(n).reduce((sum, permutation) => sum + permutation.sign * matrix.reduce((product, row, i) => product * row[permutation.indices[i]], 1), 0);
  }

  function determinantByRows(matrix) {
    const n = validateMatrix(matrix);
    return enumeratePermutations(n).reduce((sum, permutation) => {
      let product = permutation.sign;
      for (let column = 0; column < n; column += 1) product *= matrix[permutation.indices[column]][column];
      return sum + product;
    }, 0);
  }

  function determinantByDoublePermutationAverage(matrix) {
    const n = validateMatrix(matrix);
    const permutations = enumeratePermutations(n);
    let sum = 0;
    for (const rows of permutations) {
      for (const columns of permutations) {
        let product = rows.sign * columns.sign;
        for (let i = 0; i < n; i += 1) product *= matrix[rows.indices[i]][columns.indices[i]];
        sum += product;
      }
    }
    let factorial = 1;
    for (let i = 2; i <= n; i += 1) factorial *= i;
    return sum / factorial;
  }

  function transpose(matrix) {
    const n = validateMatrix(matrix);
    return Array.from({ length: n }, (_, row) => Array.from({ length: n }, (_, column) => matrix[column][row]));
  }

  function copyForOperation(matrix, axis, ...indices) {
    const n = validateMatrix(matrix);
    if (axis !== 'row' && axis !== 'column') throw new TypeError('axis 必须是 row 或 column');
    if (indices.some((index) => !Number.isInteger(index) || index < 0 || index >= n)) throw new RangeError('行列索引超出范围');
    return matrix.map((row) => [...row]);
  }

  function swap(matrix, axis, first, second) {
    const next = copyForOperation(matrix, axis, first, second);
    if (axis === 'row') [next[first], next[second]] = [next[second], next[first]];
    else for (let row = 0; row < next.length; row += 1) [next[row][first], next[row][second]] = [next[row][second], next[row][first]];
    return next;
  }

  function scale(matrix, axis, index, factor) {
    if (typeof factor !== 'number' || !Number.isFinite(factor)) throw new TypeError('系数必须是有限数值');
    const next = copyForOperation(matrix, axis, index);
    if (axis === 'row') next[index] = next[index].map((value) => value * factor);
    else for (let row = 0; row < next.length; row += 1) next[row][index] *= factor;
    return next;
  }

  function addMultiple(matrix, axis, target, source, factor) {
    if (typeof factor !== 'number' || !Number.isFinite(factor)) throw new TypeError('系数必须是有限数值');
    const next = copyForOperation(matrix, axis, target, source);
    if (axis === 'row') next[target] = next[target].map((value, column) => value + factor * next[source][column]);
    else for (let row = 0; row < next.length; row += 1) next[row][target] += factor * next[row][source];
    return next;
  }

  function addVector(matrix, axis, index, vector) {
    const n = validateMatrix(matrix);
    if (!Array.isArray(vector) || vector.length !== n || vector.some((value) => typeof value !== 'number' || !Number.isFinite(value))) throw new TypeError('向量长度必须与矩阵阶数相同且元素为有限数值');
    const next = copyForOperation(matrix, axis, index);
    if (axis === 'row') next[index] = next[index].map((value, i) => value + vector[i]);
    else for (let row = 0; row < n; row += 1) next[row][index] += vector[row];
    return next;
  }

  return { validateMatrix, inversionCount, enumeratePermutations, determinantByColumns, determinantByRows, determinantByDoublePermutationAverage, transpose, swap, scale, addMultiple, addVector };
});
