const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
async function main() {
    const generateFlights = (startDate, endDate, routes) => {
        const flights = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            routes.forEach((route) => {
                flights.push({
                    planeCode: route.planeCode,
                    departureDate: new Date(currentDate),
                    departureCity: route.departureCity,
                    departureCityCode: route.departureCityCode,
                    arrivalDate: new Date(
                        new Date(currentDate).setHours(
                            currentDate.getHours() + route.duration
                        )
                    ),
                    destinationCity: route.destinationCity,
                    destinationCityCode: route.destinationCityCode,
                    capacity: route.capacity,
                    price: route.price,
                });
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return flights;
    };

    const routes = [
        {
            planeCode: "GA",
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            destinationCity: "Denpasar",
            destinationCityCode: "DPS",
            duration: 4,
            capacity: 72,
            price: 1500000,
        },
        {
            planeCode: "GA",
            departureCity: "Denpasar",
            departureCityCode: "DPS",
            destinationCity: "Jakarta",
            destinationCityCode: "CGK",
            duration: 4,
            capacity: 72,
            price: 1500000,
        },
    ];

    const startDate = new Date("2024-07-01T12:00:00Z");
    const endDate = new Date("2024-07-20T12:00:00Z");

    const flights = generateFlights(startDate, endDate, routes);

    const airlinesMap = await prisma.airline.findMany();
    const airportsMap = await prisma.airport.findMany();
    const flightData = [];

    for (const flight of flights) {
        const plane = airlinesMap.find((a) => a.code === flight.planeCode);
        const departureAirport = airportsMap.find(
            (a) => a.code === flight.departureCityCode
        );
        const destinationAirport = airportsMap.find(
            (a) => a.code === flight.destinationCityCode
        );

        if (plane && departureAirport && destinationAirport) {
            const data = await prisma.flight.create({
                data: {
                    planeId: plane.id,
                    departureDate: flight.departureDate,
                    departureAirportId: departureAirport.id,
                    arrivalDate: flight.arrivalDate,
                    destinationAirportId: destinationAirport.id,
                    capacity: flight.capacity,
                    price: flight.price,
                    code: `${flight.planeCode}.${flight.departureCityCode}.${flight.destinationCityCode}`,
                },
            });
            flightData.push(data);
        }
    }

    const flightSeats = [];

    const seatRows = 12;
    const seatLetters = ["A", "B", "C", "D", "E", "F"];

    for (let i = 1; i <= seatRows; i++) {
        for (let letter of seatLetters) {
            flightSeats.push({
                seatNumber: `${i}${letter}`,
                status: "AVAILABLE",
                type: "ECONOMY",
                price: 100000,
            });
        }
    }

    for (const flight of flightData) {
        for (const seat of flightSeats) {
            let price = flight.price;
            if (seat.type === "BUSINESS") {
                price *= 1.5;
            } else if (seat.type === "FIRST") {
                price *= 2;
            }
            await prisma.flightSeat.create({
                data: {
                    flightId: flight.id,
                    seatNumber: seat.seatNumber,
                    isBooked: seat.isBooked,
                    type: seat.type,
                    price: price,
                },
            });
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
