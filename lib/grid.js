/**
 * @param {number} w Grid width
 * @param {number} x Grid column
 * @param {number} y Grid row
 * @return {number} Cell index
 */
function posToCell(w, x, y) {
  return (w * y) + x;
}

/**
 * @param {number} w Grid width
 * @param {number} i Cell index
 * @return {number} Grid column
 */
function cellToX(w, i) {
  return i % w;
}

/**
 * @param {number} w Grid width
 * @param {number} i Cell index
 * @return {number} Grid row
 */
function cellToY(w, i) {
  return (i / w) | 0;
}

export {posToCell, cellToX, cellToY};
