const createHttpError = require("http-errors");

const checkSeatAvailability = async (seats) => {
    let seatFound, isBooked, seatNumber;

    if (!seats) {
        seatFound = seats;
        return next(createHttpError(404, { message: "Seat not found" }));
    }

    await seats.forEach((seat) => {
        if (seat.isBooked === true) {
            seatNumber = seat.seatNumber;

            return (isBooked = true);
        }
    });

    return { seatFound, isBooked, seatNumber };
};

module.exports = { checkSeatAvailability };
