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
                    continent: "North America",
                },
                transit: null,
                arrivalDate: new Date(),
                destinationAirport: {
                    id: "IS2",
                    name: "Stalin",
                    code: "HTD",
                    country: "Russia",
                    city: "Moscow",
                    continent: "Europe",
                },
                capacity: 100,
                discount: 10,
                price: 500,
                facilities: "WiFi",
                seats: [
                    { type: "ECONOMY", price: 500, status: "AVAILABLE" },
                    { type: "BUSINESS", price: 1000, status: "AVAILABLE" },
                ],
                plane: {
                    name: "Boeing 747",
                    code: "B747",
                    image: "https://example.com/plane.png",
                },
            },
        ];

        it("should return all flights successfully with price ranges", async () => {
            const totalFlights = 1;

            prisma.flight.findMany.mockResolvedValue(flightDummyData);
            prisma.flight.count.mockResolvedValue(totalFlights);

            prisma.flightSeat.aggregate
                .mockResolvedValueOnce({
                    _min: { price: 300 },
                    _max: { price: 800 },
                })
                .mockResolvedValueOnce({
                    _min: { price: 900 },
                    _max: { price: 1500 },
                })
                .mockResolvedValueOnce({
                    _min: { price: 2000 },
                    _max: { price: 2500 },
                });

            await flightController.getAllFlight(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "All flight data retrieved successfully",
                priceRanges: {
                    ECONOMY: {
                        minPrice: "300",
                        maxPrice: "800",
                    },
                    BUSINESS: {
                        minPrice: "900",
                        maxPrice: "1,500",
                    },
                    FIRST: {
                        minPrice: "2,000",
                        maxPrice: "2,500",
                    },
                },
                totalItems: totalFlights,
                pagination: {
                    totalPages: Math.ceil(totalFlights / 10),
                    currentPage: 1,
                    pageItems: flightDummyData.length,
                    nextPage: null,
                    prevPage: null,
                },
                data: flightDummyData.map((flight) => ({
                    id: flight.id,
                    planeId: flight.planeId,
                    plane: {
                        name: flight.plane.name,
                        code: flight.plane.code,
                        image: flight.plane.image,
                    },
                    departureDate: flight.departureDate,
                    code: flight.code,
                    departureAirport: {
                        id: flight.departureAirport.id,
                        name: flight.departureAirport.name,
                        code: flight.departureAirport.code,
                        country: flight.departureAirport.country,
                        city: flight.departureAirport.city,
                        continent: flight.departureAirport.continent,
                    },
                    transit: flight.transit
                        ? {
                            arrivalDate: flight.transitArrivalDate,
                            departureDate: flight.transitDepartureDate,
                            transitAirport: {
                                id: flight.transitAirport.id,
                                name: flight.transitAirport.name,
                                code: flight.transitAirport.code,
                                country: flight.transitAirport.country,
                                city: flight.transitAirport.city,
                                continent: flight.transitAirport.continent,
                            },
                        }
                        : null,
                    arrivalDate: flight.arrivalDate,
                    destinationAirport: {
                        id: flight.destinationAirport.id,
                        name: flight.destinationAirport.name,
                        code: flight.destinationAirport.code,
                        country: flight.destinationAirport.country,
                        city: flight.destinationAirport.city,
                        continent: flight.destinationAirport.continent,
                    },
                    capacity: flight.capacity,
                    discount: flight.discount,
                    price: flight.price,
                    facilities: flight.facilities,
                    duration: "0h 0m",
                    seatClasses: ["ECONOMY", "BUSINESS"],
                    prices: {
                        ECONOMY: 500,
                        BUSINESS: 1000,
                    },
                })),
            });
        });

        it("should handle internal server error", async () => {
            prisma.flight.findMany.mockRejectedValueOnce(new Error("Internal Server Error"));

            await flightController.getAllFlight(req, res, next);

            expect(next).toHaveBeenCalledWith(createHttpError(500, { message: "Internal Server Error" }));
        });
    });

    it("should return flight details successfully", async () => {
        const flightData = {
            id: "flight1",
            planeId: "plane1",
            departureDate: new Date(),
            code: "FLT1",
            departureAirport: {
                id: "depAirport1",
                name: "Departure Airport",
                code: "DEP",
                country: "Country A",
                city: "City A",
                continent: "Continent A",
            },
            transit: null, 
            destinationAirport: {
                id: "destAirport1",
                name: "Destination Airport",
                code: "DES",
                country: "Country C",
                city: "City C",
                continent: "Continent C",
            },
            seats: [
                { id: "seat1", type: "ECONOMY", price: 100 },
                { id: "seat2", type: "BUSINESS", price: 200 },
            ],
            plane: {
                id: "plane1",
                name: "Plane 1",
                code: "PL1",
                image: "https://example.com/plane.png",
            },
            arrivalDate: new Date(),
            capacity: 200,
            discount: 10,
            price: 150,
            facilities: "WiFi",
            duration: "0h 0m", 
            prices: {
                ECONOMY: 100,
                BUSINESS: 200,
            },
            seatClasses: ["ECONOMY", "BUSINESS"],
        };
    
        prisma.flight.findUnique.mockResolvedValue(flightData);
    
        req.params.id = "flight1";
    
        await flightController.getFlightById(req, res, next);
    
        expect(prisma.flight.findUnique).toHaveBeenCalledWith({
            where: { id: "flight1" },
            include: {
                departureAirport: true,
                transitAirport: true,
                destinationAirport: true,
                seats: true,
                plane: true,
            },
        });
    
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            status: true,
            message: "Flight data retrieved successfully",
            data: {
                id: "flight1",
                planeId: "plane1",
                plane: {
                    name: "Plane 1",
                    code: "PL1",
                    image: "https://example.com/plane.png",
                },
                departureDate: flightData.departureDate,
                code: "FLT1",
                departureAirport: {
                    id: "depAirport1",
                    name: "Departure Airport",
                    code: "DEP",
                    country: "Country A",
                    city: "City A",
                    continent: "Continent A",
                },
                transit: null, 
                arrivalDate: flightData.arrivalDate,
                destinationAirport: {
                    id: "destAirport1",
                    name: "Destination Airport",
                    code: "DES",
                    country: "Country C",
                    city: "City C",
                    continent: "Continent C",
                },
                capacity: 200,
                discount: 10,
                price: 150,
                facilities: "WiFi",
                duration: "0h 0m", 
                seatClasses: ["ECONOMY", "BUSINESS"],
                prices: {
                    ECONOMY: 100,
                    BUSINESS: 200,
                },
            },
        });
        
        expect(next).not.toHaveBeenCalled();
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

            prisma.ticketTransactionDetail.findMany.mockResolvedValue(ticketTransactionDetailsDummy);

            await flightController.getFavoriteDestinations(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "Favorite destinations retrieved successfully",
                data: [
                    {
                        flightDetails: {
                            flightId: "FLT1",
                            from: {
                                departureCity: "New York",
                                departureDate: new Date("2024-06-16T13:09:51.064Z"),
                            },
                            to: {
                                arrivalCity: "Moscow",
                                arrivalDate: new Date("2024-06-16T13:09:51.064Z"),
                                continent: "Europe",
                            },
                            plane: {
                                airline: "Boeing 747",
                                price: 500,
                                discount: 10,
                                image: "https://example.com/plane.png",
                            },
                            transactionCount: 1,
                        },
                    },
                ],
            });
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

            prisma.ticketTransactionDetail.findMany.mockResolvedValue(ticketTransactionDetailsDummy);

            await flightController.getFavoriteDestinations(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "Favorite destinations retrieved successfully",
                data: [
                    {
                        flightDetails: {
                            flightId: "FLT1",
                            from: {
                                departureCity: "New York",
                                departureDate: new Date("2024-06-16T13:09:51.093Z"),
                            },
                            to: {
                                arrivalCity: "Moscow",
                                arrivalDate: new Date("2024-06-16T13:09:51.093Z"),
                                continent: "Europe",
                            },
                            plane: {
                                airline: "Boeing 747",
                                price: 500,
                                discount: 10,
                                image: "https://example.com/plane.png",
                            },
                            transactionCount: 1,
                        },
                    },
                ],
            });
        });

        it("should handle internal server error", async () => {
            const errorMessage = "Internal Server Error";
            prisma.ticketTransactionDetail.findMany.mockRejectedValueOnce(new Error(errorMessage));

            await flightController.getFavoriteDestinations(req, res, next);

            expect(next).toHaveBeenCalledWith(createHttpError(500, { message: errorMessage }));
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
