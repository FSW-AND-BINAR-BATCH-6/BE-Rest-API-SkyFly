const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const FlightSeatModel = require("../models/flightSeat");

async function createFlightSeat(req, res) {
  const flightSeatData = req.body;
  try {
    const flightSeat = await FlightSeatModel.createFlightSeat(flightSeatData);
    res
      .status(201)
      .json({ message: "Flight seat created successfully", flightSeat });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Failed to create flight seat. Please try again later.",
    });
  }
}
async function getAvailableSeats(req, res) {
  const { flightId } = req.params;
  try {
    const seats = await FlightSeatModel.getAvailableSeatsByFlightId(flightId);
    if (seats.length === 0) {
      res.status(404).json({
        message: "Maaf, tidak ada kursi yang tersedia untuk penerbangan ini.",
      });
    } else {
      res.json(seats);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message:
        "Maaf, terjadi kesalahan dalam mengambil daftar kursi yang tersedia.",
    });
  }
}

async function bookSeat(req, res) {
  const { seatId } = req.params;
  try {
    const updatedSeat = await FlightSeatModel.bookSeat(seatId);
    if (updatedSeat) {
      res.json({ message: "Kursi telah berhasil dipesan." });
    } else {
      res
        .status(404)
        .json({ message: "Maaf, kursi yang Anda pilih tidak ditemukan." });
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "Maaf, terjadi kesalahan dalam memesan kursi." });
  }
}

async function occupySeat(req, res) {
  const { seatId } = req.params;
  try {
    const updatedSeat = await FlightSeatModel.occupySeat(seatId);
    if (updatedSeat) {
      res.json({ message: "Kursi telah berhasil diisi." });
    } else {
      res
        .status(404)
        .json({ message: "Maaf, kursi yang Anda pilih tidak ditemukan." });
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "Maaf, terjadi kesalahan dalam mengisi kursi." });
  }
}

module.exports = {
  createFlightSeat,
  getAvailableSeats,
  bookSeat,
  occupySeat,
};
