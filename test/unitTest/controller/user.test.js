const createHttpError = require("http-errors");
const userController = require("../../../controllers/user");
const { PrismaClient } = require("@prisma/client");
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

describe("User API", () => {
    let req, res, next;

    const userDummyData = [
    { 
        id: "123",
        name: "Agus",
        phoneNumber: "08962394959",
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
        it ("succes", async () => {
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
            })
        })
    })
});
