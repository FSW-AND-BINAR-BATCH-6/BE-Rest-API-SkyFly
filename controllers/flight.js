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
            hasTransit,
            hasDiscount,
            sort
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

        if (hasDiscount && hasDiscount === 'true') {
            filters.AND.push({ discount: { not: null || 0 } });
        } else if (hasDiscount && hasDiscount === 'false') {
            filters.AND.push({ discount: null || 0 });
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
            const facilityList = facilities.split('%20');
            facilityList.forEach(facility => {
                filters.AND.push({ facilities: { contains: facility.trim() } });
            });
        }

        const sortOptions = {
            'shortest-duration': {
                departureDate: 'asc',
                arrivalDate: 'asc'
            },
            'earliest-departure': { departureDate: 'asc' },
            'latest-departure': { departureDate: 'desc' },
            'earliest-arrival': { arrivalDate: 'asc' },
            'latest-arrival': { arrivalDate: 'desc' },
            'cheapest-price': { price: 'asc' },
        };

        let orderBy = [];

        if (sort) {
            if (sort === 'shortest-duration') {
                orderBy = [
                    { departureDate: 'asc' },
                    { arrivalDate: 'asc' }
                ];
            } else {
                const orderByOption = sortOptions[sort];
                if (orderByOption) {
                    orderBy.push(orderByOption);
                }
            }
        }

        const flights = await prisma.flight.findMany({
            where: filters,
            skip,
            take,
            orderBy,
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
            code: flight.code,
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
            discount: flight.discount,
            price: flight.price,
            facilities: flight.facilities,
            duration: calculateFlightDuration(
                flight.departureDate,
                flight.arrivalDate,
            ),
        }));

        if (sort === 'shortest-duration') {
            formattedFlights.sort((a, b) => a.duration - b.duration);
        }

        res.status(200).json({
            status: true,
            message: "All flight data retrieved successfully",
            totalItems: total,
            pagination: {
                totalPages: totalPages,
                currentPage: currentPage,
                pageItems: formattedFlights.length,
                nextPage: currentPage < totalPages ? currentPage + 1 : null,
                prevPage: currentPage > 1 ? currentPage - 1 : null,
            },
            data: formattedFlights.length !== 0 ? formattedFlights : "No flight data found",
        });
    } catch (error) {
        console.error('Error fetching flights:', error);
        next(createHttpError(500, { message: error.message }));
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
                createHttpError(404, {
                    message: "Flight not found",
                })
            );
        }

        const formattedFlight = {
            id: flight.id,
            planeId: flight.planeId,
            departureDate: flight.departureDate,
            code: flight.code,
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
            discount: flight.discount,
            price: flight.price,
            facilities: flight.facilities,
        };

        res.status(200).json({
            status: true,
            message: "Flight data retrieved successfully",
            data: formattedFlight,
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const counter = new Map();

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
        discount,
        facilities
    } = req.body;

    const departureDateTime = new Date(departureDate);
    const arrivalDateTime = new Date(arrivalDate);
    const transitArrivalDateTime = transitArrivalDate ? new Date(transitArrivalDate) : null;
    const transitDepartureDateTime = transitDepartureDate ? new Date(transitDepartureDate) : null;

    const departureDateTimeConvert = new Date(departureDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString();
    const arrivalDateTimeConvert = new Date(arrivalDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString();
    const transitArrivalDateTimeConvert = transitArrivalDateTime ? new Date(transitArrivalDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString() : null;
    const transitDepartureDateTimeConvert = transitDepartureDateTime ? new Date(transitDepartureDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString() : null;
    try {
        const plane = await prisma.airline.findUnique({ where: { id: planeId } });
        const departureAirport = await prisma.airport.findUnique({ where: { id: departureAirportId } });

        if (!plane || !departureAirport) {
            return next(createHttpError(400, { message: "Invalid planeId or departureAirportId" }));
        }

        let finalPrice = price;
        if (discount) {
            finalPrice = price - (price * (discount / 100));
        }

        const baseCode = `${plane.code}-${departureAirport.code}`;

        const lastNumber = counter.get(baseCode) || 0;

        const newNumber = lastNumber + 1;

        counter.set(baseCode, newNumber);

        const code = `${baseCode}-${newNumber}`;

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
                discount,
                price: finalPrice,
                facilities,
                code
            },
            include: {
                departureAirport: true,
                transitAirport: true,
                destinationAirport: true,
            }
        });

        res.status(201).json({
            status: true,
            message: 'Flight created successfully',
            data: newFlight,
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const updateFlight = async (req, res, next) => {
    const {
        departureDate,
        departureAirportId,
        transitArrivalDate,
        transitDepartureDate,
        transitAirportId,
        arrivalDate,
        destinationAirportId,
        capacity,
        discount,
        price,
        facilities,
    } = req.body;

    const departureDateTime = new Date(departureDate);
    const arrivalDateTime = new Date(arrivalDate);
    const transitArrivalDateTime = transitArrivalDate ? new Date(transitArrivalDate) : null;
    const transitDepartureDateTime = transitDepartureDate ? new Date(transitDepartureDate) : null;

    const departureDateTimeConvert = new Date(departureDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString();
    const arrivalDateTimeConvert = new Date(arrivalDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString();
    const transitArrivalDateTimeConvert = transitArrivalDateTime ? new Date(transitArrivalDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString() : null;
    const transitDepartureDateTimeConvert = transitDepartureDateTime ? new Date(transitDepartureDateTime.getTime() + 7 * 60 * 60 * 1000).toISOString() : null;

    let finalPrice = price;
    if (discount) {
        finalPrice = price - (price * (discount / 100));
    }
    try {
        const flight = await prisma.flight.findUnique({
            where: { id: req.params.id },
        });

        if (!flight) {
            return next(
                createHttpError(404, {
                    message: "Flight Not Found",
                })
            );
        }

        const updatedFlight = await prisma.flight.update({
            where: { id: req.params.id },
            data: {
                planeId: flight.planeId,
                departureDate: departureDateTimeConvert,
                departureAirportId,
                transitArrivalDate: transitArrivalDateTimeConvert,
                transitDepartureDate: transitDepartureDateTimeConvert,
                transitAirportId,
                arrivalDate: arrivalDateTimeConvert,
                destinationAirportId,
                capacity,
                discount,
                price: finalPrice,
                facilities,
            },
            include: {
                departureAirport: true,
                transitAirport: true,
                destinationAirport: true,
            }
        });

        res.status(201).json({
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

const getFavoriteDestinations = async (req, res, next) => {
    try {
        const ticketTransactionDetails = await prisma.ticketTransactionDetail.findMany({
            include: {
                flight: {
                    select: {
                        destinationAirportId: true
                    }
                }
            }
        });

        const destinationGroups = ticketTransactionDetails.reduce((groups, transaction) => {
            const destinationAirportId = transaction.flight.destinationAirportId;

            if (!groups[destinationAirportId]) {
                groups[destinationAirportId] = {
                    airportId: destinationAirportId,
                    transactionCount: 0
                };
            }

            groups[destinationAirportId].transactionCount++;

            return groups;
        }, {});

        const destinationAirportIds = Object.keys(destinationGroups);
        const airports = await prisma.airport.findMany({
            where: {
                id: {
                    in: destinationAirportIds
                }
            }
        });

        const destinationsWithDetails = destinationAirportIds.map(airportId => {
            const airport = airports.find(a => a.id === airportId);

            return {
                airport,
                transactionCount: destinationGroups[airportId].transactionCount
            };
        });

        destinationsWithDetails.sort((a, b) => b.transactionCount - a.transactionCount);

        res.status(200).json({
            status: true,
            message: 'Favorite destinations retrieved successfully',
            data: destinationsWithDetails.slice(0, 5) 
        });
    } catch (error) {
        console.error('Error retrieving favorite destinations:', error);
        next(createHttpError(500, { message: error.message }));
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
        next(createHttpError(500, { message: error.message }));
    }
};

function calculateFlightDuration(departureDate, arrivalDate, transitDepartureDate, transitArrivalDate) {
    const departureDateTime = new Date(departureDate).getTime();
    const arrivalDateTime = new Date(arrivalDate).getTime();

    if (transitDepartureDate && transitArrivalDate) {
        const transitDepartureDateTime = new Date(transitDepartureDate).getTime();
        const transitArrivalDateTime = new Date(transitArrivalDate).getTime();

        return (arrivalDateTime - departureDateTime) - (transitArrivalDateTime - transitDepartureDateTime);
    } else {
        return arrivalDateTime - departureDateTime;
    }
}

module.exports = {
    getAllFlight,
    getFlightById,
    createFlight,
    removeFlight,
    updateFlight,
    getFavoriteDestinations,
};