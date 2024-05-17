const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createFlightSeat(data) {
  try {
    return await prisma.flightSeat.create({ data });
  } catch (error) {
    throw new Error(`Unable to create flight seat: ${error}`);
  }
}
async function getAvailableSeatsByFlightId(flightId) {
  return await prisma.flightSeat.findMany({
    where: {
      flightId: flightId,
      isBooked: false,
    },
  });
}

async function bookSeat(seatId) {
  return await prisma.flightSeat.update({
    where: {
      id: seatId, // Menggunakan seatId yang diterima sebagai argumen fungsi
    },
    data: {
      isBooked: true,
    },
  });
}

async function occupySeat(seatId) {
  return await prisma.flightSeat.update({
    where: {
      id: seatId, // Menggunakan seatId yang diterima sebagai argumen fungsi
    },
    data: {
      isBooked: true,
    },
  });
}

module.exports = {
  createFlightSeat,
  getAvailableSeatsByFlightId,
  bookSeat,
  occupySeat,
};
