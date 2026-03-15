import { getClinicianData } from "./retrieveData.js";
import { pointInPolygonCalculation } from "./pointInPolygonCalculation.js";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { sendEmail } from "./sendEmail.js";

const oobState = new Map();

export async function driver() {
  const data = await getValidData();
  //   console.log("retrieved data with no issues!");
  const now = Date.now();
  checkBounds(data, now);
}

export function checkBounds(data, now) {
  let results = [];
  for (let i = 0; i < data.length; i++) {
    let inside = booleanPointInPolygon(
      data[i].data.features[0],
      data[i].data.features[1]
    );
    // CUSTOM CHECK:
    // let inBounds = false;
    // for (let j = 0; j < polygon.length; j++)
    //   inBounds = pointInPolygonCalculation(point, polygon[j]);
    // const point = data[i].data.features[0].geometry.coordinates;
    // const polygon = data[i].data.features[1].geometry.coordinates;

    const state = oobState.get(data[i].ID) || {
      isOOB: false,
      startTime: null,
      sentFiveMinuteAlert: false,
    };

    // if (!inside) console.log(data[i].ID, " is out of bounds!");

    if (!inside) {
      if (!state.isOOB) {
        console.log(data[i].ID, " is out of bounds!");
        results.push(data[i].ID, " is out of bounds!");
        //   sendEmail(
        //     "Clinician " + data[i].ID + " is out of bounds!",
        //     "We've noticed that the following clinician(s) is out of bounds"
        //   );
        state.isOOB = true;
        state.startTime = now;
        state.sentFiveMinuteAlert = false;
      }
      const minutesOOB = Math.round((now - state.startTime) / 60000);
      //   console.log(data[i].ID, "out of bounds for ", minutesOOB, " minutes");

      if (minutesOOB >= 5 && !state.sentFiveMinuteAlert) {
        //   sendEmail(
        //     "Clinician " + data[i].ID + " has been out of bounds for more than 5 minutes!",
        //     "We will alert you when we notice they are back in bounds"
        //   );
        console.log(
          data[i].ID,
          " has been out of bounds for more than 5 minutes!"
        );
        results.push(
          data[i].ID,
          " has been out of bounds for more than 5 minutes!"
        );
        state.sentFiveMinuteAlert = true;
      }
    } else {
      if (state.isOOB) {
        const minutesOOB = Math.round((now - state.startTime) / 60000);
        console.log(data[i].ID, `back in bounds after ${minutesOOB} minutes`);
        results.push(data[i].ID, `back in bounds after ${minutesOOB} minutes`);
        //   sendEmail(
        //     "Clinician " + data[i].ID + " back in bounds!",
        //     "We've noticed that the following clinician(s) are back in bounds after " + minutesOOB + " minutes"
        //   );
        state.isOOB = false;
        state.startTime = null;
        state.sentFiveMinuteAlert = false;
      }
    }
    oobState.set(data[i].ID, state);
    // if (!inside)
    //   sendEmail(
    //     "Clinician " + data[i].ID + " is out of bounds!",
    //     "We've noticed that the following clinician(s) is out of bounds"
    //   );
  }
  return results;
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
