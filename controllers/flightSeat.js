const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

const getAllFlightSeats = async (req, res) => {
    try {
        const { page = 1, limit = 5, search } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        let filters = {};

        if (search) {
            const decodedSearch = decodeURIComponent(search);
            const searchTerms = decodedSearch
                .split("%20")
                .map((term) => term.toLowerCase());
            filters = {
                AND: [],
            };

            searchTerms.forEach((term) => {
                filters.AND.push({
                    OR: [
                        { seatNumber: { contains: term, mode: "insensitive" } },
                        { type: { equals: term.toUpperCase() } },
                    ],
                });
            });
        }

        const flightSeats = await prisma.flightSeat.findMany({
            where: filters,
            skip,
            take,
            include: {
                flight: true,
            },
        });

        const total = await prisma.flightSeat.count({
            where: filters,
        });

        const totalPages = Math.ceil(total / take);
        const currentPage = parseInt(page);

        res.status(200).json({
            status: true,
            message: "All flight seats data retrieved successfully",
            totalItems: total,
            pagination: {
                totalPages: totalPages,
                currentPage: currentPage,
                pageItems: flightSeats.length,
                nextPage: currentPage < totalPages ? currentPage + 1 : null,
                prevPage: currentPage > 1 ? currentPage - 1 : null,
            },
            data:
                flightSeats.length !== 0
                    ? flightSeats
                    : "No flight seats data found",
        });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

const getAvailableFlightSeats = async (req, res) => {
    const { flightId } = req.params;
    const { page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    try {
        const availableSeats = await prisma.flightSeat.findMany({
            where: {
                flightId: flightId,
                isBooked: false,
            },
            skip,
            take,
        });

        const total = await prisma.flightSeat.count({
            where: {
                flightId: flightId,
                isBooked: false,
            },
        });

        const totalPages = Math.ceil(total / take);
        const currentPage = parseInt(page);

        res.status(200).json({
            status: true,
            message: "Available flight seats data retrieved successfully",
            totalItems: total,
            pagination: {
                totalPages: totalPages,
                currentPage: currentPage,
                pageItems: availableSeats.length,
                nextPage: currentPage < totalPages ? currentPage + 1 : null,
                prevPage: currentPage > 1 ? currentPage - 1 : null,
            },
            data:
                availableSeats.length !== 0
                    ? availableSeats
                    : "No available flight seats data found",
        });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

const getFlightSeatById = async (req, res) => {
    const { id } = req.params;

    try {
        const flightSeat = await prisma.flightSeat.findUnique({
            where: { id },
        });

        if (!flightSeat) {
            return res.status(404).json({ message: "Flight seat not found" });
        }

        res.status(200).json(flightSeat);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createFlightSeat = async (req, res) => {
    try {
        // Validate request body against schema
        const { createFlightSeatSchema } = require("../utils/joiValidation");
        const { error } = createFlightSeatSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { flightId, seatNumber, type } = req.body;

        const flight = await prisma.flight.findUnique({
            where: { id: flightId },
        });

        if (!flight) {
            return res
                .status(400)
                .json({ message: "Invalid flightId. Flight does not exist." });
        }

        if (flight.capacity <= 0) {
            return res
                .status(400)
                .json({ message: "No available capacity for this flight." });
        }

        const newFlightSeat = await prisma.flightSeat.create({
            data: {
                id: uuidv4(),
                flightId,
                seatNumber,
                type,
                isBooked: false,
            },
        });

        await prisma.flight.update({
            where: { id: flightId },
            data: { capacity: flight.capacity - 1 },
        });

        res.status(201).json(newFlightSeat);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateFlightSeat = async (req, res) => {
    const { id } = req.params;
    const { seatNumber, type } = req.body;

    try {
        const updatedFlightSeat = await prisma.flightSeat.update({
            where: { id },
            data: {
                seatNumber,
                type,
            },
        });

        res.status(200).json(updatedFlightSeat);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteFlightSeat = async (req, res) => {
    const { id } = req.params;

    try {
        const flightSeat = await prisma.flightSeat.findUnique({
            where: { id },
        });

        if (!flightSeat) {
            return res.status(404).json({ message: "FlightSeat not found." });
        }

        // Delete the flight seat
        await prisma.flightSeat.delete({
            where: { id },
        });

        // Increment the flight capacity
        await prisma.flight.update({
            where: { id: flightSeat.flightId },
            data: { capacity: { increment: 1 } },
        });

        res.status(200).json({ message: "Flight seat deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const bookFlightSeat = async (req, res) => {
    const { id } = req.params;

    try {
        const flightSeat = await prisma.flightSeat.findUnique({
            where: { id },
        });

        if (!flightSeat) {
            return res.status(404).json({ message: "Flight seat not found" });
        }

        if (flightSeat.isBooked) {
            return res
                .status(400)
                .json({ message: "Flight seat is already booked" });
        }

        const bookedFlightSeat = await prisma.flightSeat.update({
            where: { id },
            data: { isBooked: true },
        });

        res.status(200).json({
            message: "Flight seat booked successfully",
            bookedFlightSeat,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllFlightSeats,
    getAvailableFlightSeats,
    getFlightSeatById,
    createFlightSeat,
    updateFlightSeat,
    deleteFlightSeat,
    bookFlightSeat,
};