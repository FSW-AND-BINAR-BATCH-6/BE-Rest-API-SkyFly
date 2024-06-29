const { PrismaClient } = require("@prisma/client");
const createHttpError = require("http-errors");
const fetch = require("node-fetch");

const prisma = new PrismaClient();

const getSeatStatus = async (seatId) => {
    // Check the seat status from the flightSeat table first
    const seat = await prisma.flightSeat.findUnique({
        where: { id: seatId },
    });

    if (!seat) {
        throw new Error(`Seat with ID ${seatId} not found`);
    }

    // Return the status directly if it's BOOKED or OCCUPIED
    if (seat.status === "BOOKED" || seat.status === "OCCUPIED") {
        return seat.status; // convert to lowercase to match response format
    }

    // Otherwise, check the transaction details
    const transactionDetail = await prisma.ticketTransactionDetail.findFirst({
        where: { seatId },
        orderBy: {
            transaction: { bookingDate: "desc" },
        },
        include: { transaction: true },
    });

    if (!transactionDetail || !transactionDetail.transaction) {
        return "AVAILABLE";
    }

    const { orderId } = transactionDetail.transaction;

    const encodedServerKey = Buffer.from(
        `${process.env.SANDBOX_SERVER_KEY}:`
    ).toString("base64");
    const url = `https://api.sandbox.midtrans.com/v2/${orderId}/status`;
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            authorization: `Basic ${encodedServerKey}`,
        },
    };

    const response = await fetch(url, options);
    const transaction = await response.json();

    if (transaction.status_code === "404") {
        return "AVAILABLE";
    }

    const { transaction_status } = transaction;

    switch (transaction_status) {
        case "pending":
            return "OCCUPIED";
        case "settlement":
        case "capture":
        case "success":
            return "BOOKED";
        case "cancel":
        case "deny":
        case "expire":
        case "failure":
        default:
            return "AVAILABLE";
    }
};

const getAllSeats = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const type = req.query.type || null;

        const where = type ? { type } : {};

        const seats = await prisma.flightSeat.findMany({
            where,
            skip: offset,
            take: limit,
        });

        const count = await prisma.flightSeat.count({ where });

        const seatsWithStatus = await Promise.all(
            seats.map(async (seat) => {
                const status = await getSeatStatus(seat.id);
                return { ...seat, status };
            })
        );

        res.status(200).json({
            status: true,
            message: "All seat flights retrieved successfully",
            totalItems: count,
            pagination: {
                totalPage: Math.ceil(count / limit),
                currentPage: page,
                pageItems: seatsWithStatus.length,
                nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null,
            },
            data: seatsWithStatus,
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const getSeatsByFlightId = async (req, res, next) => {
    try {
        const { flightId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const type = req.query.type || null;

        const where = { flightId };
        if (type) {
            where.type = type;
        }

        const seats = await prisma.flightSeat.findMany({
            where,
            skip: offset,
            take: limit,
        });

        if (!seats.length) {
            return next(
                createHttpError(404, {
                    message: "Seats not found for the given flight ID",
                })
            );
        }

        const count = await prisma.flightSeat.count({ where });

        const sortedSeats = seats.sort((a, b) => {
            const [aRow, aCol] = a.seatNumber.match(/(\d+)([A-Z])/).slice(1, 3);
            const [bRow, bCol] = b.seatNumber.match(/(\d+)([A-Z])/).slice(1, 3);
            const rowDiff = parseInt(aRow) - parseInt(bRow);
            if (rowDiff !== 0) {
                return rowDiff;
            }
            return aCol.localeCompare(bCol);
        });

        const seatsWithStatus = await Promise.all(
            sortedSeats.map(async (seat) => {
                const status = await getSeatStatus(seat.id);
                return { ...seat, status };
            })
        );

        res.status(200).json({
            status: true,
            message: "Seats retrieved successfully",
            totalItems: count,
            pagination: {
                totalPage: Math.ceil(count / limit),
                currentPage: page,
                pageItems: seatsWithStatus.length,
                nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null,
            },
            data: seatsWithStatus,
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const decreaseFlightCapacity = async (flightId) => {
    await prisma.flight.update({
        where: { id: flightId },
        data: {
            capacity: {
                decrement: 1,
            },
        },
    });
};

const increaseFlightCapacity = async (flightId) => {
    await prisma.flight.update({
        where: { id: flightId },
        data: {
            capacity: {
                increment: 1,
            },
        },
    });
};

const createSeat = async (req, res, next) => {
    try {
        const { flightId, seatNumber, type } = req.body;

        const existingSeat = await prisma.flightSeat.findFirst({
            where: {
                flightId,
                seatNumber,
            },
        });

        if (existingSeat) {
            return next(
                createHttpError(400, {
                    message: "Seat number already exists for this flight",
                })
            );
        }

        const flight = await prisma.flight.findUnique({
            where: { id: flightId },
        });

        if (!flight) {
            return next(createHttpError(404, { message: "Flight not found" }));
        }

        let price = flight.price;
        if (type === "BUSINESS") {
            price *= 1.5;
        } else if (type === "FIRST") {
            price *= 2;
        }

        await decreaseFlightCapacity(flightId);

        const newSeat = await prisma.flightSeat.create({
            data: {
                flightId,
                seatNumber,
                type,
                status: "AVAILABLE",
                price,
            },
        });

        res.status(201).json({
            status: true,
            message: "Seat created successfully",
            data: newSeat,
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const updateSeat = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { seatNumber, status, type } = req.body;

        const seat = await prisma.flightSeat.findUnique({
            where: { id },
        });

        if (!seat) {
            return next(createHttpError(404, { message: "Seat not found" }));
        }

        const updatedSeat = await prisma.flightSeat.update({
            where: { id },
            data: {
                seatNumber,
                status,
                type,
            },
        });

        res.status(200).json({
            status: true,
            message: "Seat updated successfully",
            data: updatedSeat,
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const deleteSeat = async (req, res, next) => {
    try {
        const { id } = req.params;

        const seat = await prisma.flightSeat.findUnique({
            where: { id },
        });

        if (!seat) {
            return next(createHttpError(404, { message: "Seat not found" }));
        }

        const { flightId } = seat;

        await increaseFlightCapacity(flightId);

        await prisma.flightSeat.delete({
            where: { id },
        });

        res.status(200).json({
            status: true,
            message: "Seat deleted successfully",
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

module.exports = {
    getAllSeats,
    getSeatsByFlightId,
    createSeat,
    updateSeat,
    deleteSeat,
};
