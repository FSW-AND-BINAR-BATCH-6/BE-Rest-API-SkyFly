require("dotenv").config();

const request = require("supertest");

describe("Airports Integration Test", () => {
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

    describe("getAllAirports", () => {
        it("success", async () => {
            const response = await request(baseUrl)
                .get("/api/v1/airports/")
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(200);
        });
    });

    describe("createNewAirport", () => {
        it("success", async () => {
            const response = await request(baseUrl)
                .post("/api/v1/airports/")
                .send({
                    name: "Juanda International Airport",
                    code: "GZZ",
                    country: "jepang",
                    city: "tokyo",
                    continent: "asia",
                })
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(201);
        });
    });

    describe("getAirportById", () => {
        it("success", async () => {
            const response = await request(baseUrl)
                .get("/api/v1/airports/clxvwmyua00044swk81srzfyh")
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(200);
        });
    });

    describe("updateAirport", () => {
        it("success", async () => {
            const response = await request(baseUrl)
                .put("/api/v1/airports/6f690dee-da65-429d-a0f8-67ed5eca86ff")
                .send({
                    name: "Jokowi International Airport",
                })
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(201);
        });
    });

    // describe("deleteAirport", () => {
    //     it("success", async () => {
    //         const response = await request(baseUrl)
    //             .put("/api/v1/airports/id")
    //             .set("Authorization", `Bearer ${token}`);
    //         expect(response.statusCode).toBe(200);
    //     });
    // });
});
