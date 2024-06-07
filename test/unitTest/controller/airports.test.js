const createHttpError = require("http-errors");
const airportController = require("../../../controllers/airport");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


jest.mock("@prisma/client", () => {
    const mPrismaClient = {
        airport: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

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
    describe("GetAllAirports", () => {
        it("Success", async () => {
            req = {
                query: {
                    page: "1",
                    limit: "10",
                },
            };

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
    });

    describe("GetAirportById", () => {
        it("Success", async () => {
            req = {
                params: {
                    id: 1,
                },
            };

            prisma.airport.findUnique.mockResolvedValue(airportDummyData);
            await airportController.getAirportById(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "All airports data retrieved successfully",
                data: airportDummyData,
            });
        });

        it("Failed, 404", async () => {
            req = {
                params: {
                    id: 1,
                },
            };
            prisma.airport.findUnique.mockResolvedValue(null);
            await airportController.getAirportById(req, res, next);
            expect(next).toHaveBeenCalledWith(createHttpError(404, { message: "Airport not found" }));
        });

        it("Failed, 500", async () => {
            const errorMessage = "Internal Server Error"
            prisma.airport.findUnique.mockRejectedValue(new Error(errorMessage))
            await airportController.getAirportById(req, res, next);
            expect(next).toHaveBeenCalledWith(createHttpError(500, {message: errorMessage}));
        })
    });

    afterEach(() => {
        jest.resetAllMocks();
    });
});
