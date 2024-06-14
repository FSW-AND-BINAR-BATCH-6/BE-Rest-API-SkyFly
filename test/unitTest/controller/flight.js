const { PrismaClient } = require("@prisma/client");
const createHttpError = require("http-errors");
const flightController = require("../../../controllers/flight");
const prisma = new PrismaClient();

jest.mock("@prisma/client", () => {
    const mPrismaClient = {
        flight: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            groupBy: jest.fn(),
        },
        flightSeat: {
            deleteMany: jest.fn(),
        },
        ticket: {
            deleteMany: jest.fn(),
        },
        airport: {
            findUnique: jest.fn(),
        },
        airline: {
            findUnique: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

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

describe("Flight Controller", () => {
    let req, res, next;

    const flightDummyData = [
        {
            id: "KGB57",
            planeId: "plane1",
            departureDate: new Date(),
            code: "FLT1",
            departureAirport: {
                id: "B17",
                name: "Flying Fortress",
                code: "BBR",
                country: "America",
                city: "New York",
            },
            transit: null,
            arrivalDate: new Date(),
            destinationAirport: {
                id: "IS2",
                name: "Stalin",
                code: "HTD",
                country: "Russia",
                city: "Moskow",
            },
            capacity: 100,
            discount: 10,
            price: 500,
            facilities: "WiFi",
        },
    ];

    const airportDetailsDummy = {
        id: "abc123",
        name: "Flying Fortress",
        code: "B17",
        country: "America",
        city: "New York",
    };

    const airlineDummyData = {
        id: "GFL",
        code: "GA",
        name: "Garuda Indonesia",
        image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/1716536772224.png",
    };

    beforeEach(() => {
        req = {
            params: {},
            query: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("getAllFlight", () => {
        it("should return all flights successfully", async () => {
            const totalFlights = 1;

            prisma.flight.findMany.mockResolvedValue(flightDummyData);
            prisma.flight.count.mockResolvedValue(totalFlights);

            await flightController.getAllFlight(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "All flight data retrieved successfully",
                totalItems: totalFlights,
                pagination: {
                    totalPages: Math.ceil(totalFlights / 10),
                    currentPage: 1,
                    pageItems: flightDummyData.length,
                    nextPage: null,
                    prevPage: null,
                },
                data: flightDummyData.length
                    ? flightDummyData
                    : "No flight data found",
            });
        });

        it("should handle internal server error", async () => {
            await serverFailed(
                req,
                res,
                next,
                prisma.flight.findMany,
                flightController.getAllFlight
            );
        });
    });

    describe("getFlightById", () => {
        it("should handle flight not found", async () => {
            prisma.flight.findUnique.mockResolvedValue(null);

            req.params.id = "flight1";

            await flightController.getFlightById(req, res, next);

            expect(next).toHaveBeenCalledWith(
                createHttpError(404, { message: "Flight not found" })
            );
        });

        it("should handle internal server error", async () => {
            await serverFailed(
                req,
                res,
                next,
                prisma.flight.findUnique,
                flightController.getFlightById
            );
        });
    });

    describe("createFlight", () => {
        beforeEach(() => {
            req = {
                body: {
                    planeId: "GFL",
                    departureDate: "2024-06-02T09:00:00Z",
                    departureAirportId: "abc123",
                    transitArrivalDate: "2024-06-02T09:00:00Z",
                    transitDepartureDate: "2024-06-02T09:00:00Z",
                    transitAirportId: "abc123",
                    arrivalDate: "2024-06-02T09:00:00Z",
                    destinationAirportId: "abc1234",
                    capacity: 100,
                    discount: 10,
                    price: 500,
                    facilities: "WiFi",
                },
            };
        });

        it("should create flight successfully", async () => {
            prisma.airline.findUnique.mockResolvedValue(airlineDummyData);
            prisma.airport.findUnique.mockResolvedValue(airportDetailsDummy);
            prisma.flight.create.mockResolvedValue(flightDummyData[0]);

            await flightController.createFlight(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "Flight created successfully",
                data: flightDummyData[0],
            });
        });

        it("should handle invalid planeId or departureAirportId", async () => {
            prisma.airline.findUnique.mockResolvedValue(null);

            await flightController.createFlight(req, res, next);
            expect(prisma.flight.create).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                createHttpError(400, {
                    message: "Invalid planeId or departureAirportId",
                })
            );
        });

        it("should handle internal server error", async () => {
            await serverFailed(
                req,
                res,
                next,
                prisma.airline.findUnique,
                flightController.createFlight
            );
        });
    });

    describe("updateFlight", () => {
        beforeEach(() => {
            req = {
                body: {
                    planeId: "GFL",
                    departureDate: "2024-06-02T09:00:00Z",
                    departureAirportId: "abc123",
                    transitArrivalDate: "2024-06-02T09:00:00Z",
                    transitDepartureDate: "2024-06-02T09:00:00Z",
                    transitAirportId: "abc123",
                    arrivalDate: "2024-06-02T09:00:00Z",
                    destinationAirportId: "abc1234",
                    capacity: 100,
                    discount: 10,
                    price: 500,
                    facilities: "WiFi",
                },
                params: {
                    id: "flight1",
                },
            };
        });

        it("should update flight successfully", async () => {
            prisma.flight.findUnique.mockResolvedValue(flightDummyData[0]);
            prisma.flight.update.mockResolvedValue(flightDummyData[0]);

            await flightController.updateFlight(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "Flight updated successfully",
                data: {
                    beforeUpdate: flightDummyData[0],
                    afterUpdate: flightDummyData[0],
                },
            });
        });

        it("should handle flight not found", async () => {
            prisma.flight.findUnique.mockResolvedValue(null);

            await flightController.updateFlight(req, res, next);
            expect(prisma.flight.update).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                createHttpError(404, { message: "Flight Not Found" })
            );
        });

        it("should handle internal server error", async () => {
            await serverFailed(
                req,
                res,
                next,
                prisma.flight.findUnique,
                flightController.updateFlight
            );
        });
    });

    describe("getFavoriteDestinations", () => {
        it("should return favorite destinations successfully", async () => {
            const favoriteDestinationsDummy = [
                {
                    destinationAirportId: "airport1",
                    _count: { ticketTransactionDetail: 10 },
                },
                {
                    destinationAirportId: "airport2",
                    _count: { ticketTransactionDetail: 8 },
                },
            ];

            prisma.flight.groupBy.mockResolvedValue(favoriteDestinationsDummy);
            prisma.airport.findUnique.mockResolvedValue(airportDetailsDummy);

            await flightController.getFavoriteDestinations(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "Favorite destinations retrieved successfully",
                data: [
                    { airport: airportDetailsDummy, transactionCount: 10 },
                    { airport: airportDetailsDummy, transactionCount: 8 },
                ],
            });
        });

        it("should handle internal server error", async () => {
            await serverFailed(
                req,
                res,
                next,
                prisma.flight.groupBy,
                flightController.getFavoriteDestinations
            );
        });
    });

    describe("removeFlight", () => {
        it("should delete flight successfully", async () => {
            const flightDummy = {
                id: "flight1",
                seats: [{ id: "seat1" }],
                tickets: [{ id: "ticket1" }],
            };
            const deletedFlightDummy = { id: "flight1", planeId: "plane1" };

            prisma.flight.findUnique.mockResolvedValue(flightDummy);
            prisma.ticket.deleteMany.mockResolvedValue({ count: 1 });
            prisma.flightSeat.deleteMany.mockResolvedValue({ count: 1 });
            prisma.flight.delete.mockResolvedValue(deletedFlightDummy);

            req.params.id = "flight1";

            await flightController.removeFlight(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "Flight deleted successfully",
                deletedData: deletedFlightDummy,
            });
        });

        it("should handle flight not found", async () => {
            prisma.flight.findUnique.mockResolvedValue(null);

            req.params.id = "flight1";

            await flightController.removeFlight(req, res, next);

            expect(next).toHaveBeenCalledWith(
                createHttpError(409, { message: "Flight Not Found" })
            );
        });

        it("should handle internal server error", async () => {
            await serverFailed(
                req,
                res,
                next,
                prisma.flight.findUnique,
                flightController.removeFlight
            );
        });
    });
});
