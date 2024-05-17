const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

const getAllFlight = async (req, res) => {
  try {
    const flight = await prisma.flight.findMany();
    res.status(200).json({
      status: true,
      message: "all flight data retrieved successfully",
      data: flight,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFlightById = async (req, res) => {
  try {
    const flight = await prisma.flight.findUnique({
      where: { id: req.params.id },
    });

    if (!flight) {
      return res.status(404).json({
        status: false,
        message: "Flight not found",
      });
    }

    const airplane = await prisma.airplane.findUnique({
      where: { id: flight.planeId },
    });

    if (!airplane) {
      return res.status(500).json({
        status: false,
        message: "Error retrieving airplane data",
      });
    }

    const flightWithAirplane = { ...flight, airplane };

    res.status(200).json({
      status: true,
      message: "Flight data retrieved successfully",
      data: flightWithAirplane,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createFlight = async (req, res) => {
  const {
    planeId,
    departureDate,
    departureCity,
    departureCityCode,
    arrivalDate,
    destinationCity,
    destinationCityCode,
    price
  } = req.body;

  const id = uuidv4();

  try {
    const planeExists = await prisma.airplane.findUnique({
      where: { id: planeId },
    });

    if (!planeExists) {
      return res.status(400).json({
        status: false,
        message: "Invalid planeId. Plane does not exist.",
      });
    }

    if (isNaN(Date.parse(departureDate)) || isNaN(Date.parse(arrivalDate))) {
      return res.status(400).json({
        status: false,
        message: "Invalid date format. Use ISO 8601 format for dates.",
      });
    }

    const newFlight = await prisma.flight.create({
      data: {
        id,
        planeId,
        departureDate: new Date(departureDate),
        departureCity,
        departureCityCode,
        arrivalDate: new Date(arrivalDate),
        destinationCity,
        destinationCityCode,
        price
      },
    });

    res.status(200).json({
      status: true,
      message: "Flight created successfully",
      data: newFlight,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  getAllFlight,
  getFlightById,
  createFlight
};
