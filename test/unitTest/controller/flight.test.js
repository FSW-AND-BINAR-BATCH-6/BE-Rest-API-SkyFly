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
            count: jest.fn(),
        },
        flightSeat: {
            deleteMany: jest.fn(),
            aggregate: jest.fn(),
        },
        ticket: {
            deleteMany: jest.fn(),
        },
        ticketTransactionDetail: {
            findMany: jest.fn(),
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

    describe("Flight Controller - getAllFlight", () => {
        let req, res, next;

        beforeEach(() => {
            req = {
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

        const inputFlightDummyData = [
            {
                planeId: "46b513e9-c33d-426a-9fac-6c7a07e0c870",
                departureDate: new Date("2024-06-06T13:00:00Z"),
                departureCity: "Jakarta",
                departureCityCode: "CGK",
                arrivalDate: new Date("2024-06-06T17:00:00Z"),
                destinationCity: "Bandung",
                destinationCityCode: "BDO",
                capacity: 72,
                price: 1000000,
            },
        ];

        const flightDummyData = [
            {
                id: "clxrh0w7u0011okfp4c4a0jni",
                planeId: "46b513e9-c33d-426a-9fac-6c7a07e0c870",
                plane: {
                    name: "Wings Air",
                    code: "IW",
                    image: "https://placehold.co/200x200",
                    terminal: "Terminal 1",
                },
                departureDate: "2024-06-01",
                departureTime: "08:00",
                code: "IW.UPG.SIN",
                departureAirport: {
                    id: "clxrh0uo60004okfpdbg501zy",
                    name: "Sultan Hasanuddin International Airport",
                    code: "UPG",
                    country: "Indonesia",
                    city: "Makassar",
                    continent: "Asia",
                    image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
                },
                transit: {
                    status: false,
                },
                arrivalDate: "2024-06-01",
                arrivalTime: "12:00",
                destinationAirport: {
                    id: "clxrh0uo6000cokfplkklkku8",
                    name: "Changi Airport",
                    code: "SIN",
                    country: "Singapore",
                    city: "Singapore",
                    continent: "Asia",
                    image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
                },
                capacity: 72,
                discount: null,
                price: 1500000,
                facilities: null,
                duration: "4h 0m",
                classInfo: [
                    {
                        seatClass: "ECONOMY",
                        seatPrice: 1500000,
                    },
                    {
                        seatClass: "BUSINESS",
                        seatPrice: null,
                    },
                    {
                        seatClass: "FIRST",
                        seatPrice: null,
                    },
                ],
            },
        ];

        it("should handle internal server error", async () => {
            prisma.flight.findMany.mockRejectedValueOnce(
                new Error("Internal Server Error")
            );

            await flightController.getAllFlight(req, res, next);

            expect(next).toHaveBeenCalledWith(
                createHttpError(500, { message: "Internal Server Error" })
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

    describe("Flight Controller - getFavoriteDestinations", () => {
        let req, res, next;

        beforeEach(() => {
            req = {
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

        it("should return favorite destinations successfully without continent filter", async () => {
            const ticketTransactionDetailsDummy = [
                {
                    flight: {
                        id: "FLT1",
                        departureAirport: {
                            city: "New York",
                        },
                        destinationAirport: {
                            city: "Moscow",
                            continent: "Europe",
                        },
                        departureDate: new Date("2024-06-16T13:09:51.064Z"),
                        arrivalDate: new Date("2024-06-16T13:09:51.064Z"),
                        plane: {
                            name: "Boeing 747",
                            image: "https://example.com/plane.png",
                        },
                        price: 500,
                        discount: 10,
                    },
                    transactionCount: 1,
                },
            ];

            prisma.ticketTransactionDetail.findMany.mockResolvedValue(
                ticketTransactionDetailsDummy
            );

            await flightController.getFavoriteDestinations(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("should return favorite destinations successfully with continent filter", async () => {
            req.query.continent = "Europe";

            const ticketTransactionDetailsDummy = [
                {
                    flight: {
                        id: "FLT1",
                        departureAirport: {
                            city: "New York",
                        },
                        destinationAirport: {
                            city: "Moscow",
                            continent: "Europe",
                        },
                        departureDate: new Date("2024-06-16T13:09:51.093Z"),
                        arrivalDate: new Date("2024-06-16T13:09:51.093Z"),
                        plane: {
                            name: "Boeing 747",
                            image: "https://example.com/plane.png",
                        },
                        price: 500,
                        discount: 10,
                    },
                    transactionCount: 1,
                },
            ];

            prisma.ticketTransactionDetail.findMany.mockResolvedValue(
                ticketTransactionDetailsDummy
            );

            await flightController.getFavoriteDestinations(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("should handle internal server error", async () => {
            const errorMessage = "Internal Server Error";
            prisma.ticketTransactionDetail.findMany.mockRejectedValueOnce(
                new Error(errorMessage)
            );

            await flightController.getFavoriteDestinations(req, res, next);

            expect(next).toHaveBeenCalledWith(
                createHttpError(500, { message: errorMessage })
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
