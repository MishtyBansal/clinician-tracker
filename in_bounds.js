import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { getClinicianData } from "./retrieve_data.js";

// checks if the phlebotomist is within the bounds of their geoJSON range
function pointInPolygonCalculation(point, polygon) {
  console.log("point", point, "polygon", polygon);
  let x = point[0];
  let y = point[1];
  let inside = 0;
  for (let i = 0; i < polygon.length - 1; i++) {
    let i2 = i + 1;
    let coord1 = polygon[i];
    let coord2 = polygon[i2];
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

const data = await getClinicianData();
for (let i = 0; i < data.length; i++) {
  const point = data[i].features[0].geometry.coordinates;
  const polygon = data[i].features[1].geometry.coordinates;
  //   console.log("point", point, "polygon", polygon);
  let inside = booleanPointInPolygon(data[i].features[0], data[i].features[1]);
  // ^^ may have multiple regions -- need to test them all
  let inBounds = pointInPolygonCalculation(point, polygon[0]);
  console.log("with package", inside);
  console.log("my calculation", inBounds);
}
