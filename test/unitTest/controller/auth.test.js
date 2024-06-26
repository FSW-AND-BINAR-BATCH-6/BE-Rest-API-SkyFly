const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");
const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const https = require("follow-redirects").https;

const { generateTOTP, validateTOTP } = require("../../../utils/otp");
const { secretCompare, secretHash } = require("../../../utils/hashSalt");
const { generateJWT } = require("../../../utils/jwtGenerate");
const { authorizationUrl } = require("../../../lib/googleOauth2");
const { google } = require("googleapis");

const authController = require("../../../controllers/auth");
const { sendEmail } = require("../../../lib/nodeMailer");
const prisma = new PrismaClient();

jest.mock("follow-redirects", () => ({
    https: {
        request: jest.fn(),
    },
}));

jest.mock("@prisma/client", () => {
    const mPrismaClient = {
        $transaction: jest.fn(),
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
            update: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

jest.mock("googleapis", () => {
    const oauth2Mock = {
        getToken: jest.fn(),
        setCredentials: jest.fn(),
        userinfo: {
            get: jest.fn(),
        },
        generateAuthUrl: jest.fn(),
    };

    return {
        google: {
            auth: {
                OAuth2: jest.fn(() => oauth2Mock),
            },
        },
    };
});

jest.mock("jsonwebtoken", () => ({
    verify: jest.fn(),
}));

jest.mock("../../../utils/hashSalt", () => ({
    secretCompare: jest.fn(),
    secretHash: jest.fn(),
}));

jest.mock("crypto", () => ({
    randomUUID: jest.fn(),
}));

jest.mock("../../../utils/otp", () => ({
    generateTOTP: jest.fn(),
    validateTOTP: jest.fn(),
}));

jest.mock("../../../utils/jwtGenerate", () => ({
    generateJWT: jest.fn(),
}));

jest.mock("../../../lib/nodeMailer", () => ({
    getHtml: jest.fn(),
    sendEmail: jest.fn(),
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

    const loginDummyData = [
        {
            id: "Togenashi",
            email: `togeari@test.com`,
            password: "password",
            isVerified: true,
            otpToken: "1233",
            secretToken: "tokenMockup",
            user: {
                id: "Togenashi",
                name: "Togeari",
                role: "BUYER",
                familyName: "Family",
                phoneNumber: "628123456789",
            },
        },
        {
            id: "Togenashi",
            email: `togeari@test.com`,
            password: "password",
            isVerified: false,
            otpToken: "1233",
            secretToken: "tokenMockup",
            user: {
                id: "Togenashi",
                name: "Togeari",
                role: "BUYER",
                familyName: "Family",
                phoneNumber: "628123456789",
            },
        },
    ];

    const resendOTP = [
        {
            id: "Togenashi",
            name: "Togeari",
            role: "BUYER",
            email: `togeari@test.com`,
            password: "hashedpassword",
            isVerified: false,
            otpToken: "1233",
            secretToken: "tokenMockup",
        },
        {
            id: "Togenashi",
            name: "Togeari",
            role: "BUYER",
            email: `togeari@test.com`,
            password: "hashedpassword",
            isVerified: true,
            otpToken: "newOtpToken",
            secretToken: "newSecretToken",
        },
        {
            id: "Togenashi",
            name: "Togeari",
            role: "BUYER",
            email: `togeari@test.com`,
            password: "hashedpassword",
            isVerified: true,
            otpToken: null,
            secretToken: null,
        },
    ];

    const registerDummyData = [
        {
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
        },
    ];

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            redirect: jest.fn(),
        };
        next = jest.fn();
        oauth2Client = new google.auth.OAuth2();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("handleRegister", () => {
        req = {
            body: {
                name: "Togeari",
                phoneNumber: "628123456789",
                password: "password",
                email: `togeari@test.com`,
            },
        };

        it("Success", async () => {
            prisma.auth.findUnique.mockImplementationOnce(() =>
                Promise.resolve(null)
            );
            prisma.auth.findUnique.mockImplementationOnce(() =>
                Promise.resolve(loginDummyData[0])
            );
            prisma.user.create.mockResolvedValue(registerDummyData);
            await secretHash.mockReturnValue("hashedpassword");
            await generateTOTP.mockReturnValue("1233");
            randomUUID.mockReturnValue("Togenashi");
            await generateJWT.mockReturnValue("tokenMockup");

            await authController.handleRegister(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message:
                    "Verification token has been sent, please check your email",
                _token: "tokenMockup",
            });
        });

        it("Failed, 409", async () => {
            prisma.auth.findUnique.mockResolvedValue(registerDummyData);
            await authController.handleRegister(req, res, next);
            expect(prisma.user.create).not.toHaveBeenCalled();

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

    // stil having problem mocking google service
    // describe("handleLoginGoogle", () => {
    //     beforeEach(() => {
    //         req = {
    //             query: {
    //                 code: "testCode",
    //             },
    //         };
    //     });

    //     it("Success", async () => {
    //         const tokens = {
    //             tokens: {
    //                 access_token: "ya29.a0AfH6SMBN9VzJZP",
    //                 expires_in: 3599,
    //                 refresh_token: "1//04iH0Mn",
    //                 scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
    //                 token_type: "Bearer",
    //                 id_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjM4OWRjNjhjM",
    //             },
    //         };

    //         const userData = {
    //             data: {
    //                 id: "12345678901234567890",
    //                 email: "user@example.com",
    //                 verified_email: true,
    //                 name: "John Doe",
    //                 given_name: "John",
    //                 family_name: "Doe",
    //                 picture: "https://lh3.googleusercontent.com/a-/AOh14Gg8h8",
    //                 locale: "en",
    //             },
    //         };

    //         oauth2Client.getToken.mockResolvedValue(tokens);
    //         oauth2Client.userinfo.get.mockResolvedValue(userData);
    //         secretHash.mockReturnValue("hashedpassword");
    //         randomUUID.mockReturnValue("uuid");
    //         generateJWT.mockReturnValue("jwtToken");

    //         await authController.handleLoginGoogle(req, res, next);

    //         expect(oauth2Client.getToken).toHaveBeenCalledWith(req.query.code);
    //         expect(oauth2Client.setCredentials).toHaveBeenCalledWith(
    //             tokens.tokens
    //         );
    //         expect(res.status).toHaveBeenCalledWith(200);
    //         expect(res.json).toHaveBeenCalledWith({
    //             status: true,
    //             message: "User logged in successfully",
    //             _token: "jwtToken",
    //         });
    //     });
    // });

    describe("handleLogin", () => {
        beforeEach(() => {
            req = {
                body: {
                    email: "togeari@test.com",
                    body: "password",
                },
            };
        });

        it("Success", async () => {
            prisma.auth.findUnique.mockResolvedValue(loginDummyData[0]);
            secretCompare.mockReturnValue(true);
            generateJWT.mockReturnValue("mockToken");
            await authController.handleLogin(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "User logged in successfully",
                _token: "mockToken",
            });
        });

        it("Failed, 404", async () => {
            prisma.auth.findUnique.mockResolvedValue(null);
            await authController.handleLogin(req, res, next);
            expect(secretCompare).not.toHaveBeenCalled();
            expect(generateJWT).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                createHttpError(404, { message: "User is not found" })
            );
        });

        it("Failed, 401, email not verified", async () => {
            prisma.auth.findUnique.mockResolvedValue(loginDummyData[1]);
            await authController.handleLogin(req, res, next);
            expect(secretCompare).not.toHaveBeenCalled();
            expect(generateJWT).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                createHttpError(401, {
                    message: "Email has not been activated",
                })
            );
        });

        it("Failed, 401, wrong password", async () => {
            prisma.auth.findUnique.mockResolvedValue(loginDummyData[0]);
            secretCompare.mockReturnValue(false);
            await authController.handleLogin(req, res, next);
            expect(generateJWT).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                createHttpError(401, { message: "Wrong password" })
            );
        });

        it("Failed, 500", async () => {
            await serverFailed(
                req,
                res,
                next,
                prisma.auth.findUnique,
                authController.handleLogin
            );
        });
    });

    describe("resendOTP", () => {
        beforeEach(() => {
            req = {
                query: {
                    token: "tokenMockup",
                },
            };
        });

        it("Success", async () => {
            prisma.auth.findUnique.mockResolvedValue(resendOTP[0]);
            prisma.auth.update.mockResolvedValue(resendOTP[1]);
            jwt.verify.mockReturnValue(resendOTP[0]);
            generateTOTP.mockReturnValue("newOtpToken");
            randomUUID.mockReturnValue("Togenashi");
            generateJWT.mockReturnValue("newSecretToken");

            await authController.resendOTP(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(
                "tokenMockup",
                process.env.JWT_SIGNATURE_KEY
            );
            expect(prisma.auth.findUnique).toHaveBeenCalledWith({
                where: {
                    email: resendOTP[0].email,
                },
                include: {
                    user: true,
                },
            });
            expect(prisma.auth.update).toHaveBeenCalledWith({
                where: {
                    email: resendOTP[0].email,
                },
                data: {
                    otpToken: "newOtpToken",
                    secretToken: "newSecretToken",
                },
            });
            expect(sendEmail).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message:
                    "Verification link has been sent, please check your email",
                _token: "newSecretToken",
            });
        });

        it("Token is invalid", async () => {
            jwt.verify.mockReturnValue(loginDummyData[0]);
            prisma.auth.findUnique.mockResolvedValue({
                id: "Togenashi",
                email: `togeari@test.com`,
                password: "password",
                isVerified: false,
                otpToken: "1233",
                secretToken: "12334",
                user: {
                    id: "Togenashi",
                    name: "Togeari",
                    role: "BUYER",
                    familyName: "Family",
                    phoneNumber: "628123456789",
                },
            });

            await authController.resendOTP(req, res, next);

            expect(next).toHaveBeenCalledWith(
                createHttpError(404, { message: "Token is invalid" })
            );
        });

        it("User is not found", async () => {
            jwt.verify.mockReturnValue(loginDummyData[0]);
            prisma.auth.findUnique.mockResolvedValue(false);

            await authController.resendOTP(req, res, next);
            expect(prisma.auth.update).not.toHaveBeenCalled();
            expect(generateJWT).not.toHaveBeenCalled();
            expect(generateTOTP).not.toHaveBeenCalled();
            expect(randomUUID).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                createHttpError(404, { message: "User is not found" })
            );
        });

        it("User is already verified", async () => {
            prisma.auth.findUnique.mockResolvedValue({
                ...resendOTP[0],
                isVerified: true,
            });
            jwt.verify.mockReturnValue(resendOTP[0]);

            await authController.resendOTP(req, res, next);

            expect(next).toHaveBeenCalledWith(
                createHttpError(403, {
                    message: "User email has been verified",
                })
            );
        });

        it("Handles error", async () => {
            jwt.verify.mockImplementation(() => {
                throw new Error("Error");
            });

            await authController.resendOTP(req, res, next);

            expect(next).toHaveBeenCalledWith(
                createHttpError(500, { message: "Error" })
            );
        });
    });

    describe("verifyOTP", () => {
        beforeEach(() => {
            req = {
                query: {
                    token: "tokenMockup",
                },
                body: {
                    otp: "1233",
                },
            };
        });

        it("Success", async () => {
            prisma.auth.findUnique.mockResolvedValue(loginDummyData[1]);
            prisma.auth.update.mockResolvedValue(resendOTP[2]);
            jwt.verify.mockReturnValue(resendOTP[0]);
            validateTOTP.mockReturnValue("1233");

            await authController.verifyOTP(req, res, next);
            expect(jwt.verify).toHaveBeenCalledWith(
                "tokenMockup",
                process.env.JWT_SIGNATURE_KEY
            );

            expect(prisma.auth.findUnique).toHaveBeenCalledWith({
                where: {
                    email: "togeari@test.com",
                },
                include: {
                    user: true,
                },
            });

            expect(prisma.auth.update).toHaveBeenCalledWith({
                where: {
                    id: "Togenashi",
                },
                data: {
                    isVerified: true,
                    secretToken: null,
                    otpToken: null,
                },
            });

            expect(validateTOTP).toHaveBeenCalledWith("1233");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "user email verified successfully",
            });
        });

        it("Token is invalid", async () => {
            jwt.verify.mockReturnValue(loginDummyData[0]);
            prisma.auth.findUnique.mockResolvedValue({
                id: "Togenashi",
                email: `togeari@test.com`,
                password: "password",
                isVerified: false,
                otpToken: "1233",
                secretToken: "12334",
                user: {
                    id: "Togenashi",
                    name: "Togeari",
                    role: "BUYER",
                    familyName: "Family",
                    phoneNumber: "628123456789",
                },
            });

            await authController.resendOTP(req, res, next);

            expect(next).toHaveBeenCalledWith(
                createHttpError(404, { message: "Token is invalid" })
            );
        });

        it("User is not found", async () => {
            jwt.verify.mockReturnValue(loginDummyData[0]);
            prisma.auth.findUnique.mockResolvedValue(false);

            await authController.resendOTP(req, res, next);
            expect(prisma.auth.update).not.toHaveBeenCalled();
            expect(validateTOTP).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                createHttpError(404, { message: "User is not found" })
            );
        });

        it("User is already verified", async () => {
            prisma.auth.findUnique.mockResolvedValue({
                ...resendOTP[0],
                isVerified: true,
            });
            jwt.verify.mockReturnValue(resendOTP[0]);

            await authController.resendOTP(req, res, next);

            expect(next).toHaveBeenCalledWith(
                createHttpError(403, {
                    message: "User email has been verified",
                })
            );
        });

        it("OTP token is expired", async () => {
            prisma.auth.findUnique.mockResolvedValue(resendOTP[0]);
            jwt.verify.mockReturnValue(resendOTP[0]);
            validateTOTP.mockReturnValue(null);

            await authController.verifyOTP(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(422, { message: "OTP Token is expired" })
            );
        });

        it("Handles error", async () => {
            jwt.verify.mockImplementation(() => {
                throw new Error("Error");
            });

            await authController.resendOTP(req, res, next);

            expect(next).toHaveBeenCalledWith(
                createHttpError(500, { message: "Error" })
            );
        });
    });

    describe("sendResetPassword", () => {
        beforeEach(() => {
            req = {
                body: {
                    email: "togeari@test.com",
                },
            };
        });

        it("success", async () => {
            prisma.auth.findUnique.mockResolvedValue(loginDummyData[1]);
            prisma.auth.update.mockResolvedValue(loginDummyData[1]);
            randomUUID.mockReturnValue("Togenashi");
            generateJWT.mockReturnValue("tokenMockup");

            await authController.sendResetPassword(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("User is not found", async () => {
            prisma.auth.findUnique.mockResolvedValue(null);
            await authController.sendResetPassword(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(404, { message: "User is not found" })
            );
        });

        it("Handle server failed", async () => {
            prisma.auth.findUnique.mockRejectedValue(
                new Error("Internal Server Error")
            );
            await authController.sendResetPassword(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(500, { message: "Internal Server Error" })
            );
        });
    });
    describe("resetPassword", () => {
        beforeEach(() => {
            req = {
                query: {
                    token: "tokenMockup",
                },
                body: {
                    password: "password",
                },
            };
        });

        it("Success", async () => {
            jwt.verify.mockReturnValue(resendOTP[1]);
            secretHash.mockReturnValue("password");
            prisma.auth.findUnique.mockResolvedValue(loginDummyData[0]);
            prisma.auth.update.mockResolvedValue(loginDummyData[0]);
            await authController.resetPassword(req, res, next);
            expect(jwt.verify).toHaveBeenCalledWith(
                "tokenMockup",
                process.env.JWT_SIGNATURE_KEY
            );
            expect(prisma.auth.findUnique).toHaveBeenCalledWith({
                where: {
                    email: "togeari@test.com",
                },
                include: {
                    user: true,
                },
            });
            expect(prisma.auth.update).toHaveBeenCalledWith({
                where: {
                    id: "Togenashi",
                },
                data: {
                    password: "password",
                    secretToken: null,
                },
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "user password updated successfully",
            });
        });

        it("Invalid Token", async () => {
            jwt.verify.mockReturnValue(loginDummyData[0]);
            secretHash.mockReturnValue("password");
            prisma.auth.findUnique.mockResolvedValue({
                id: "Togenashi",
                email: `togeari@test.com`,
                password: "password",
                isVerified: false,
                otpToken: "1233",
                secretToken: "12334",
                user: {
                    id: "Togenashi",
                    name: "Togeari",
                    role: "BUYER",
                    familyName: "Family",
                    phoneNumber: "628123456789",
                },
            });
            await authController.resetPassword(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(422, { message: "Token is invalid" })
            );
        });

        it("User is not found", async () => {
            jwt.verify.mockReturnValue(loginDummyData[0]);
            secretHash.mockReturnValue("password");
            prisma.auth.findUnique.mockResolvedValue(null);
            await authController.resetPassword(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(402, { message: "User is not found" })
            );
        });

        it("Handles server error", async () => {
            jwt.verify.mockImplementation(() => {
                throw new Error("Error");
            });

            await authController.resendOTP(req, res, next);

            expect(next).toHaveBeenCalledWith(
                createHttpError(500, { message: "Error" })
            );
        });
    });

    describe("getUserLoggedIn", () => {
        beforeEach(() => {
            req = {
                user: loginDummyData[0],
            };
        });

        it("Success", async () => {
            await authController.getUserLoggedIn(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                data: loginDummyData[0],
            });
        });

        it("Unauthenticated", async () => {
            req = {
                user: null,
            };
            await authController.getUserLoggedIn(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(401, { message: "Unauthenticated" })
            );
        });
    });

    describe("updateUserLoggedIn", () => {
        beforeEach(() => {
            req = {
                body: {
                    name: "Togeari",
                    role: "BUYER",
                    familyName: "Family",
                    phoneNumber: "628123456789",
                    password: "password",
                    confirmPassword: "password",
                },
                user: {
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
                },
            };
        });

        it("Success", async () => {
            secretHash.mockReturnValue("password");
            prisma.$transaction.mockImplementation(async (callback) => {
                await callback({
                    user: prisma.user,
                    auth: prisma.auth,
                });
            });

            await authController.updateUserLoggedIn(req, res, next);

            expect(prisma.$transaction).toHaveBeenCalledTimes(1);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: "Togenashi" },
                data: {
                    name: "Togeari",
                    phoneNumber: "628123456789",
                    familyName: "Family",
                },
            });
            expect(prisma.auth.update).toHaveBeenCalledWith({
                where: { id: "Togenashi" },
                data: { password: "password" },
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "user data updated successfully",
            });
        });

        it("Failed", async () => {
            secretHash.mockReturnValue("password");
            prisma.$transaction.mockImplementation(async () => {
                throw new Error("error");
            });
            await authController.updateUserLoggedIn(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(422, { message: "error" })
            );
        });

        it("Handles server error", async () => {
            prisma.$transaction.mockRejectedValue(new Error("server failed"));
            await authController.updateUserLoggedIn(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(500, { message: "server failed" })
            );
        });
    });

    describe("redirectAuthorization", () => {
        beforeEach(() => {
            req = {};
        });
        it("success", async () => {
            await authController.redirectAuthorization(req, res);
            expect(res.redirect).toHaveBeenCalledWith(authorizationUrl);
        });
    });

    describe("sendOTPSMS", () => {
        beforeEach(() => {
            req.body = { phoneNumber: "628123456789" };
            req.query = { token: "tokenMockup" };
        });

        it("should send OTP SMS and return status 200 with a token", async () => {
            jwt.verify.mockReturnValue(loginDummyData[1]);
            prisma.auth.findUnique.mockResolvedValue(loginDummyData[1]);
            generateTOTP.mockReturnValue("1233");
            randomUUID.mockReturnValue("Togenashi");
            generateJWT.mockReturnValue("tokenMockup");

            https.request.mockImplementation((options, callback) => {
                const resMock = {
                    on: (event, handler) => {
                        if (event === "data") {
                            handler(Buffer.from(""));
                        } else if (event === "end") {
                            handler();
                        }
                    },
                };
                callback(resMock);
                return {
                    write: jest.fn(),
                    end: jest.fn(),
                };
            });

            await authController.sendOTPSMS(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(
                "tokenMockup",
                process.env.JWT_SIGNATURE_KEY
            );
            expect(prisma.auth.findUnique).toHaveBeenCalledWith({
                where: {
                    email: "togeari@test.com",
                },
                include: {
                    user: true,
                },
            });
            expect(generateTOTP).toHaveBeenCalled();
            expect(randomUUID).toHaveBeenCalled();
            expect(generateJWT).toHaveBeenCalled();
            expect(prisma.auth.update).toHaveBeenCalledWith({
                where: {
                    email: "togeari@test.com",
                },
                data: {
                    otpToken: "1233",
                    secretToken: "tokenMockup",
                },
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "SMS verification sent",
                _token: "tokenMockup",
            });
        });
    });
});
