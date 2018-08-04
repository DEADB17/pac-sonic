/**
 * @param {number} width Grid width
 * @param {number} col Grid column
 * @param {number} row Grid row
 * @return {number} Cell index
 */
function colRowToCell(width, col, row) {
  return (width * row) + col;
}

/**
 * @param {number} width Grid width
 * @param {number} index Cell index
 * @return {number} Grid column
 */
function cellToCol(width, index) {
  return index % width;
}

/**
 * @param {number} width Grid width
 * @param {number} index Cell index
 * @return {number} Grid row
 */
function cellToRow(width, index) {
  return (index / width) | 0;
}

export {colRowToCell, cellToCol, cellToRow};
