const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const checkSeatAvailability = async (seats, flightId) => {
    let seatNumber = [];
    let flightIsFound = true;
    let seatIsFound = true;
    let isBooked = false;

    const flight = await prisma.flight.findUnique({
        where: {
            id: flightId,
        },
    });

    if (!flight) {
        console.log(`masuk flight: ${flight}`);
        flightIsFound = false;
    }

    if (seats.length <= 0) {
        console.log(`masuk seat: ${seats.length}`);
        seatIsFound = false;
    }

    await seats.forEach((seat) => {
        if (seat.isBooked === true) {
            seatNumber.push(seat.seatNumber);
            isBooked = true;
        }
    });

    return { seatIsFound, flightIsFound, isBooked, seatNumber };
};

module.exports = { checkSeatAvailability };
