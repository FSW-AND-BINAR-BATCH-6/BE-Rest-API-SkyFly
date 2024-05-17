const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getFlightById(id) {
  return await prisma.flight.findUnique({
    where: { id },
    include: {
      plane: true,
      seats: true,
    },
  });
}

async function createFlight(data) {
  try {
    return await prisma.flight.create({ data });
  } catch (error) {
    throw new Error(`Unable to create flight: ${error}`);
  }
}

module.exports = {
  getFlightById,
  createFlight,
};
