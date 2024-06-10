const createHttpError = require("http-errors");
const userController = require("../../../controllers/user");
const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");
const prisma = new PrismaClient();

// Mock Function

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
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

jest.mock("crypto", () => ({
    randomUUID: jest.fn(),
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

            }
        }
    ]

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();

    });

    describe("getAllUser", () => {
        it("Success", async () => {
            req = {
                query: {
                    page: 1,
                    limit: 10,
                },
            };

            const totalItems = 1;

            prisma.user.findMany.mockResolvedValue(userDummyData);
            prisma.user.count.mockResolvedValue(totalItems);

            await userController.getAllUsers(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "All user data retrieved successfully",
                totalItems,
                pagination: {
                    totalPages: 1,
                    currentPage: 1,
                    pageItems: 1,
                    nextPage: null,
                    prevPage: null,
                },
                data: userDummyData,
            })

        });

        it(" failed, 500", async () => {
            const errorMessage = "Internal Server Error"
            prisma.user.findMany.mockRejectedValue(new Error(errorMessage))
            await userController.getAllUsers(req, res, next)
            expect(next).toHaveBeenCalledWith(createHttpError(500, { message: errorMessage }))
        });
    });

    describe("getById", () => {
        it("succes", async () => {
            req = {
                params: {
                    id: "123",
                },
            };

            prisma.user.findUnique.mockResolvedValue(userDummyData);

            await userController.getUserById(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "User data retrieved successfully",
                data: userDummyData,
            });
        });

        it(" failed, 500", async () => {
            const errorMessage = "Internal Server Error"
            prisma.user.findUnique.mockRejectedValue(new Error(errorMessage))
            await userController.getUserById(req, res, next)
            expect(next).toHaveBeenCalledWith(createHttpError(500, { message: errorMessage }))
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
                },
            };
        });

        const body = {
            id: "mercy",
            name: "asep",
            phoneNumber: "089653421423",
            familyName: "agus",
            role: "BUYER",
        };

        it("Success", async () => {
            randomUUID.mockReturnValue("mercy");
            prisma.user.create.mockResolvedValue(body);

            await userController.createUser(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "User created successfully",
                data: body,
            });
        });


        it(" failed, 500", async () => {
            const errorMessage = "Internal Server Error"
            prisma.user.create.mockRejectedValue(new Error(errorMessage))
            await userController.createUser(req, res, next)
            expect(next).toHaveBeenCalledWith(createHttpError(500, { message: errorMessage }))
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
        }


        it("Success", async () => {
            randomUUID.mockReturnValue("mercy");
            prisma.user.findUnique.mockResolvedValue(userDummyData);
            prisma.user.update.mockResolvedValue(data);

            await userController.updateUser(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "User updated successfully",
                data: data,
            });
        });

        it(" failed, 500", async () => {
            const errorMessage = "Internal Server Error"
            prisma.user.update.mockRejectedValue(new Error(errorMessage))
            await userController.updateUser(req, res, next)
            expect(next).toHaveBeenCalledWith(createHttpError(500, { message: errorMessage }))
        });
    });

    describe("deleteUser", () => {
        it("succes", async () => {
            req = {
                params: {
                    id: "123",
                },
            };

            prisma.user.findUnique.mockResolvedValue(userDummyData);

            await userController.deleteUser(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "User deleted successfully",
            });
        });

        it(" failed, 500", async () => {
            const errorMessage = "Internal Server Error"
            prisma.user.delete.mockRejectedValue(new Error(errorMessage))
            await userController.deleteUser(req, res, next)
            expect(next).toHaveBeenCalledWith(createHttpError(500, { message: errorMessage }))
        });
    });
});

