import { getClinicianData } from "./retrieve_data.js";
import { pointInPolygonCalculation } from "./in_bounds.js";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { send_Email } from "./send_email.js";

const data = await getClinicianData(false);
for (let i = 0; i < data.length; i++) {
  console.log(data[i]);
  const point = data[i].data.features[0].geometry.coordinates;
  const polygon = data[i].data.features[1].geometry.coordinates;
  //   console.log("point", point, "polygon", polygon);
  let inside = booleanPointInPolygon(
    data[i].data.features[0],
    data[i].data.features[1]
  );
  let inBounds = false;
  for (let i = 0; i < polygon.length; i++)
    inBounds = pointInPolygonCalculation(point, polygon[i]);
  //   console.log("with package", inside);
  //   console.log("my calculation", inBounds);
  if (!inside) send_Email(data[i].ID);
}
