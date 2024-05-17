const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createTicket(data) {
  return await prisma.ticket.create({ data });
}

async function getTicketById(id) {
  return await prisma.ticket.findUnique({ where: { id } });
}

module.exports = {
  createTicket,
  getTicketById,
};
