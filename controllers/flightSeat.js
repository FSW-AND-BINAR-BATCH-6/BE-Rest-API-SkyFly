const { PrismaClient } = require("@prisma/client");
const createHttpError = require("http-errors");
const fetch = require("node-fetch");

const prisma = new PrismaClient();

const getSeatStatus = async (seatId) => {
    const transactionDetail = await prisma.ticketTransactionDetail.findFirst({
        where: {
            seatId,
        },
        orderBy: {
            transaction: {
                bookingDate: "desc",
            },
        },
        include: {
            transaction: true,
        },
    });

    if (!transactionDetail || !transactionDetail.transaction) {
        return "available";
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
        return "available";
    }

    const { transaction_status } = transaction;

    switch (transaction_status) {
        case "pending":
            return "pending";
        case "settlement":
            return "settlement";
        default:
            return "available";
    }
};

const getAllSeats = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const seats = await prisma.flightSeat.findMany({
            skip: offset,
            take: limit,
        });

        const count = await prisma.flightSeat.count();

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

        const seats = await prisma.flightSeat.findMany({
            where: { flightId },
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

        const count = await prisma.flightSeat.count({ where: { flightId } });

        const seatsWithStatus = await Promise.all(
            seats.map(async (seat) => {
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

        await decreaseFlightCapacity(flightId);

        const newSeat = await prisma.flightSeat.create({
            data: {
                flightId,
                seatNumber,
                type,
                status: "AVAILABLE",
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
        const { seatNumber, status } = req.body;

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
