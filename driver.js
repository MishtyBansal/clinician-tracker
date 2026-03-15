import { getClinicianData } from "./retrieveData.js";
import { pointInPolygonCalculation } from "./in_bounds.js";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { sendEmail } from "./sendEmail.js";

export async function driver() {
  const data = await getValidData();
  for (let i = 0; i < data.length; i++) {
    const point = data[i].data.features[0].geometry.coordinates;
    const polygon = data[i].data.features[1].geometry.coordinates;
    let inside = booleanPointInPolygon(
      data[i].data.features[0],
      data[i].data.features[1]
    );
    let inBounds = false;
    for (let i = 0; i < polygon.length; i++)
      inBounds = pointInPolygonCalculation(point, polygon[i]);
    if (!inside) console.log(data[i].ID, " is out of bounds!");
    // if (!inside)
    //   sendEmail(
    //     "Clinician " + data[i].ID + " is out of bounds!",
    //     "We've noticed that the following clinician(s) is out of bounds"
    //   );
  }
}

async function getValidData() {
  let data = {};
  try {
    data = await getClinicianData(false);
    return data;
  } catch (error) {
    console.log(error);
    // add a more specific error message
  }
}
