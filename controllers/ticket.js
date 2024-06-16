const { PrismaClient } = require("@prisma/client");
const createHttpError = require("http-errors");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

const getAllTicket = async (req, res, next) => {
    try {
        const search = req.query.search || "";
        const code = req.query.code || "";
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const tickets = await prisma.ticket.findMany({
            select: {
                id: true,
                code: true,
                flight: {
                    select: {
                        id: true,
                        departureDate: true,
                        departureAirport: true,
                        arrivalDate: true,
                        destinationAirport: true,
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
                ticketTransaction: {
                    select: {
                        id: true,
                        orderId: true,
                        totalPrice: true,
                        status: true,
                        bookingDate: true,
                    },
                },
                ticketTransactionDetail: {
                    select: {
                        id: true,
                        transactionId: true,
                        price: true,
                        name: true,
                        familyName: true,
                        dob: true,
                        citizenship: true,
                        passport: true,
                        issuingCountry: true,
                        validityPeriod: true,
                        flightId: true,
                        seatId: true,
                    },
                },
            },
            where: {
                AND: [
                    { code: { contains: code } },
                    { code: { contains: search } },
                ],
            },
            orderBy: {
                id: "asc",
            },
            skip: offset,
            take: limit,
        });

        const count = await prisma.ticket.count({
            where: {
                AND: [
                    { code: { contains: code } },
                    { code: { contains: search } },
                ],
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
                        departureAirport: true,
                        arrivalDate: true,
                        destinationAirport: true,
                        price: true,
                        plane: true,
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
                ticketTransaction: {
                    select: {
                        id: true,
                        orderId: true,
                        totalPrice: true,
                        status: true,
                        bookingDate: true,
                    },
                },
                ticketTransactionDetail: {
                    select: {
                        id: true,
                        transactionId: true,
                        price: true,
                        name: true,
                        familyName: true,
                        dob: true,
                        citizenship: true,
                        passport: true,
                        issuingCountry: true,
                        validityPeriod: true,
                        flightId: true,
                        seatId: true,
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
    const { flightId, userId, seatId, transactionId, detailTransactionId } =
        req.body;

    try {
        // Check if the flight exists
        const flight = await prisma.flight.findUnique({
            where: { id: flightId },
            include: {
                plane: true,
                departureAirport: true,
            },
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

        const airlineCode = flight.plane.code;
        const airportCode = flight.departureAirport.code;
        const flightCode = flight.code;
        const seatNumber = seat.seatNumber;
        let uniqueCode = `${airlineCode}-${airportCode}-${flightCode}-${seatNumber}`;
        let isUnique = false;

        // Ensure the code is unique
        while (!isUnique) {
            const existingTicket = await prisma.ticket.findUnique({
                where: { code: uniqueCode },
            });

            if (existingTicket) {
                // Append a unique identifier to ensure uniqueness
                uniqueCode = `${airlineCode}-${airportCode}-${flightCode}-${seatNumber}-${uuidv4()}`;
            } else {
                isUnique = true;
            }
        }

        // Create the new ticket
        const newTicket = await prisma.ticket.create({
            data: {
                code: uniqueCode,
                flight: { connect: { id: flightId } },
                user: { connect: { id: userId } },
                seat: { connect: { id: seatId } },
                ticketTransaction: { connect: { id: transactionId } },
                ticketTransactionDetail: {
                    connect: { id: detailTransactionId },
                },
            },

            include: {
                flight: true,
                user: true,
                seat: true,
                ticketTransaction: true,
                ticketTransactionDetail: true,
            },
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
    const { flightId, userId, seatId, transactionId, detailTransactionId } =
        req.body;

    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: req.params.id },
            include: {
                flight: true,
                user: true,
                seat: true,
                ticketTransaction: true,
                ticketTransactionDetail: true,
            },
        });
        if (!ticket) {
            return next(createHttpError(404, { message: "Ticket not found" }));
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id: req.params.id },
            data: {
                flight: { connect: { id: flightId } },
                user: { connect: { id: userId } },
                seat: { connect: { id: seatId } },
                ticketTransaction: { connect: { id: transactionId } },
                ticketTransactionDetail: {
                    connect: { id: detailTransactionId },
                },
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

const generateTicket = async (req, res, next) => {
    try {
        let data = [];

        const tickets = await prisma.ticket.findMany({
            where: { userId: req.user.id },
            include: {
                user: {
                    include: {
                        auth: {
                            select: {
                                id: true,
                                email: true,
                                isVerified: true,
                            },
                        },
                    },
                },
                ticketTransaction: {
                    include: {
                        Transaction_Detail: true,
                    },
                },
                seat: true,
                flight: {
                    include: {
                        plane: true,
                        departureAirport: true,
                        transitAirport: true,
                        destinationAirport: true,
                    },
                },
            },
        });

        data.push(...tickets);

        console.log(data[0]);

        res.render("templates/ticket.ejs", {
            data: data,
            tickets: tickets,
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
    generateTicket,
};
