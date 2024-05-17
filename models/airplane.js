const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getAirplaneById(id) {
  return await prisma.airplane.findUnique({
    where: { id },
  });
}

module.exports = {
  getAirplaneById,
};
