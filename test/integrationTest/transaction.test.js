require("dotenv").config();

const request = require("supertest");

describe("Transaction Integration Test", () => {
    let token;
    const baseUrl = "https://backend-skyfly-c1.vercel.app";
    beforeAll(async () => {
        const response = await request(baseUrl)
            .post("/api/v1/auth/login")
            .send({
                email: "faris@test.com",
                password: "password",
            });
        token = response.body._token;
        console.log(`Bearer ${token}`);
    });

    describe("getAllTransactionByUserLoggedIn", () => {
        it("success", async () => {
            const response = await request(baseUrl)
                .get("/api/v1/transactions/")
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(200);
        });
    });

    describe("getTransactionById", () => {
        it("success", async () => {
            const response = await request(baseUrl)
                .get("/api/v1/transactions/clxwjh8qm00029k0vpeiu1u10")
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(200);
        });
    });

    describe("getTransaction", () => {
        it("success", async () => {
            const response = await request(baseUrl)
                .get("/api/v1/transactions/status/2ecaed1c-bfb9-4937-a151-7e16634c7385")
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(200);
        });
    });
    
    describe("getTransaction", () => {
        it("success", async () => {
            const response = await request(baseUrl)
                .get("/api/v1/transactions/status/2ecaed1c-bfb9-4937-a151-7e16634c7385")
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(200);
        });
    });

    // describe("updateTransaction", () => {
    //     it("success", async () => {
    //         const response = await request(baseUrl)
    //             .post("/api/v1/transactions/payment")
    //             .set("Authorization", `Bearer ${token}`);
    //         expect(response.statusCode).toBe(200);
    //     });
    // });
});
