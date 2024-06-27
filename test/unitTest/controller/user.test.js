const userController = require("../../../controllers/user");
const { PrismaClient } = require("@prisma/client");
const { secretHash } = require("../../../utils/hashSalt");
const { randomUUID } = require("crypto");
const prisma = new PrismaClient();
const { unitTest, serverFailed } = require("./index");


jest.mock("@prisma/client", () => {
    const mPrismaClient = {
        user: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        auth: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        $transaction: jest.fn(),
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

jest.mock("crypto", () => ({
    randomUUID: jest.fn(),
}));

jest.mock("../../../utils/hashSalt", () => ({
    secretCompare: jest.fn(),
    secretHash: jest.fn(),
}));

describe("User API", () => {
    let req, res, next;

    const userDummyData = [
        {
            id: "123",
            name: "Agus",
            phoneNumber: "08962394959",
            familyName: "Anto",
            role: "BUYER",
            auth: {
                id: "123",
                email: "agus@gmail.com",
                isVerified: true,
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
    });

    describe("getAllUser", () => {
        const getAllUser = [
            {
                description: "Sucess",
                prisma: [prisma.user.findMany, prisma.user.count],
                dummyData: [userDummyData, 1],
                controller: userController.getAllUsers,
                req: (req = {
                    query: {
                        page: 1,
                        limit: 10,
                    },
                }),
                statusOutcome: { status: true },
                code: 200,
            },
        ];

        getAllUser.forEach((test) => {
            it(test.description, async () => {
                await unitTest(
                    test.prisma,
                    test.controller,
                    test.dummyData,
                    test.req,
                    test.statusOutcome,
                    test.code,
                    null,
                    test.errorMessage
                );
            });
        });

        it(" failed, 500", async () => {
            await serverFailed(
                (req = {
                    query: {
                        page: 1,
                        limit: 10,
                    },
                }),
                prisma.user.findMany,
                userController.getAllUsers
            );
        });
    });

    describe("getById", () => {
        const getUserById = [
            {
                description: "Sucess",
                prisma: [prisma.user.findUnique],
                dummyData: [userDummyData],
                controller: userController.getUserById,
                req: (req = {
                    params: {
                        id: "123",
                    },
                }),
                statusOutcome: { status: true },
                code: 200,
            },
        ];

        getUserById.forEach((test) => {
            it(test.description, async () => {
                await unitTest(
                    test.prisma,
                    test.controller,
                    test.dummyData,
                    test.req,
                    test.statusOutcome,
                    test.code,
                    null,
                    test.errorMessage
                );
            });
        });

        it(" failed, 500", async () => {
            await serverFailed(
                (req = {
                    params: {
                        id: "123",
                    },
                }),
                prisma.user.findUnique,
                userController.getUserById
            );
        });
    });

    describe("createUsers", () => {
        beforeEach(() => {
            req = {
                body: {
                    name: "asep",
                    phoneNumber: "089653421423",
                    familyName: "agus",
                    role: "BUYER",
                    email: "asep@test.com",
                    password: "password",
                    isVerified: true,
                },
            };
        });

        const body = {
            id: "mercy",
            name: "asep",
            phoneNumber: "089653421423",
            familyName: "agus",
            role: "BUYER",
            isVerified: true,
        };

        it("Success", async () => {
            randomUUID.mockReturnValue("mercy");
            prisma.user.findUnique.mockResolvedValue(userDummyData);
            prisma.user.create.mockResolvedValue(body);

            secretHash.mockReturnValue("hashedPassword");
            prisma.$transaction.mockImplementation(async (callback) => {
                await callback({
                    user: prisma.user,
                    auth: prisma.auth,
                });
            });

            await userController.createUser(req, res, next);
            
            // expect(res.status).toHaveBeenCalledWith(201);
            // expect(res.json).toHaveBeenCalledWith({
            //     status: true,
            //     message: "User created successfully",
            //     data: body,
            // });
        });

        it(" failed, 500", async () => {
            await serverFailed(
                // (req = {
                //     body: {
                //         name: "asep",
                //         phoneNumber: "089653421423",
                //         familyName: "agus",
                //         role: "BUYER",
                //         email: "asep@test.com",
                //         password: "password",
                //         isVerified: true,
                //     },
                // }),
                req,
                prisma.user.create,
                userController.createUser
            );
        });
    });

    describe("UpdateUser", () => {
        beforeEach(() => {
            req = {
                body: {
                    id: "123",
                    name: "dadang",
                    phoneNumber: "08962394959",
                    familyName: "Anto",
                    role: "BUYER",
                },
                params: {
                    id: "123",
                },
            };
        });

        const data = {
            id: "123",
            name: "dadang",
            phoneNumber: "08962394959",
            familyName: "Anto",
            role: "BUYER",
            isVerified: true,
        };

        it("Success", async () => {
            randomUUID.mockReturnValue("mercy");
            prisma.user.findUnique.mockResolvedValue(userDummyData);
            prisma.user.update.mockResolvedValue(data);

            secretHash.mockReturnValue("hashedPassword");
            prisma.$transaction.mockImplementation(async (callback) => {
                await callback({
                    user: prisma.user,
                    auth: prisma.auth,
                });
            });

            await userController.updateUser(req, res, next);
            
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it(" failed, 500", async () => {
            await serverFailed(
                (req = {
                    body: {
                        id: "123",
                        name: "dadang",
                        phoneNumber: "08962394959",
                        familyName: "Anto",
                        role: "BUYER",
                    },
                    params: {
                        id: "123",
                    },
                }),
                prisma.user.update,
                userController.updateUser
            );
        });
    });

    describe("deleteUser", () => {
        const deleteUser = [
            {
                description: "Sucess",
                prisma: [prisma.user.findUnique],
                dummyData: [userDummyData],
                controller: userController.deleteUser,
                req: (req = {
                    params: {
                        id: "123",
                    },
                }),
                statusOutcome: { status: true },
                code: 200,
            },
        ];

        deleteUser.forEach((test) => {
            it(test.description, async () => {
                await unitTest(
                    test.prisma,
                    test.controller,
                    test.dummyData,
                    test.req,
                    test.statusOutcome,
                    test.code,
                    null,
                    test.errorMessage
                );
            });
        });

        it(" failed, 500", async () => {
            await serverFailed(
                (req = {
                    params: {
                        id: "123",
                    },
                }),
                prisma.user.delete,
                userController.deleteUser
            );
        });
    });
});
