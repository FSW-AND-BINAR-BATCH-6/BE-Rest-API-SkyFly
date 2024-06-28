const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    const airlinesMap = await prisma.airline.findMany();
    const airportsMap = await prisma.airport.findMany();

    const maxFlights = 1000;

    const AirlinesArray = airlinesMap.map((data) => data);
    const AirportArray = airportsMap.map((data) => data);

    const flightData = new Set();

    const generateFlights = () => {
        const capacity = 72;
        const price = 1500000;
        const startDate = new Date("2024-07-01T08:00:00Z");
        const msPerDay = 24 * 60 * 60 * 1000;

        let currentDate = new Date(startDate);

        while (
            currentDate < new Date("2024-07-31T08:00:00Z") &&
            flightData.size < maxFlights
        ) {
            for (const departureAirport of AirportArray) {
                const shuffledAirlines = AirlinesArray.sort(
                    () => 0.5 - Math.random()
                );

                const airline = shuffledAirlines[0];
                const destinationAirport = AirportArray.filter(
                    (airport) => airport.id !== departureAirport.id
                )[Math.floor(Math.random() * (AirportArray.length - 1))];
                const departureDate = new Date(currentDate);
                const arrivalDate = new Date(
                    departureDate.getTime() + 4 * 60 * 60 * 1000
                );
                const forwardFlight = {
                    planeId: airline.id,
                    departureDate: departureDate,
                    departureAirportId: departureAirport.id,
                    arrivalDate: arrivalDate,
                    destinationAirportId: destinationAirport.id,
                    capacity: capacity,
                    price: price,
                    code: `${airline.code}.${departureAirport.code}.${destinationAirport.code}`,
                };

                const returnAirline = shuffledAirlines[1] || airline;
                const returnDepartureDate = new Date(
                    departureDate.getTime() + msPerDay
                );
                const returnArrivalDate = new Date(
                    returnDepartureDate.getTime() + 4 * 60 * 60 * 1000
                );
                const returnFlight = {
                    planeId: returnAirline.id,
                    departureDate: returnDepartureDate,
                    departureAirportId: destinationAirport.id,
                    arrivalDate: returnArrivalDate,
                    destinationAirportId: departureAirport.id,
                    capacity: capacity,
                    price: price,
                    code: `${returnAirline.code}.${destinationAirport.code}.${departureAirport.code}`,
                };

                flightData.add(JSON.stringify(forwardFlight));
                if (flightData.size < maxFlights) {
                    flightData.add(JSON.stringify(returnFlight));
                }

                if (flightData.size >= maxFlights) break;
            }
            currentDate = new Date(currentDate.getTime() + msPerDay);
        }
    };

    generateFlights();

    const flightArray = Array.from(flightData).map((flight) => JSON.parse(flight));

    // Create flights and capture their ids
    for (const flight of flightArray) {
        const createdFlight = await prisma.flight.create({ data: flight });
        flight.id = createdFlight.id; // Assign the created flight id to the flight object
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

    for (const flight of flightArray) {
        for (const seat of flightSeats) {
            let seatPrice = seat.price;
            if (seat.type === "BUSINESS") {
                seatPrice *= 1.5;
            } else if (seat.type === "FIRST") {
                seatPrice *= 2;
            }
            await prisma.flightSeat.create({
                data: {
                    flightId: flight.id,
                    seatNumber: seat.seatNumber,
                    isBooked: seat.isBooked,
                    type: seat.type,
                    price: seatPrice,
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
