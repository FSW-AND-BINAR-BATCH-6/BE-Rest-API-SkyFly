const { PrismaClient } = require("@prisma/client");
const createHttpError = require("http-errors");

const prisma = new PrismaClient();

const getAllTicket = async (req, res, next) => {
  try {
    const tickets = await prisma.ticket.findMany();
    res.status(200).json({
      status: true,
      message: "All ticket data retrieved successfully",
      data: tickets,
    });
  } catch (error) {
    next(createHttpError(500, { message: error.message }));
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
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
  const { code, flightId, customerId, seatId, bookingDate, price, status } =
    req.body;

  try {
    const newTicket = await prisma.ticket.create({
      data: {
        code,
        flightId,
        customerId,
        seatId,
        bookingDate: new Date(bookingDate),
        price,
        status,
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
  const { code, flightId, customerId, seatId, bookingDate, price, status } =
    req.body;

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
        customerId,
        seatId,
        bookingDate: new Date(bookingDate),
        price,
        status,
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
