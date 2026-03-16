import { jest } from "@jest/globals";

jest.unstable_mockModule("../sendEmail.js", () => ({
  sendEmail: jest.fn(),
}));

const { checkBoundsAndAlert, outOfBoundsState } = await import(
  "../triggerClinicianMonitoring.js"
);
const { sendEmail } = await import("../sendEmail.js");

beforeEach(() => {
  jest.clearAllMocks();
  outOfBoundsState.clear();
});

function clinicianInsidePolygon() {
  return {
    clinicianID: 1,
    clinicianData: {
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [0.5, 0.5] },
        },
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0],
              ],
            ],
          },
        },
      ],
    },
  };
}

function clinicianOutsidePolygon() {
  return {
    clinicianID: 1,
    clinicianData: {
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [2, 2] },
        },
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0],
              ],
            ],
          },
        },
      ],
    },
  };
}

function clinicianOnEdge() {
  return {
    clinicianID: 1,
    clinicianData: {
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [1, 0.5] },
        },
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0],
              ],
            ],
          },
        },
      ],
    },
  };
}

test("inside polygon sends no email", async () => {
  const data = [clinicianInsidePolygon()];
  await checkBoundsAndAlert(data, Date.now());
  expect(sendEmail).not.toHaveBeenCalled();
});

test("inside two polygons sends no email", async () => {
  const clinician = clinicianInsidePolygon();
  clinician.clinicianData.features.push({
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [2, 2],
          [3, 2],
          [3, 3],
          [2, 3],
          [2, 2],
        ],
      ],
    },
  });
  await checkBoundsAndAlert([clinician], Date.now());
  expect(sendEmail).not.toHaveBeenCalled();
});

test("outside polygon sends an email", async () => {
  const data = [clinicianOutsidePolygon()];
  await checkBoundsAndAlert(data, Date.now());
  expect(sendEmail).toHaveBeenCalledTimes(1);
});

test("point on polygon edge sends no email", async () => {
  const data = [clinicianOnEdge()];
  await checkBoundsAndAlert(data, Date.now());
  expect(sendEmail).not.toHaveBeenCalled();
});

test("clinician goes out then back in sends two emails", async () => {
  const now = Date.now();
  const outside = clinicianOutsidePolygon();
  await checkBoundsAndAlert([outside], now);

  const inside = clinicianInsidePolygon();
  await checkBoundsAndAlert([inside], now + 60000);

  expect(sendEmail).toHaveBeenCalledTimes(2);
});

test("clinician stays out of bounds for more than 5 minutes sends two emails", async () => {
  const now = Date.now();
  const outside = clinicianOutsidePolygon();
  await checkBoundsAndAlert([outside], now);
  await checkBoundsAndAlert([outside], now + 6 * 60000);
  expect(sendEmail).toHaveBeenCalledTimes(2);
});

test("clinician stays out of bounds for less than 5 minutes sends one email", async () => {
  const now = Date.now();
  const outside = clinicianOutsidePolygon();
  await checkBoundsAndAlert([outside], now);
  await checkBoundsAndAlert([outside], now + 3 * 60000);
  expect(sendEmail).toHaveBeenCalledTimes(1);
});

test("outside two polygons → sends one email", async () => {
  const clinician = clinicianOutsidePolygon();
  clinician.clinicianData.features.push({
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [10, 10],
          [11, 10],
          [11, 11],
          [10, 11],
          [10, 10],
        ],
      ],
    },
  });
  await checkBoundsAndAlert([clinician], Date.now());
  expect(sendEmail).toHaveBeenCalledTimes(1);
});

test("moves from one polygon to another → no emails", async () => {
  const now = Date.now();
  const clinician = {
    clinicianID: 1,
    clinicianData: {
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [0.5, 0.5] }, // inside polygon 1
        },
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0],
              ],
            ],
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [5, 5],
                [6, 5],
                [6, 6],
                [5, 6],
                [5, 5],
              ],
            ],
          },
        },
      ],
    },
  };
  await checkBoundsAndAlert([clinician], now);
  clinician.clinicianData.features[0].geometry.coordinates = [5.5, 5.5];
  await checkBoundsAndAlert([clinician], now + 60000);
  expect(sendEmail).not.toHaveBeenCalled();
});
