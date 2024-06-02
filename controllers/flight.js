const { PrismaClient } = require("@prisma/client");
const createHttpError = require("http-errors");

const prisma = new PrismaClient();

const getAllFlight = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      departureAirport,
      arrivalAirport,
      departureDate,
      passengers,
      seatClass,
      minPrice,
      maxPrice,
      facilities,
      hasTransit
    } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    let filters = { AND: [] };

    if (departureAirport) {
      filters.AND.push({
        OR: [
          { departureAirport: { code: { contains: departureAirport.toUpperCase(), mode: 'insensitive' } } },
          { departureAirport: { city: { contains: departureAirport, mode: 'insensitive' } } }
        ]
      });
    }

    if (arrivalAirport) {
      filters.AND.push({
        OR: [
          { destinationAirport: { code: { contains: arrivalAirport.toUpperCase(), mode: 'insensitive' } } },
          { destinationAirport: { city: { contains: arrivalAirport, mode: 'insensitive' } } }
        ]
      });
    }

    if (departureDate) {
      const parsedDepartureDate = new Date(departureDate);
      filters.AND.push({
        departureDate: {
          gte: new Date(parsedDepartureDate.setHours(0, 0, 0, 0)),
          lt: new Date(parsedDepartureDate.setHours(23, 59, 59, 999))
        }
      });
    }

    if (passengers) {
      filters.AND.push({ capacity: { gte: parseInt(passengers) } });
    }

    if (seatClass) {
      filters.AND.push({
        seats: {
          some: {
            type: seatClass.toUpperCase(),
            isBooked: false
          }
        }
      });
    }

    if (hasTransit && hasTransit === 'true') {
      filters.AND.push({ transitAirport: { isNot: null } });
    } else if (hasTransit && hasTransit === 'false') {
      filters.AND.push({ transitAirport: null });
    }

    if (minPrice || maxPrice) {
      if (minPrice) {
        filters.AND.push({ price: { gte: parseFloat(minPrice) } });
      }
      if (maxPrice) {
        filters.AND.push({ price: { lte: parseFloat(maxPrice) } });
      }
    }

    if (facilities) {
      const facilityList = facilities.split(',');
      facilityList.forEach(facility => {
        filters.AND.push({ facilities: { contains: facility.trim() } });
      });
    }

    const flights = await prisma.flight.findMany({
      where: filters,
      skip,
      take,
      include: {
        departureAirport: true,
        transitAirport: true,
        destinationAirport: true,
        seats: true,
      },
    });

    const total = await prisma.flight.count({ where: filters });
    const totalPages = Math.ceil(total / take);
    const currentPage = parseInt(page);

    const formattedFlights = flights.map(flight => ({
      id: flight.id,
      planeId: flight.planeId,
      departureDate: flight.departureDate,
      departureAirport: {
        id: flight.departureAirport.id,
        name: flight.departureAirport.name,
        code: flight.departureAirport.code,
        country: flight.departureAirport.country,
        city: flight.departureAirport.city,
      },
      transit: flight.transitAirport ? {
        arrivalDate: flight.transitArrivalDate,
        departureDate: flight.transitDepartureDate,
        transitAirport: {
          id: flight.transitAirport.id,
          name: flight.transitAirport.name,
          code: flight.transitAirport.code,
          country: flight.transitAirport.country,
          city: flight.transitAirport.city,
        },
      } : null,
      arrivalDate: flight.arrivalDate,
      destinationAirport: {
        id: flight.destinationAirport.id,
        name: flight.destinationAirport.name,
        code: flight.destinationAirport.code,
        country: flight.destinationAirport.country,
        city: flight.destinationAirport.city,
      },
      capacity: flight.capacity,
      price: flight.price,
      facilities: flight.facilities,
    }));

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
      data: formattedFlights.length !== 0 ? formattedFlights : "No flight data found",
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return next(
        createHttpError(409, {
          message: "Flight Not Found",
        })
      );
    } else {
      next(createHttpError(500, { message: "Internal Server Error" }));
    }
  }
};


const getFlightById = async (req, res, next) => {
  try {
    const flight = await prisma.flight.findUnique({
      where: { id: req.params.id },
      include: {
        departureAirport: true,
        transitAirport: true,
        destinationAirport: true,
      },
    });

    if (!flight) {
      return next(
        createHttpError(409, {
          message: "Flight not found",
        })
      );
    }

    const formattedFlight = {
      id: flight.id,
      planeId: flight.planeId,
      departureDate: flight.departureDate,
      departureAirport: {
        id: flight.departureAirport.id,
        name: flight.departureAirport.name,
        code: flight.departureAirport.code,
        country: flight.departureAirport.country,
        city: flight.departureAirport.city,
      },
      transit: flight.transitAirport ? {
        arrivalDate: flight.transitArrivalDate,
        departureDate: flight.transitDepartureDate,
        transitAirport: {
          id: flight.transitAirport.id,
          name: flight.transitAirport.name,
          code: flight.transitAirport.code,
          country: flight.transitAirport.country,
          city: flight.transitAirport.city,
        },
      } : null,
      arrivalDate: flight.arrivalDate,
      destinationAirport: {
        id: flight.destinationAirport.id,
        name: flight.destinationAirport.name,
        code: flight.destinationAirport.code,
        country: flight.destinationAirport.country,
        city: flight.destinationAirport.city,
      },
      capacity: flight.capacity,
      price: flight.price,
      facilities: flight.facilities,
    };

    res.status(200).json({
      status: true,
      message: "Flight data retrieved successfully",
      data: formattedFlight,
    });
  } catch (error) {
    next(createHttpError(500, { message: "Internal Server Error" }));
  }
};

