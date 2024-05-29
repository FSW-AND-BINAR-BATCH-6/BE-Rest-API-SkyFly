const { PrismaClient } = require("@prisma/client");
const createHttpError = require("http-errors");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

const getAllTicket = async (req, res, next) => {
    try {
        const search = req.query.search || "";
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const tickets = await prisma.ticket.findMany({
            select: {
                id: true,
                code: true,
                bookingDate: true,
                flight: {
                    select: {
                        id: true,
                        departureDate: true,
                        departureCity: true,
                        arrivalDate: true,
                        destinationCity: true,
                        price: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true,
                    },
                },
                seat: {
                    select: {
                        id: true,
                        seatNumber: true,
                        type: true,
                    },
                },
            },
            where: {
                code: {
                    contains: search,
                },
            },
            orderBy: {
                id: "asc",
            },
            skip: offset,
            take: limit,
        });

        const count = await prisma.ticket.count({
            where: {
                code: {
                    contains: search,
                },
            },
        });

        res.status(200).json({
            status: true,
            totalItems: count,
            pagination: {
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                pageItems: tickets.length,
                nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null,
            },
            data: tickets.length !== 0 ? tickets : "empty ticket data",
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const getTicketById = async (req, res, next) => {
    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: req.params.id },
            include: {
                flight: {
                    select: {
                        id: true,
                        departureDate: true,
                        departureCity: true,
                        arrivalDate: true,
                        destinationCity: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                seat: {
                    select: {
                        id: true,
                        seatNumber: true,
                        type: true,
                    },
                },
            },
        });

        if (!ticket) {
            return next(createHttpError(404, { message: "Ticket not found" }));
        }
        res.status(200).json({
            status: true,
            message: "Ticket data retrieved successfully",
            data: ticket,
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const createTicket = async (req, res, next) => {
    const { flightId, userId, seatId, bookingDate } = req.body;

    // Generate RandomCode
    const generateRandomCode = (length) => {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let result = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }
        return result;
    };

    const codeRandom = generateRandomCode(6);
    try {
        // Check if the flight exists
        const flight = await prisma.flight.findUnique({
            where: { id: flightId },
        });
        if (!flight) {
            return next(createHttpError(404, { message: "Flight not found" }));
        }

        // Check if the USER exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return next(createHttpError(404, { message: "User not found" }));
        }

        // Check if the seat exists and is not booked
        const seat = await prisma.flightSeat.findUnique({
            where: { id: seatId },
        });
        if (!seat) {
            return next(createHttpError(404, { message: "Seat not found" }));
        }
        if (seat.isBooked) {
            return next(
                createHttpError(400, { message: "Seat is already booked" })
            );
        }

        // Create the new ticket
        const newTicket = await prisma.ticket.create({
            data: {
                code: codeRandom,
                flightId,
                userId,
                seatId,
                bookingDate,
            },

            include: {
                flight: true,
                user: true,
                seat: true,
            },
        });

        // Mark the seat as booked
        await prisma.flightSeat.update({
            where: { id: seatId },
            data: { isBooked: true },
        });

        res.status(201).json({
            status: true,
            message: "Ticket created successfully",
            data: newTicket,
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const updateTicket = async (req, res, next) => {
    const { code, flightId, userId, seatId, bookingDate } = req.body;

    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: req.params.id },
        });

        if (!ticket) {
            return next(createHttpError(404, { message: "Ticket not found" }));
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id: req.params.id },
            data: {
                code,
                flightId,
                userId,
                seatId,
                bookingDate,
            },
            include: {
                flight: true,
                user: true,
                seat: true,
            },
        });
        res.status(200).json({
            status: true,
            message: "Ticket updated successfully",
            data: updatedTicket,
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const deleteTicket = async (req, res, next) => {
    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: req.params.id },
        });

        if (!ticket) {
            return next(createHttpError(404, { message: "Ticket not found" }));
        }

        await prisma.ticket.delete({
            where: { id: req.params.id },
        });
        res.status(200).json({
            status: true,
            message: "Ticket deleted successfully",
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

module.exports = {
    getAllTicket,
    getTicketById,
    createTicket,
    updateTicket,
    deleteTicket,
};
