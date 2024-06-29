require("dotenv").config();

const request = require("supertest");

describe("Airline Integration Test", () => {
    let token;
    const baseUrl = "http://localhost:2000";
    beforeAll(async () => {
        const response = await request(baseUrl)
            .post("/api/v1/auth/login")
            .send({
                email: "miminc1@test.com",
                password: "password",
            });
        token = response.body._token;
    });

    describe("getAllAirline", () => {
        it("success", async () => {
            const response = await request(baseUrl)
                .get("/api/v1/airlines/")
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(200);
        });
    });

    describe("createNewAirline", () => {
        it("success", async () => {
            const response = await request(baseUrl)
                .post("/api/v1/airlines/")
                .send({
                    name: "Graff Zeppeline",
                    code: "GR",
                    terminal: "Kedatangan 1",
                })
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(201);
        });
    });

    describe("getAirlineById", () => {
        it("success", async () => {
            const response = await request(baseUrl)
                .get("/api/v1/airlines/10692c9d-522b-42fd-b9a9-90ce1985382e")
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(200);
        });
    });

    describe("updateAirline", () => {
        it("success", async () => {
            const response = await request(baseUrl)
                .put("/api/v1/airlines/46a9e70b-06c5-4c8b-9aec-5240b1dae174")
                .send({
                    name: "Graff Zeppeline",
                    code: "GZ",
                    terminal: "Kedatangan 1",
                })
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(201);
        });
    });

    // describe("deleteAirline", () => {
    //     it("success", async () => {
    //         const response = await request(baseUrl)
    //             .put("/api/v1/airlines/id")
    //             .set("Authorization", `Bearer ${token}`);
    //         expect(response.statusCode).toBe(200);
    //     });
    // });
});
