const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");
const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const { generateTOTP, validateTOTP } = require("../../../utils/otp");
const { secretCompare, secretHash } = require("../../../utils/hashSalt");
const { generateJWT } = require("../../../utils/jwtGenerate");
const { generateSecretEmail } = require("../../../utils/emailHandler");
const { authorizationUrl, oauth2Client } = require("../../../lib/googleOauth2");
const { google } = require("googleapis");

const authController = require("../../../controllers/auth");
const prisma = new PrismaClient();

jest.mock("@prisma/client", () => {
    const mPrismaClient = {
        auth: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        user: {
            create: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

jest.mock("../../../utils/hashSalt", () => ({
    secretCompare: jest.fn(),
    secretHash: jest.fn(),
}));

jest.mock("crypto", () => ({
    randomUUID: jest.fn(),
}));

jest.mock("../../../utils/otp", () => ({
    generateTOTP: jest.fn(),
}));

jest.mock("../../../utils/jwtGenerate", () => ({
    generateJWT: jest.fn(),
}));

jest.mock("../../../utils/emailHandler", () => ({
    generateSecretEmail: jest.fn(),
}));

const serverFailed = async (
    req,
    res,
    next,
    prismaFunction,
    controllerFunction
) => {
    const errorMessage = "Internal Server Error";
    prismaFunction.mockRejectedValue(new Error(errorMessage));
    await controllerFunction(req, res, next);
    expect(next).toHaveBeenCalledWith(
        createHttpError(500, { message: errorMessage })
    );
};

describe("Auth API", () => {
    let req, res, next;

    const registerDummyData = [
        {
            id: "Togenashi",
            name: "Togeari",
            role: "BUYER",
            familyName: "Family",
            phoneNumber: "628123456789",
            auth: {
                create: {
                    id: "Togenashi",
                    email: `togeari@test.com`,
                    password: "password",
                    isVerified: true,
                    otpToken: "1233",
                    secretToken: "12333",
                },
            },
        },
    ];

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("handleRegister", () => {
        req = {
            body: registerDummyData,
        };

        it("Success", async () => {
            prisma.auth.findUnique.mockResolvedValue(null);
            prisma.user.create.mockResolvedValue(registerDummyData);
            secretHash.mockReturnValue("hashedpassword");
            generateTOTP.mockReturnValue("1233");
            randomUUID.mockReturnValue("Togenashi");
            generateJWT.mockReturnValue("jwttokenmock");

            await authController.handleRegister(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message:
                    "Verification token has been sent, please check your email",
                _token: "jwttokenmock",
            });
        });

        it("Failed, 409", async () => {
            prisma.auth.findUnique.mockResolvedValue(registerDummyData);
            await authController.handleRegister(req, res, next);
            expect(prisma.user.create).not.toHaveBeenCalled()

            expect(next).toHaveBeenCalledWith(
                createHttpError(409, {
                    message: "Email has already been taken",
                })
            );
        });

        it("Failed, 500", async () => {
            await serverFailed(
                req,
                res,
                next,
                prisma.auth.findUnique,
                authController.handleRegister
            );
        });
    });
    
    
});
