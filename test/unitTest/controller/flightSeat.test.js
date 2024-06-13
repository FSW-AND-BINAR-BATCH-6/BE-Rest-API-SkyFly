const { PrismaClient } = require("@prisma/client");
const createHttpError = require("http-errors");
const seatsController = require("../../../controllers/flightSeat");
const prisma = PrismaClient();

jest.mock("@prisma/client", () => {
    const mPrismaClient = {
        flightSeat: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            create: jest.fn(),
        },
        flight: {
            findUnique: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
        },
        ticketTransactionDetail: {
            findFirst: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

describe("FlighSeats API", () => {
    const seatsDummyData = [
        {
            id: "seatsId",
            flightId: "KGB57",
            seatNumber: "1A",
            status: "AVAILABLE",
            type: "ECONOMY",
        },
    ];

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

    describe("getAllSeats", () => {
        beforeEach(() => {
            req = { query: {} };
        });

        it("Success", async () => {
            prisma.flightSeat.findMany.mockResolvedValue(seatsDummyData);
            prisma.ticketTransactionDetail.findFirst.mockResolvedValue(null);
            prisma.flightSeat.count.mockResolvedValue(1);
            await seatsController.getAllSeats(req, res, next);
            expect(prisma.flightSeat.findMany).toHaveBeenCalledWith({
                skip: 0,
                take: 10,
            });
            expect(prisma.flightSeat.count).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "All seat flights retrieved successfully",
                totalItems: 1,
                pagination: {
                    totalPage: 1,
                    currentPage: 1,
                    pageItems: 1,
                    nextPage: null,
                    prevPage: null,
                },
                data: [
                    {
                        id: "seatsId",
                        flightId: "KGB57",
                        seatNumber: "1A",
                        status: "available",
                        type: "ECONOMY",
                    },
                ],
            });
        });

        it("internal server error", async () => {
            prisma.flightSeat.findMany.mockRejectedValue(
                new Error("Internal server error")
            );
            await seatsController.getAllSeats(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(500, { message: "Internal server error" })
            );
        });
    });

    describe("getSeatsByFlightId", () => {
        beforeEach(() => {
            req = {
                query: {},
                params: {
                    flightId: "flightId",
                },
            };
        });

        it("Success", async () => {
            prisma.flight.findUnique.mockResolvedValue(flightDummyData);
            prisma.flightSeat.findMany.mockResolvedValue(seatsDummyData);
            prisma.flightSeat.count.mockResolvedValue(1);

            await seatsController.getSeatsByFlightId(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("Internal server error", async () => {
            prisma.flightSeat.findMany.mockRejectedValue(
                new Error("Internal server error")
            );
            await seatsController.getSeatsByFlightId(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(500, { message: "Internal server error" })
            );
        });
    });

    describe("createSeat", () => {
        beforeEach(() => {
            req = {
                body: {
                    flightId: "KGB57",
                    seatNumber: "1A",
                    type: "ECONOMY",
                },
            };
        });

        it("Success", async () => {
            prisma.flight.update.mockResolvedValue(flightDummyData);
            prisma.flightSeat.create.mockResolvedValue(flightDummyData);
            await seatsController.createSeat(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it("Internal server error", async () => {
            prisma.flight.update.mockRejectedValue(
                new Error("Internal server error")
            );
            await seatsController.createSeat(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(500, { message: "Internal server error" })
            );
        });
    });

    describe("updateSeat", () => {
        beforeEach(() => {
            req = {
                params: {
                    id: "seatsId",
                },
                body: {
                    seatNumber: "1A",
                    status: "AVAILABLE",
                },
            };
        });

        it("Success", async () => {
            prisma.flightSeat.findUnique.mockResolvedValue(seatsDummyData);
            prisma.flightSeat.update.mockResolvedValue(seatsDummyData);
            await seatsController.updateSeat(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("Internal server failed", async () => {
            prisma.flightSeat.findUnique.mockRejectedValue(
                new Error("Internal server error")
            );
            await seatsController.updateSeat(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(500, { message: "Internal server error" })
            );
        });
    });

    describe("deleteSeat", () => {
        beforeEach(() => {
            req = {
                params: {
                    id: "seatsId",
                },
            };
        });

        it("Success", async () => {
            prisma.flightSeat.findUnique.mockResolvedValue(seatsDummyData);
            prisma.flight.update.mockResolvedValue(flightDummyData);
            prisma.flightSeat.delete.mockResolvedValue({ id: "seatsId" });

            await seatsController.deleteSeat(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("Internal server error", async () => {
            prisma.flightSeat.findUnique.mockRejectedValue(new Error("Internal server error"))
            await seatsController.deleteSeat(req, res, next);
            expect(next).toHaveBeenCalledWith(createHttpError(500, {message: "Internal server error"}));
        })
    });
});
