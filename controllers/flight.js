const FlightModel = require("../models/flight");

async function getFlightById(req, res) {
  const { flightId } = req.params;
  try {
    const flight = await FlightModel.getFlightById(flightId);
    if (flight) {
      res.json(flight);
    } else {
      res.status(404).json({ message: "Penerbangan tidak ditemukan." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan dalam server." });
  }
}

async function createFlight(req, res) {
  const flightData = req.body;
  try {
    const flight = await FlightModel.createFlight(flightData);
    res.status(201).json({ message: "Flight created successfully", flight });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "Failed to create flight. Please try again later." });
  }
}

module.exports = {
  getFlightById,
  createFlight,
};
