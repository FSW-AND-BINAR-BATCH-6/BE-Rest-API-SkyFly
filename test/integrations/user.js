require("dotenv").config();

const request = require("supertest");

describe("User Integration Test", () => {
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

    describe("getAllUsers", () => {
        it("success", async () => {
            const response = await request(baseUrl)
                .get("/api/v1/users/")
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(200);
        });
    });

    describe("createUser", () => {
        it("success", async () => {
            const response = await request(baseUrl)
                .post("/api/v1/users/")
                .send({
                    name: "padadang",
                    phoneNumber: "0821823476",
                    familyName: "dudung",
                })
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(201);
        });
    });

    describe("getUserById", () => {
        it("success", async () => {
            const response = await request(baseUrl)
                .get("/api/v1/users/4b10e307-80d3-487d-8cf3-fd05068daa8e")
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(200);
        });
    });

    describe("updateUser", () => {
        it("success", async () => {
            const response = await request(baseUrl)
                .put("/api/v1/users/4b10e307-80d3-487d-8cf3-fd05068daa8e")
                .send({
                    name: "bimo",
                    phoneNumber: "082182347623",
                    familyName: "dudung",
                    role: "ADMIN",
                })
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(200);
        });
    });

    // describe("deleteUser", () => {
    //     it("success", async () => {
    //         const response = await request(baseUrl)
    //             .put("/api/v1/users/id")
    //             .set("Authorization", `Bearer ${token}`);
    //         expect(response.statusCode).toBe(200);
    //     });
    // });
});
