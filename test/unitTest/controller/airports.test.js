const createHttpError = require("http-errors");
const airportController = require("../../../controllers/airport");
const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");
const prisma = new PrismaClient();
const { unitTest } = require("./index");

jest.mock("@prisma/client", () => {
    const mPrismaClient = {
        airport: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findFirst: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

jest.mock("crypto", () => ({
    randomUUID: jest.fn(),
}));

jest.mock("../../../lib/supabase", () => ({
    uploadFile: jest.fn(),
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

describe("Airports API", () => {
    let req, res, next;

    const airportDummyData = [
        {
            id: "abc123",
            name: "Flying Fortress",
            code: "B17",
            country: "America",
            city: "New York",
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

    describe("GetAllAirports", () => {
        beforeEach(() => {
            req = {
                query: {
                    page: "1",
                    limit: "10",
                    code: "B17",
                    name: "Flying Fortress",
                },
            };
        });

        const getAllAirports = [
            {
                description: "success",
                prisma: [prisma.airport.findMany, prisma.airport.count],
                dummyData: [airportDummyData, 1],
                controller: airportController.getAllAirports,
                req: (req = {
                    query: {
                        page: "1",
                        limit: "10",
                        code: "B17",
                        name: "Flying Fortress",
                    },
                }),
                statusOutcome: { status: true },
                code: 200,
            },
            {
                description: "success",
                prisma: [prisma.airport.findMany],
                dummyData: [airportDummyData],
                controller: airportController.getAllAirports,
                req: (req = {
                    query: {
                        showall: "true",
                    },
                }),
                statusOutcome: { status: true },
                code: 200,
            },
        ];

        getAllAirports.forEach((test) => {
            it(test.description, async () => {
                await unitTest(
                    test.prisma,
                    test.controller,
                    test.dummyData,
                    test.req,
                    test.statusOutcome,
                    test.code,
                    null
                );
            });
        });

        it("Failed, 500", async () => {
            await serverFailed(
                req,
                res,
                next,
                prisma.airport.findMany,
                airportController.getAllAirports
            );
        });
    });

    describe("GetAirportById", () => {
        beforeEach(() => {
            req = {
                params: {
                    id: 1,
                },
            };
        });

        const getAirportById = [
            {
                description: "success",
                prisma: [prisma.airport.findUnique],
                dummyData: [airportDummyData],
                controller: airportController.getAirportById,
                req: (req = {
                    params: {
                        id: 1,
                    },
                }),
                statusOutcome: { status: true },
                code: 200,
            },
            {
                description: "success",
                prisma: [prisma.airport.findUnique],
                dummyData: [null],
                controller: airportController.getAirportById,
                req: (req = {
                    params: {
                        id: 1,
                    },
                }),
                statusOutcome: { status: false },
                code: 404,
                errorMessage: "Airport not found",
            },
        ];

        getAirportById.forEach((test) => {
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

        it("Failed, 500", async () => {
            await serverFailed(
                req,
                res,
                next,
                prisma.airport.findUnique,
                airportController.getAirportById
            );
        });
    });

    describe("CreateNewAirport", () => {
        beforeEach(() => {
            req = {
                body: {
                    name: "Ferdinand",
                    code: "AHR",
                    country: "German",
                    city: "Berlin",
                },
            };
        });

        const body = {
            id: "Porche",
            name: "Ferdinand",
            code: "AHR",
            country: "German",
            city: "Berlin",
        };

        it("Success", async () => {
            prisma.airport.findUnique.mockResolvedValue(null);
            prisma.airport.create.mockResolvedValue(body);
            randomUUID.mockReturnValue("Porche");

            await airportController.createNewAirport(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "Airport created successfully",
                data: body,
            });
        });

        it("Failed, 403", async () => {
            prisma.airport.findUnique.mockResolvedValue({ id: "Porche" });
            await airportController.createNewAirport(req, res, next);
            expect(prisma.airport.findUnique).toHaveBeenCalledWith({
                where: {
                    code: "AHR",
                },
            });
            expect(next).toHaveBeenCalledWith(
                createHttpError(403, {
                    message: "Airport with code: AHR already exist!",
                })
            );
            expect(prisma.airport.create).not.toHaveBeenCalled();
        });

        it("Failed, 500", async () => {
            await serverFailed(
                req,
                res,
                next,
                prisma.airport.findUnique,
                airportController.createNewAirport
            );
        });
    });

    describe("UpdateAirport", () => {
        beforeEach(() => {
            req = {
                body: {
                    name: "Ferdinand",
                    code: "AHR",
                    country: "German",
                    city: "Berlin",
                },
                params: {
                    id: "Porche",
                },
            };
        });

        const updateAirports = [
            {
                description: "success",
                prisma: [prisma.airport.findUnique, prisma.airport.update],
                dummyData: [airportDummyData[0], airportDummyData[0]],
                controller: airportController.updateAirport,
                req: (req = {
                    body: {
                        name: "Ferdinand",
                        code: "AHR",
                    },
                    params: {
                        id: "1",
                    },
                }),
                statusOutcome: { status: true },
                code: 201,
            },
            {
                description: "Failed",
                prisma: [prisma.airport.findUnique],
                dummyData: [null],
                controller: airportController.updateAirport,
                req: (req = {
                    body: {
                        name: "Ferdinand",
                        code: "AHR",
                    },
                    params: {
                        id: "1",
                    },
                }),
                statusOutcome: { status: false },
                code: 404,
                errorMessage: "Airport not found",
            },
        ];

        updateAirports.forEach((test) => {
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

        it("Failed, 500", async () => {
            await serverFailed(
                req,
                res,
                next,
                prisma.airport.findUnique,
                airportController.updateAirport
            );
        });
    });

    describe("DeleteAirport", () => {
        beforeEach(() => {
            req = {
                params: {
                    id: "Porche",
                },
            };
        });

        
        const deleteAirport = [
            {
                description: "success",
                prisma: [prisma.airport.findFirst, prisma.airport.delete],
                dummyData: [airportDummyData[0], true],
                controller: airportController.deleteAirport,
                req: (req = {
                    params: {
                        id: "Porche",
                    },
                }),
                statusOutcome: { status: true },
                code: 200,
            },
            {
                description: "success",
                prisma: [prisma.airport.findFirst],
                dummyData: [null],
                controller: airportController.deleteAirport,
                req: (req = {
                    params: {
                        id: "Porche",
                    },
                }),
                statusOutcome: { status: false },
                code: 404,
                errorMessage: "Airport not found",
            }
        ];

        deleteAirport.forEach((test) => {
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

        it("Failed, 500", async () => {
            await serverFailed(
                req,
                res,
                next,
                prisma.airport.findFirst,
                airportController.deleteAirport
            );
        });
    });
});
