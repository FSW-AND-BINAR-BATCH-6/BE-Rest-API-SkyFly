const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
async function main() {
    const flights = [
        {
            planeCode: "GA",
            departureDate: new Date("2024-06-01T08:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-01T12:00:00Z"),
            destinationCity: "Denpasar",
            destinationCityCode: "DPS",
            capacity: 72,
            price: 1500000,
        },
        {
            planeCode: "GA",
            departureDate: new Date("2024-07-10T08:00:00Z"),
            departureCity: "Denpasar",
            departureCityCode: "DPS",
            arrivalDate: new Date("2024-07-10T12:00:00Z"),
            destinationCity: "Jakarta",
            destinationCityCode: "CGK",
            capacity: 72,
            price: 1500000,
        },
        {
            planeCode: "GA",
            departureDate: new Date("2024-06-10T08:00:00Z"),
            departureCity: "Denpasar",
            departureCityCode: "DPS",
            arrivalDate: new Date("2024-06-10T12:00:00Z"),
            destinationCity: "Jakarta",
            destinationCityCode: "CGK",
            capacity: 72,
            price: 1500000,
        },
    ];

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
    console.log(flightData);

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
