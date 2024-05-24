const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

const getAllFlight = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    let filters = {};

    if (search) {
      const decodedSearch = decodeURIComponent(search);
      const searchTerms = decodedSearch.split("%20").map(term => term.toLowerCase());
      console.log(decodedSearch);
      console.log(searchTerms);
      filters = {
        AND: []
      };

      searchTerms.forEach(term => {
        const isDate = !isNaN(Date.parse(term));
        if (isDate) {
          const searchDate = new Date(term);
          filters.AND.push({ departureDate: { gte: searchDate, lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000) } });
        } else {
          filters.AND.push({
            OR: [
              { departureCity: { contains: term, mode: 'insensitive' } },
              { destinationCity: { contains: term, mode: 'insensitive' } },
              { departureCityCode: { contains: term.toUpperCase(), mode: 'insensitive' } },
              { destinationCityCode: { contains: term.toUpperCase(), mode: 'insensitive' } }
            ]
          });
        }
      });
    }

    const flight = await prisma.flight.findMany({
      where: filters,
      skip,
      take,
    });

    const total = await prisma.flight.count({
      where: filters,
    });

    const totalPages = Math.ceil(total / take);
    const currentPage = parseInt(page);

    res.status(200).json({
      status: true,
      message: "All flight data retrieved successfully",
      totalItems: total,
      pagination: {
        totalPages: totalPages,
        currentPage: currentPage,
        pageItems: flight.length,
        nextPage: currentPage < totalPages ? currentPage + 1 : null,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
      },
      data: flight.length !== 0 ? flight : "No flight data found",
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};


const getFlightById = async (req, res) => {
  try {
    const flight = await prisma.flight.findUnique({
      where: { id: req.params.id },
    });

    if (!flight) {
      return res.status(404).json({
        status: "404 Not found",
        message: "Flight not found",
      });
    }

    const airplane = await prisma.airplane.findUnique({
      where: { id: flight.planeId },
    });

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
    price,
  } = req.body;

  const id = uuidv4();

  try {
    const planeExists = await prisma.airplane.findUnique({
      where: { id: planeId },
    });

    if (!planeExists) {
      return res.status(400).json({
        status: false,
        message: 'Invalid planeId. Plane does not exist.',
      });
    }
    const departureDateTime = new Date(departureDate);
    const arrivalDateTime = new Date(arrivalDate);

    const departureDateTimeInJakarta = new Date(departureDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString();
    const arrivalDateTimeInJakarta = new Date(arrivalDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString();

    const newFlight = await prisma.flight.create({
      data: {
        id,
        planeId,
        departureDate: departureDateTimeInJakarta,
        departureCity,
        departureCityCode,
        arrivalDate: arrivalDateTimeInJakarta,
        destinationCity,
        destinationCityCode,
        price,
      },
    });

    res.status(200).json({
      status: true,
      message: 'Flight created successfully',
      data: newFlight,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateFlight = async (req, res) => {
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
    if (planeId) {
      const plane = await prisma.airplane.findUnique({
        where: { id: planeId },
      });

      if (!plane) {
        return res.status(404).json({
          status: false,
          message: "Plane or planeId not found",
        });
      }
    }

    const updatedFlight = await prisma.flight.update({
      where: { id: req.params.id },
      data: {
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
      message: "Flight updated successfully",
      data: {
        beforeUpdate: flight,
        afterUpdate: updatedFlight,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeFlight = async (req, res) => {
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

    await prisma.flight.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({
      status: true,
      message: "Flight deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllFlight,
  getFlightById,
  createFlight,
  removeFlight,
  updateFlight,
};