const createFlight = async (req, res, next) => {
  const {
    planeId,
    departureDate,
    departureAirportId,
    transitArrivalDate,
    transitDepartureDate,
    transitAirportId,
    arrivalDate,
    destinationAirportId,
    capacity,
    price,
    facilities
  } = req.body;

  const departureDateTime = new Date(departureDate);
  const arrivalDateTime = new Date(arrivalDate);
  const transitArrivalDateTime = new Date(transitArrivalDate)
  const transitDepartureDateTime = new Date(transitDepartureDate)

  const departureDateTimeConvert = new Date(departureDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString();
  const arrivalDateTimeConvert = new Date(arrivalDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString();
  const transitArrivalDateTimeConvert = new Date(transitArrivalDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString();
  const transitDepartureDateTimeConvert = new Date(transitDepartureDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString();

  try {
    const newFlight = await prisma.flight.create({
      data: {
        planeId,
        departureDate: departureDateTimeConvert,
        departureAirportId,
        transitArrivalDate: transitArrivalDateTimeConvert,
        transitDepartureDate: transitDepartureDateTimeConvert,
        transitAirportId,
        arrivalDate: arrivalDateTimeConvert,
        destinationAirportId,
        capacity,
        price,
        facilities
      },
      include: {
        departureAirport: true,
        transitAirport: true,
        destinationAirport: true,
      }
    });

    res.status(200).json({
      status: true,
      message: 'Flight created successfully',
      data: newFlight,
    });
  } catch (error) {
    next(createHttpError(500, { message: "Internal Server Error" }));
  }
};

const updateFlight = async (req, res, next) => {
  const {
    planeId,
    departureDate,
    departureAirportId,
    arrivalDate,
    destinationAirportId,
    capacity,
    price,
    facilities,
    transitArrivalDate,
    transitDepartureDate,
    transitAirportId
  } = req.body;

  const departureDateTime = new Date(departureDate);
  const arrivalDateTime = new Date(arrivalDate);
  const transitArrivalDateTime = new Date(transitArrivalDate);
  const transitDepartureDateTime = new Date(transitDepartureDate);

  const departureDateTimeConvert = new Date(departureDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString();
  const arrivalDateTimeConvert = new Date(arrivalDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString();
  const transitArrivalDateTimeConvert = new Date(transitArrivalDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString();
  const transitDepartureDateTimeConvert = new Date(transitDepartureDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString();

  try {
    const flight = await prisma.flight.findUnique({
      where: { id: req.params.id },
    });

    if (!flight) {
      return next(
        createHttpError(409, {
          message: "Flight Not Found",
        })
      );
    }

    const updatedFlight = await prisma.flight.update({
      where: { id: req.params.id },
      data: {
        planeId,
        departureDate: departureDateTimeConvert,
        departureAirportId,
        transitArrivalDate: transitArrivalDateTimeConvert,
        transitDepartureDate: transitDepartureDateTimeConvert,
        transitAirportId,
        arrivalDate: arrivalDateTimeConvert,
        destinationAirportId,
        capacity,
        price,
        facilities
      },
      include: {
        departureAirport: true,
        transitAirport: true,
        destinationAirport: true,
      }
    });

    res.status(200).json({
      status: true,
      message: 'Flight updated successfully',
      data: {
        beforeUpdate: flight,
        afterUpdate: updatedFlight,
      },
    });
  } catch (error) {
    next(createHttpError(500, { message: "Internal Server Error" }));
  }
};


const removeFlight = async (req, res, next) => {
  try {
    const flight = await prisma.flight.findUnique({
      where: { id: req.params.id },
      include: {
        seats: true,
        tickets: true,
      },
    });

    if (!flight) {
      return next(
        createHttpError(409, {
          message: "Flight Not Found",
        })
      );
    }

    if (flight.seats.length > 0 || flight.tickets.length > 0) {
      await prisma.ticket.deleteMany({
        where: { flightId: req.params.id },
      });

      await prisma.flightSeat.deleteMany({
        where: { flightId: req.params.id },
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
  } catch (error) {
    next(createHttpError(500, {message: "Internal Server Error" }));
  }
};

module.exports = {
  getAllFlight,
  getFlightById,
  createFlight,
  removeFlight,
  updateFlight,
};