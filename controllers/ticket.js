const TicketModel = require("../models/ticket");

async function createTicket(req, res) {
  const ticketData = req.body;
  try {
    const ticket = await TicketModel.createTicket(ticketData);
    res.status(201).json(ticket);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getTicketById(req, res) {
  const { ticketId } = req.params;
  try {
    const ticket = await TicketModel.getTicketById(ticketId);
    if (ticket) {
      res.json(ticket);
    } else {
      res.status(404).json({ message: "Ticket not found." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  createTicket,
  getTicketById,
};
