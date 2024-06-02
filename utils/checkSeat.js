const createHttpError = require("http-errors");

const checkSeatAvailability = async (seats) => {
    let seatFound;
    let seatNumber;
    let isFound = true;
    let isBooked = false;
    console.log(seats);

    if (seats.length <= 0) {
        return (isFound = false);
    }

    await seats.forEach((seat) => {
        if (seat.isBooked === true) {
            seatNumber = seat.seatNumber;

            return (isBooked = true);
        }
    });

    return { isFound, seatFound, isBooked, seatNumber };
};

module.exports = { checkSeatAvailability };
