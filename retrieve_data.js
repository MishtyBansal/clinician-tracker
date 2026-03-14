// will retrieve geoJSON for the 6 clinicians and return an array that stores them

async function fetchData(baseURL, clinicianID) {
  //   console.log(clinicianID, baseURL);
  const url = `${baseURL}/clinicianstatus/${clinicianID}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      "Content-Type": "application/json",
    });
    if (!response.ok) {
      console.log("in here");
      throw new Error(`Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error.message);
  }
}

export async function getClinicianData(test) {
  const baseURL = "https://3qbqr98twd.execute-api.us-west-2.amazonaws.com/test";
  let data = [];
  if (!test) {
    for (let i = 1; i < 7; i++) {
      const userData = await fetchData(baseURL, i);
      testValidData(userData);
      data.push({ ID: i, data: userData });
    }
  } else {
    const testingData = await fetchData(baseURL, 7);
    data.push({ ID: 7, data: testingData });
  }
  return data;
}

function testValidData(data) {
  if (typeof data !== "object" || data == null)
    throw new Error("Invalid object: not a GeoJSON object");
  let features = data.features;
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
