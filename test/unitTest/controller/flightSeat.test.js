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
            findFirst: jest.fn(),
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

    const sortSeatDummyData = [
        {
            id: "seatsId",
            flightId: "KGB57",
            seatNumber: "1A",
            status: "AVAILABLE",
            type: "ECONOMY",
        },
        {
            id: "seatsId2",
            flightId: "KGB57",
            seatNumber: "2A",
            status: "AVAILABLE",
            type: "ECONOMY",
        },
        {
            id: "seatsId",
            flightId: "KGB57",
            seatNumber: "1C",
            status: "OCCUPIED",
            type: "BUSINESS",
        },
        {
            id: "seatsId3",
            flightId: "KGB57",
            seatNumber: "2B",
            status: "BOOKED",
            type: "FIRST",
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

    const testSeatsClass = async (req) => {
        res = {
            status: jest.fn().mockReturnThis(),
            jeson: jest.fn(),
        };
        next = jest.fn();

        prisma.flightSeat.findFirst.mockResolvedValue(null);
        prisma.flight.findUnique.mockResolvedValue(flightDummyData);
        prisma.flight.update.mockResolvedValue(flightDummyData);
        prisma.flightSeat.create.mockResolvedValue(flightDummyData);
        await seatsController.createSeat(req, res, next);
        expect(res.status).toHaveBeenCalledWith(201);
    };

    describe("getAllSeats", () => {
        beforeEach(() => {
            req = { query: {} };
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    json: () => Promise.resolve(MOCK_PRICES),
                })
            );
        });

        it("Success", async () => {
            prisma.flightSeat.findMany.mockResolvedValue(seatsDummyData);
            prisma.flightSeat.findUnique.mockResolvedValueOnce(seatsDummyData);
            prisma.ticketTransactionDetail.findFirst.mockResolvedValue(null);
            prisma.flightSeat.count.mockResolvedValue(1);
            await seatsController.getAllSeats(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
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
                query: {
                    type: "FIRST",
                },
                params: {
                    flightId: "flightId",
                },
            };
        });

        it("Success", async () => {
            prisma.flightSeat.findMany.mockResolvedValue(sortSeatDummyData);
            prisma.flightSeat.count.mockResolvedValue(2);
            prisma.flightSeat.findUnique.mockResolvedValue(sortSeatDummyData);
            prisma.ticketTransactionDetail.findFirst.mockResolvedValue(null);

            await seatsController.getSeatsByFlightId(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("Failed, 404", async () => {
            prisma.flightSeat.findMany.mockResolvedValue([]);
            await seatsController.getSeatsByFlightId(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(404, {
                    message: "Seats not found for the given flight ID",
                })
            );
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
            res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            next = jest.fn();
        });

        const reqClass = [
            {
                req: (req = {
                    body: {
                        flightId: "KGB57",
                        seatNumber: "1A",
                        type: "ECONOMY",
                    },
                }),
            },
            {
                req: (req = {
                    body: {
                        flightId: "KGB57",
                        seatNumber: "1A",
                        type: "BUSINESS",
                    },
                }),
            },
            {
                req: (req = {
                    body: {
                        flightId: "KGB57",
                        seatNumber: "1A",
                        type: "FIRST",
                    },
                }),
            },
        ];

        reqClass.forEach((test) => {
            testSeatsClass(test.req);
        });

        it("Failed, 400", async () => {
            prisma.flightSeat.findFirst.mockResolvedValue(seatsDummyData[0]);
            await seatsController.createSeat(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(400, {
                    message: "Seat number already exists for this flight",
                })
            );
        });

        it("Failed, 400", async () => {
            prisma.flightSeat.findFirst.mockResolvedValue(null);
            prisma.flight.findUnique.mockResolvedValue(null);
            await seatsController.createSeat(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(404, { message: "Flight not found" })
            );
        });

        it("Internal server error", async () => {
            prisma.flightSeat.findFirst.mockRejectedValue(
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

        it("Failed, 404 seat not found", async () => {
            prisma.flightSeat.findUnique.mockResolvedValue(null);
            await seatsController.updateSeat(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(404, { message: "Seat not found" })
            );
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

        it("Failed, 404 seat not found", async () => {
            prisma.flightSeat.findUnique.mockResolvedValue(null);
            await seatsController.deleteSeat(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(404, { message: "Seat not found" })
            );
        });

        it("Internal server error", async () => {
            prisma.flightSeat.findUnique.mockRejectedValue(
                new Error("Internal server error")
            );
            await seatsController.deleteSeat(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(500, { message: "Internal server error" })
            );
        });
    });
});
