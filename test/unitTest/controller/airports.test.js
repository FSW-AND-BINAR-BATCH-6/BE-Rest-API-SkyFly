const createHttpError = require("http-errors");
const airportController = require("../../../controllers/airport");
const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");
const prisma = new PrismaClient();
const { uploadFile } = require("../../../lib/supabase");


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

jest.mock("../../../lib/supabase", () => ({
    uploadFile: jest.fn(),
}));

jest.mock("crypto", () => ({
    randomUUID: jest.fn(),
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
                    name: "Flying Fortress"
                },
            };
        });

        it("Success", async () => {
            const totalItems = 1;

            prisma.airport.findMany.mockResolvedValue(airportDummyData);
            prisma.airport.count.mockResolvedValue(totalItems);

            await airportController.getAllAirports(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "All airports data retrieved successfully",
                totalItems,
                pagination: {
                    totalPage: 1,
                    currentPage: 1,
                    pageItems: 1,
                    nextPage: null,
                    prevPage: null,
                },
                data: airportDummyData,
            });
        });

        it("Success, without params", async () => {
            req.query = {
                showall: 'true'
            }
            const totalItems = 1;

            prisma.airport.findMany.mockResolvedValue(airportDummyData);
            prisma.airport.count.mockResolvedValue(totalItems);

            await airportController.getAllAirports(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "All airports data retrieved successfully",
                totalItems,
                pagination: null,
                data: airportDummyData,
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

        it("Success", async () => {
            prisma.airport.findUnique.mockResolvedValue(airportDummyData[0]);
            await airportController.getAirportById(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "All airports data retrieved successfully",
                data: airportDummyData[0],
            });
        });

        it("Failed, 404", async () => {
            prisma.airport.findUnique.mockResolvedValue(null);
            await airportController.getAirportById(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(404, { message: "Airport not found" })
            );
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
                    message:
                        "Airport with code: AHR already exist!",
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

        const body = {
            id: "Porche",
            name: "Ferdinand",
            code: "AHR",
            country: "German",
            city: "Berlin",
        };

        it("Success", async () => {
            prisma.airport.findUnique.mockResolvedValue(body);
            prisma.airport.update.mockResolvedValue(body);

            await airportController.updateAirport(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "Airport updated successfully",
                data: body,
            });
        });

        it("Failed, 404", async () => {
            prisma.airport.findUnique.mockResolvedValue(null);
            await airportController.updateAirport(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(404, { message: "Airport not found" })
            );
            expect(prisma.airport.update).not.toHaveBeenCalled();
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

        const body = {
            id: "Porche",
            name: "Ferdinand",
            code: "AHR",
            country: "German",
            city: "Berlin",
        };

        it("Success", async () => {
            prisma.airport.findFirst.mockResolvedValue(body);
            prisma.airport.delete.mockResolvedValue({ id: "Porche" });

            await airportController.deleteAirport(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "Airport deleted successfully",
            });
        });

        it("Failed, 404", async () => {
            prisma.airport.delete.mockResolvedValue(null);
            await airportController.deleteAirport(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(404, { message: "Airport not found" })
            );
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
