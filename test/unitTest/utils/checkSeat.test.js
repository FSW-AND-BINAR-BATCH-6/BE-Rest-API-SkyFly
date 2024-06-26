const { checkSeatAvailability } = require("../../../utils/checkSeat");
const { PrismaClient } = require("@prisma/client");

jest.mock("@prisma/client", () => {
    const mPrismaClient = {
        flight: {
            findUnique: jest.fn()
        }
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient)
    };
});

describe("checkSeatAvailability", () => {
    let prisma;
    
    beforeEach(() => {
        prisma = new PrismaClient();
    });

    it("should return error if flight does not exist", async () => {
        prisma.flight.findUnique.mockResolvedValue(null);

        const result = await checkSeatAvailability([], "BF109");

        expect(result.error.flight).toBe(true);
        expect(result.error.seat).toBe(true);
        expect(result.error.booked).toBe(false);
        expect(result.seatNumber).toEqual([]);
    });

    it("should return error if no seats are provided", async () => {
        prisma.flight.findUnique.mockResolvedValue({ id: "BF109" });

        const result = await checkSeatAvailability([], "BF109");

        expect(result.error.flight).toBe(false);
        expect(result.error.seat).toBe(true);
        expect(result.error.booked).toBe(false);
        expect(result.seatNumber).toEqual([]);
    });

    it("should return error if seats are booked or occupied", async () => {
        prisma.flight.findUnique.mockResolvedValue({ id: "BF109" });

        const seats = [
            { seatNumber: "1A", status: "BOOKED" },
            { seatNumber: "2B", status: "OCCUPIED" }
        ];

        const result = await checkSeatAvailability(seats, "BF109");

        expect(result.error.flight).toBe(false);    
        expect(result.error.seat).toBe(false);
        expect(result.error.booked).toBe(true);
        expect(result.seatNumber).toEqual(["1A", "2B"]);
    });

    it("should return no errors if flight exists and seats are available", async () => {
        prisma.flight.findUnique.mockResolvedValue({ id: "BF109" });

        const seats = [
            { seatNumber: "1A", status: "AVAILABLE" },
            { seatNumber: "2B", status: "AVAILABLE" }
        ];

        const result = await checkSeatAvailability(seats, "BF109");

        expect(result.error.flight).toBe(false);
        expect(result.error.seat).toBe(false);
        expect(result.error.booked).toBe(false);
        expect(result.seatNumber).toEqual([]);
    });
});
