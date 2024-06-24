const { generateBookingCode } = require('../../../utils/generateBookingCode');
const { PrismaClient } = require('@prisma/client');

jest.mock('@prisma/client', () => {
    const mockPrismaClient = {
        flightSeat: {
            findMany: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mockPrismaClient),
    };
});

const prisma = new PrismaClient();

describe('generateBookingCode', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should generate a booking code based on plane code and random number', async () => {
        const mockData = [
            {
                id: 'seat1',
                flight: {
                    plane: {
                        code: 'ABC',
                    },
                },
            },
        ];

        prisma.flightSeat.findMany.mockResolvedValue(mockData);

        const passengers = [{ seatId: 'seat1' }];

        const bookingCode = await generateBookingCode(passengers);

        expect(bookingCode).toMatch(/^ABC-\d+$/);

        expect(prisma.flightSeat.findMany).toHaveBeenCalledWith({
            where: {
                id: {
                    in: passengers.map((passenger) => passenger.seatId),
                },
            },
            include: {
                flight: {
                    include: {
                        plane: true,
                    },
                },
            },
        });
    });

    it('should generate different booking codes for different passengers', async () => {
        const mockData1 = [
            {
                id: 'seat1',
                flight: {
                    plane: {
                        code: 'ABC',
                    },
                },
            },
        ];

        const mockData2 = [
            {
                id: 'seat2',
                flight: {
                    plane: {
                        code: 'XYZ',
                    },
                },
            },
        ];

        prisma.flightSeat.findMany
            .mockResolvedValueOnce(mockData1)
            .mockResolvedValueOnce(mockData2);

        const passengers1 = [{ seatId: 'seat1' }];
        const passengers2 = [{ seatId: 'seat2' }];

        const bookingCode1 = await generateBookingCode(passengers1);
        const bookingCode2 = await generateBookingCode(passengers2);

        expect(bookingCode1).toMatch(/^ABC-\d+$/);
        expect(bookingCode2).toMatch(/^XYZ-\d+$/);

        expect(prisma.flightSeat.findMany).toHaveBeenCalledWith({
            where: {
                id: {
                    in: passengers1.map((passenger) => passenger.seatId),
                },
            },
            include: {
                flight: {
                    include: {
                        plane: true,
                    },
                },
            },
        });

        expect(prisma.flightSeat.findMany).toHaveBeenCalledWith({
            where: {
                id: {
                    in: passengers2.map((passenger) => passenger.seatId),
                },
            },
            include: {
                flight: {
                    include: {
                        plane: true,
                    },
                },
            },
        });
    });
});
