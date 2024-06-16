const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const checkSeatAvailability = async (seats, flightId) => {
    let seatNumber = [];
    let error = {
        flight: false,
        seat: false,
        booked: false,
    };

    const flight = await prisma.flight.findUnique({
        where: {
            id: flightId,
        },
    });

    if (!flight) {
        error.flight = true;
    }

    if (seats.length <= 0) {
        error.seat = true;
    }

    await seats.forEach((seat) => {
        if (seat.status === "BOOKED" || seat.status === "OCCUPIED") {
            seatNumber.push(seat.seatNumber);
        }
    });

    if (seatNumber.length > 0) {
        error.booked = true;
    }

    return { error, seatNumber };
};

module.exports = { checkSeatAvailability };
