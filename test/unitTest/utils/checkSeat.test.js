const { checkSeatAvailability } = require("../../../utils/checkSeat");
const { PrismaClient } = require("@prisma/client");

jest.mock("@prisma/client", () => {
    const mPrismaClient = {
        flight: {
            findUnique: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

describe("checkSeatAvailability", () => {
    let prisma;
    let passengers = [
        {
            id: "7e9ea4a0-a685-4826-8204-3fc261ac44d5",
            title: "Mr.",
            name: "Mr. Mischa",
            fullName: "Mischa",
            passport: "passport nih",
            dob: "2002-05-20T10:00:30.000Z",
            validityPeriod: "2024-07-20T10:00:30.000Z",
            type: "ADULT",
            familyName: "Purwanto",
            citizenship: "Inggris",
            issuingCountry: "Ukraine",
            price: 1030,
            normalPrice: 1000,
            quantity: 1,
            seatId: "clxrh3ags047tokfpcpf4wjkb",
        },
        {
            id: "38bd4013-4240-40bc-a5a7-8f03b3c1105b",
            title: "Mr.",
            name: "Mr. Asep",
            fullName: "Asep",
            passport: null,
            dob: "2002-05-20T10:00:30.000Z",
            validityPeriod: null,
            type: "INFRANT",
            familyName: "Purwanto",
            citizenship: "Inggris",
            issuingCountry: "Ukraine",
            price: 0,
            normalPrice: 0,
            quantity: 1,
            seatId: "clxrh3ahy0487okfp5mijjydi",
        },
        {
            id: "eb162e45-0ba8-438a-a315-141258100f8b",
            title: "Mr.",
            name: "Mr. Udin",
            fullName: "Udin",
            passport: null,
            dob: "2002-05-20T10:00:30.000Z",
            validityPeriod: null,
            type: "CHILD",
            familyName: "Purwanto",
            citizenship: "Inggris",
            issuingCountry: "Ukraine",
            price: 515,
            normalPrice: 500,
            quantity: 1,
            seatId: "clxrh3aj2048fokfp4qszgsth",
        },
    ];

    beforeEach(() => {
        prisma = new PrismaClient();
    });

    it("should return error if flight does not exist", async () => {
        prisma.flight.findUnique.mockResolvedValue(null);

        const result = await checkSeatAvailability([], "BF109", passengers);

        expect(result.error.flight).toBe(true);
        expect(result.error.seat).toBe(true);
        expect(result.error.booked).toBe(false);
        expect(result.seatNumber).toEqual([]);
    });

    it("should return error if no seats are provided", async () => {
        prisma.flight.findUnique.mockResolvedValue({ id: "BF109" });

        const result = await checkSeatAvailability([], "BF109", passengers);

        expect(result.error.flight).toBe(false);
        expect(result.error.seat).toBe(true);
        expect(result.error.booked).toBe(false);
        expect(result.seatNumber).toEqual([]);
    });

    // it("should return error if seats are booked or occupied", async () => {
    //     prisma.flight.findUnique.mockResolvedValue({ id: "BF109" });

    //     const seats = [
    //         { seatNumber: "1A", status: "BOOKED" },
    //         { seatNumber: "2B", status: "OCCUPIED" },
    //     ];

    //     const result = await checkSeatAvailability(seats, "BF109", passengers);

    //     expect(result.error.flight).toBe(false);
    //     expect(result.error.seat).toBe(false);
    //     expect(result.error.booked).toBe(true);
    //     expect(result.seatNumber).toEqual(["1A", "2B"]);
    // });

    // it("should return no errors if flight exists and seats are available", async () => {
    //     prisma.flight.findUnique.mockResolvedValue({ id: "BF109" });

    //     const seats = [
    //         { seatNumber: "1A", status: "AVAILABLE" },
    //         { seatNumber: "2B", status: "AVAILABLE" },
    //     ];

    //     const result = await checkSeatAvailability(seats, "BF109", passengers);

    //     expect(result.error.flight).toBe(false);
    //     expect(result.error.seat).toBe(false);
    //     expect(result.error.booked).toBe(false);
    //     expect(result.seatNumber).toEqual([]);
    // });
});
