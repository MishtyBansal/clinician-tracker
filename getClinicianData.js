// will retrieve geoJSON for the 6 clinicians and return an array that stores them

const BASE_URL = "https://3qbqr98twd.execute-api.us-west-2.amazonaws.com/test";

async function fetchClinicianData(clinicianID) {
  const url = `${BASE_URL}/clinicianstatus/${clinicianID}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      "Content-Type": "application/json",
    });
    if (!response.ok) {
      throw new Error(`Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error.message);
  }
}

function validateGeoJSONResponse(clinicianGeoJSON) {
  if (typeof clinicianGeoJSON !== "object" || clinicianGeoJSON == null)
    throw new Error("Invalid object: not a GeoJSON object");
  let features = clinicianGeoJSON.features;
  if (!Array.isArray(features) || features.length === 0) {
    throw new Error("Invalid Object: features array is missing or empty");
  }
  for (let i = 0; i < features.length; i++) {
    if (!features[i].type || features[i].type !== "Feature") {
      throw new Error("Invalid object: each feature must have type 'Feature'");
    }
    if (
      !features[i].geometry ||
      !features[i].geometry.type ||
      !features[i].geometry.coordinates
    ) {
      throw new Error(
        "Invalid object: feature missing geometry/type/coordinates"
      );
    }
    const type = features[i].geometry.type;
    if (type !== "Point" && type !== "Polygon")
      throw new Error(
        "Invalid object: each object must have one Point and one Polygon"
      );
  }
}

export async function getClinicianData(clinicianID) {
  try {
    const clinicianData = await fetchClinicianData(clinicianID);
    validateGeoJSONResponse(clinicianData);
    return { clinicianID, clinicianData };
  } catch (error) {
    throw new Error(`Unable to retrieve clinician ${clinicianID}.`);
  }
}
