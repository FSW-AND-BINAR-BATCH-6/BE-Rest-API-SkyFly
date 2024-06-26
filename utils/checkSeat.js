const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const checkSeatAvailability = async (seats, flightId, passengers) => {
    let seatNumber = [];
    let error = {
        flight: false,
        seat: false,
        booked: false,
    };
    let countPassengerSeat = passengers.map((passenger) => passenger.seatId);

    const flight = await prisma.flight.findUnique({
        where: {
            id: flightId,
        },
    });

    if (!flight) {
        error.flight = true;
    }

    if (countPassengerSeat.length !== seats.length) {
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
