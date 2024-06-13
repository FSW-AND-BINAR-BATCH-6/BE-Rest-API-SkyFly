const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authentication = require("../../../middlewares/authentication");

jest.mock("@prisma/client", () => {
    const mPrismaClient = {
        user: {
            findUnique: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

jest.mock("jsonwebtoken", () => ({
    verify: jest.fn(),
}));

describe("Authentication Middleware", () => {
    const userDummyData = {
        id: "Togenashi",
        name: "Togeari",
        role: "BUYER",
        familyName: "Family",
        phoneNumber: "628123456789",
        auth: {
            id: "Togenashi",
            email: `togeari@test.com`,
            password: "password",
            isVerified: true,
            otpToken: "1233",
            secretToken: "12333",
        },
    };

    beforeEach(() => {
        (res = jest.fn()), (next = jest.fn());
    });

    it("success", async () => {
        req = {
            headers: {
                authorization: "tokenMockup",
            },
            user: userDummyData,
        };

        jwt.verify.mockReturnValue(userDummyData);
        prisma.user.findUnique.mockResolvedValue(userDummyData);

        await authentication(req, res, next);
        expect(req.user).toEqual(userDummyData);
        expect(next).toHaveBeenCalled();
    });

    it("Token not found", async () => {
        req = {
            headers: {},
            user: userDummyData,
        };
        await authentication(req, res, next);
        expect(next).toHaveBeenCalledWith(
            createHttpError(401, { message: "Token not found!" })
        );
    });

    it("Unauthorized, please re-login", async () => {
        req = {
            headers: {
                authorization: "tokenMockup",
            },
            user: userDummyData,
        };

        jwt.verify.mockReturnValue(userDummyData);
        prisma.user.findUnique.mockResolvedValue(null);

        await authentication(req, res, next);
        expect(next).toHaveBeenCalledWith(
            createHttpError(401, { message: "Unauthorized, please re-login" })
        );
    })
    it("Internal server error", async () => {
        req = {
            headers: {
                authorization: "tokenMockup",
            },
            user: userDummyData,
        };
        prisma.user.findUnique.mockRejectedValue(new Error("Invalid server error"))
        await authentication(req, res, next);
        expect(next).toHaveBeenCalledWith(
            createHttpError(500, { message: "Invalid server error" })
        );
    })
});
