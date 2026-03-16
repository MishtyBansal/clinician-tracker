import { getClinicianData } from "./getClinicianData.js";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { sendEmail } from "./sendEmail.js";

export const outOfBoundsState = new Map(); // tracks the previous out of bounds status for each clinician
export const errorState = new Map(); // tracks the last error thrown for each clinician
const OUT_OF_BOUNDS_LIMIT = 5;
const ALERT_RECIPIENT = "mishtybansal3@gmail.com";

export async function checkBoundsAndAlert(allClinicianData, now) {
  for (let i = 0; i < allClinicianData.length; i++) {
    const clinician = allClinicianData[i];
    const features = clinician.clinicianData.features;
    const clinicianPoint = features.find(
      (feature) => feature.geometry.type == "Point"
    );
    const clinicianZones = features.filter(
      (feature) => feature.geometry.type == "Polygon"
    );
    let inside = false;

    for (const zone of clinicianZones) {
      inside = booleanPointInPolygon(clinicianPoint, zone);
      if (inside) break;
    }
    const state = outOfBoundsState.get(clinician.clinicianID) || {
      isOutOfBounds: false,
      startTime: null,
      sentFiveMinuteAlert: false,
    };

    if (!inside) {
      if (!state.isOutOfBounds) {
        await sendEmail(
          ALERT_RECIPIENT,
          `Clinician ${clinician.clinicianID} is out of bounds`,
          "We've noticed that the following clinician(s) is out of bounds"
        );
        state.isOutOfBounds = true;
        state.startTime = now;
        state.sentFiveMinuteAlert = false;
      }
      const minutesOutOfBounds = Math.round((now - state.startTime) / 60000);

      if (
        minutesOutOfBounds >= OUT_OF_BOUNDS_LIMIT &&
        !state.sentFiveMinuteAlert
      ) {
        await sendEmail(
          ALERT_RECIPIENT,
          `Clinician ${clinician.clinicianID} has been out of bounds for more than 5 minutes!`,
          "We will alert you when we notice they are back in bounds"
        );
        state.sentFiveMinuteAlert = true;
      }
    } else {
      if (state.isOutOfBounds) {
        const minutesOutOfBounds = Math.round((now - state.startTime) / 60000);
        await sendEmail(
          ALERT_RECIPIENT,
          `Clinician ${clinician.clinicianID} back in bounds!`,
          `We've noticed that the following clinician(s) are back in bounds after ${minutesOutOfBounds} minutes`
        );
        state.isOutOfBounds = false;
        state.startTime = null;
        state.sentFiveMinuteAlert = false;
      }
    }
    outOfBoundsState.set(clinician.clinicianID, state);
  }
}

export async function triggerClinicianMonitoring(clinicianIDsToMonitor) {
  let allClinicianData = [];
  for (let i = 0; i < clinicianIDsToMonitor.length; i++) {
    const clinicianID = clinicianIDsToMonitor[i];
    try {
      const clinicianData = await getClinicianData(clinicianID);
      allClinicianData.push(clinicianData);
      errorState.set(clinicianID, undefined); // at this point, there is no error and so we can reset
    } catch (error) {
      const currentErrorState = errorState.get(clinicianID) || {
        errorSent: false,
      };
      if (!currentErrorState.errorSent) {
        console.log(error);
        sendEmail(
          ALERT_RECIPIENT,
          "Invalid Clinician Data",
          `clincian ${clinicianID} has an invalid location`
        );
        currentErrorState.errorSent = true;
        errorState.set(clinicianID, currentErrorState);
      }
    }
  }
  const now = Date.now();
  await checkBoundsAndAlert(allClinicianData, now);
}
