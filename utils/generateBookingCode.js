const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const generateBookingCode = async (passengers) => {
    // [start] booking code
    let bookingCode;

    const dataCode = await prisma.flightSeat.findMany({
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

    dataCode.map((data) => {
        bookingCode = `${data.flight.plane.code}-${
            Math.floor(Math.random() * 100000) + 1 + 1
        }`;
    });
    // [end] booking cod

    return bookingCode;
};

module.exports = { generateBookingCode };
