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
              { departureAirport: { city: { contains: term, mode: 'insensitive' } } },
              { destinationAirport: { city: { contains: term, mode: 'insensitive' } } },
              { departureAirport: { code: { contains: term.toUpperCase(), mode: 'insensitive' } } },
              { destinationAirport: { code: { contains: term.toUpperCase(), mode: 'insensitive' } } }
            ]
          });
        }
      });
    }

    const flights = await prisma.flight.findMany({
      where: filters,
      skip,
      take,
      include: {
        departureAirport: true,
        destinationAirport: true,
      },
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
        pageItems: flights.length,
        nextPage: currentPage < totalPages ? currentPage + 1 : null,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
      },
      data: flights.length !== 0 ? flights : "No flight data found",
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getFlightById = async (req, res) => {
  try {
    const flight = await prisma.flight.findUnique({
      where: { id: req.params.id },
      include: {
        departureAirport: true,
        destinationAirport: true,
      },
    });

    if (!flight) {
      return res.status(404).json({
        status: "404 Not found",
        message: "Flight not found",
      });
    }

    const airplane = await prisma.airline.findUnique({
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
    departureAirportId,
    arrivalDate,
    destinationAirportId,
    capacity,
    price,
  } = req.body;

  const id = uuidv4();

  try {
    const planeExists = await prisma.airline.findUnique({
      where: { id: planeId },
    });

    if (!planeExists) {
      return res.status(400).json({
        status: false,
        message: 'Invalid planeId. Plane does not exist.',
      });
    }

    const departureAirportExists = await prisma.airport.findUnique({
      where: { id: departureAirportId },
    });

    if (!departureAirportExists) {
      return res.status(400).json({
        status: false,
        message: 'Invalid departureAirportId. Airport does not exist.',
      });
    }

    const destinationAirportExists = await prisma.airport.findUnique({
      where: { id: destinationAirportId },
    });

    if (!destinationAirportExists) {
      return res.status(400).json({
        status: false,
        message: 'Invalid destinationAirportId. Airport does not exist.',
      });
    }

    const departureDateTime = new Date(departureDate);
    const arrivalDateTime = new Date(arrivalDate);

    const departureDateTimeConvert = new Date(departureDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString();
    const arrivalDateTimeConvert = new Date(arrivalDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString();

    const newFlight = await prisma.flight.create({
      data: {
        id,
        planeId,
        departureDate: departureDateTimeConvert,
        departureAirportId,
        arrivalDate: arrivalDateTimeConvert,
        destinationAirportId,
        capacity,
        price
      },
      include: {
        departureAirport: true,
        destinationAirport: true,
      }
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
    departureAirportId,
    arrivalDate,
    destinationAirportId,
    capacity,
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
      const plane = await prisma.airline.findUnique({
        where: { id: planeId },
      });

      if (!plane) {
        return res.status(404).json({
          status: false,
          message: "Plane or planeId not found",
        });
      }
    }

    if (departureAirportId) {
      const departureAirport = await prisma.airport.findUnique({
        where: { id: departureAirportId },
      });

      if (!departureAirport) {
        return res.status(404).json({
          status: false,
          message: "Departure airport not found",
        });
      }
    }

    if (destinationAirportId) {
      const destinationAirport = await prisma.airport.findUnique({
        where: { id: destinationAirportId },
      });

      if (!destinationAirport) {
        return res.status(404).json({
          status: false,
          message: "Destination airport not found",
        });
      }
    }

    const updatedFlight = await prisma.flight.update({
      where: { id: req.params.id },
      data: {
        planeId,
        departureDate: new Date(departureDate),
        departureAirportId,
        arrivalDate: new Date(arrivalDate),
        destinationAirportId,
        capacity,
        price
      },
      include: {
        departureAirport: true,
        destinationAirport: true,
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

    const deletedFlight = await prisma.flight.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({
      status: true,
      message: "Flight deleted successfully",
      deletedData: deletedFlight,
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
