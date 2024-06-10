const { PrismaClient } = require("@prisma/client");
const createHttpError = require("http-errors");

const prisma = new PrismaClient();

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

        res.status(200).json({
            status: true,
            message: "All seat flights retrieved successfully",
            totalItems: count,
            pagination: {
                totalPage: Math.ceil(count / limit),
                currentPage: page,
                pageItems: seats.length,
                nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null,
            },
            data: seats.length !== 0 ? seats : "No flight seats data found",
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

        console.log(flightId);

        const flight = await prisma.flight.findUnique({
            where: {
                id: flightId,
            },
        });

        if (!flight) {
            return next(
                createHttpError(404, {
                    message: "flight is not found",
                })
            );
        }

        const seats = await prisma.flightSeat.findMany({
            where: { flightId },
            skip: offset,
            take: limit,
        });

        const count = await prisma.flightSeat.count({ where: { flightId } });

        res.status(200).json({
            status: true,
            message: "Seats retrieved successfully",
            totalItems: count,
            pagination: {
                totalPage: Math.ceil(count / limit),
                currentPage: page,
                pageItems: seats.length,
                nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null,
            },
            data: seats.length !== 0 ? seats : "No flight seats data found",
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
