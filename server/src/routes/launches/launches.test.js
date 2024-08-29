const request = require("supertest");
const app = require("../../app");
const { mongoConnect,mongoDisconnect } = require("../../services/mongo");
const { loadPlanetsData } = require("../../models/planets.model");

describe("Testing Launches API", () => {

    beforeAll(async () => {
        await mongoConnect()
        await loadPlanetsData()
    })

    afterAll(async () => {
        await mongoDisconnect()
    })

  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("Test POST /launch", () => {
    const completeLaunchData = {
      mission: "USS E",
      rocket: "NCC",
      target: "Kepler-62 f",
      launchDate: "January 4 2028",
    };

    const launchDataWithoutDate = {
      mission: "USS E",
      rocket: "NCC",
      target: "Kepler-62 f",
    };

    const launchDatawithInvalidDate = {
      mission: "USS E",
      rocket: "NCC",
      target: "Kepler-62 f",
      launchDate: "zoot",
    };

    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject({
        mission: "USS E",
        rocket: "NCC",
        target: "Kepler-62 f",
      });
    });

    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing Required launch property",
      });
    });

    test("It should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDatawithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Invalid Launch Date",
      });
    });
  });
});
