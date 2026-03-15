// checks if the phlebotomist is within the bounds of their geoJSON range

// calculation through package
// add a try catch for package

// custom calculation
export function pointInPolygonCalculation(point, polygon) {
  let x = point[0];
  let y = point[1];
  let inside = 0;
  for (let i = 0; i < polygon.length - 1; i++) {
    let i2 = i + 1;
    let coord1 = polygon[i];
    let coord2 = polygon[i2];
    if (y === coord1[1] && x === coord1[1]) return true; // if its on a vertex

    // if its on a horizontal edge
    if (
      y === coord1[1] &&
      y === coord2[1] &&
      x >= Math.min(coord1[0], coord2[0]) &&
      x <= Math.max(coord1[0], coord2[0])
    )
      return true;

    // prettier-ignore
    if ((coord1[1] > y) !== (coord2[1] > y)) {
      let intersection_x =
        ((coord1[0] - coord2[0]) * (y - coord2[1])) / (coord1[1] - coord2[1]) +
        coord2[0];
      if (intersection_x > x) {
        inside++;
      }
    }
  }
  return inside % 2 != 0;
}
