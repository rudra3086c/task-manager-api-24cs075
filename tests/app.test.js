const request = require("supertest");
const app = require("../app");

describe("Application", () => {
    test("returns 404 JSON for an unknown route", async () => {
        const response = await request(app).get("/does-not-exist");

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: "Route not found" });
    });
});
