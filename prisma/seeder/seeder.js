const { PrismaClient } = require("@prisma/client");
const { secretHash } = require("../../utils/hashSalt");
const {randomUUID} = require("crypto");

const prisma = new PrismaClient();

async function main() {
    // Seeder data
    const accountAuthData = [
        "user",
        "Alice",
        "Anastasia",
        "Ren",
        "Len",
        "Togenashi",
        "Maya",
        "Ferdinan",
        "Zenith",
    ];

    const airports = [
        {
            name: "Soekarno-Hatta International Airport",
            code: "CGK",
            country: "Indonesia",
            city: "Jakarta",
        },
        {
            name: "Ngurah Rai International Airport",
            code: "DPS",
            country: "Indonesia",
            city: "Denpasar",
        },
        {
            name: "Juanda International Airport",
            code: "SUB",
            country: "Indonesia",
            city: "Surabaya",
        },
        {
            name: "Kuala Namu International Airport",
            code: "KNO",
            country: "Indonesia",
            city: "Medan",
        },
        {
            name: "Sultan Hasanuddin International Airport",
            code: "UPG",
            country: "Indonesia",
            city: "Makassar",
        },
        {
            name: "Ahmad Yani International Airport",
            code: "SRG",
            country: "Indonesia",
            city: "Semarang",
        },
        {
            name: "Husein Sastranegara International Airport",
            code: "BDO",
            country: "Indonesia",
            city: "Bandung",
        },
        {
            name: "Adisutjipto International Airport",
            code: "JOG",
            country: "Indonesia",
            city: "Yogyakarta",
        },
        {
            name: "Sepinggan International Airport",
            code: "BPN",
            country: "Indonesia",
            city: "Balikpapan",
        },
        {
            name: "Sultan Syarif Kasim II International Airport",
            code: "PKU",
            country: "Indonesia",
            city: "Pekanbaru",
        },
        {
            name: "Los Angeles International Airport",
            code: "LAX",
            country: "USA",
            city: "Los Angeles",
        },
        {
            name: "Heathrow Airport",
            code: "LHR",
            country: "United Kingdom",
            city: "London",
        },
        {
            name: "Changi Airport",
            code: "SIN",
            country: "Singapore",
            city: "Singapore",
        },
        {
            name: "Haneda Airport",
            code: "HND",
            country: "Japan",
            city: "Tokyo",
        },
        {
            name: "Dubai International Airport",
            code: "DXB",
            country: "UAE",
            city: "Dubai",
        },
        {
            name: "Charles de Gaulle Airport",
            code: "CDG",
            country: "France",
            city: "Paris",
        },
        {
            name: "Frankfurt Airport",
            code: "FRA",
            country: "Germany",
            city: "Frankfurt",
        },
        {
            name: "Sydney Kingsford Smith Airport",
            code: "SYD",
            country: "Australia",
            city: "Sydney",
        },
        {
            name: "Hong Kong International Airport",
            code: "HKG",
            country: "Hong Kong",
            city: "Hong Kong",
        },
        {
            name: "John F. Kennedy International Airport",
            code: "JFK",
            country: "USA",
            city: "New York",
        },
    ];

    const airlines = [
        {
            code: "GA",
            name: "Garuda Indonesia",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/1716536772224.png",
        },
        {
            code: "SJ",
            name: "Sriwijaya Air",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/1716536772224.png",
        },
        {
            code: "QG",
            name: "Citilink",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/1716536772224.png",
        },
        {
            code: "JT",
            name: "Lion Air",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/1716536772224.png",
        },
        {
            code: "ID",
            name: "Batik Air",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/1716536772224.png",
        },
        {
            code: "IN",
            name: "Nam Air",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/1716536772224.png",
        },
        {
            code: "IW",
            name: "Wings Air",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/1716536772224.png",
        },
        {
            code: "KD",
            name: "Kalimantan Airlines",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/1716536772224.png",
        },
        {
            code: "RA",
            name: "Riau Airlines",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/1716536772224.png",
        },
        {
            code: "IE",
            name: "Super Air Jet",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/1716536772224.png",
        },
    ];

    const flights = [
        {
            planeCode: "GA",
            departureDate: new Date("2024-06-01T08:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-01T12:00:00Z"),
            destinationCity: "Bali",
            destinationCityCode: "DPS",
            price: 1500000,
        },
        {
            planeCode: "GA",
            departureDate: new Date("2024-06-02T09:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-02T13:00:00Z"),
            destinationCity: "Surabaya",
            destinationCityCode: "SUB",
            price: 1200000,
        },
        {
            planeCode: "SJ",
            departureDate: new Date("2024-06-03T10:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-03T14:00:00Z"),
            destinationCity: "Medan",
            destinationCityCode: "KNO",
            price: 1300000,
        },
        {
            planeCode: "SJ",
            departureDate: new Date("2024-06-04T11:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-04T15:00:00Z"),
            destinationCity: "Makassar",
            destinationCityCode: "UPG",
            price: 1400000,
        },
        {
            planeCode: "QG",
            departureDate: new Date("2024-06-05T12:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-05T16:00:00Z"),
            destinationCity: "Semarang",
            destinationCityCode: "SRG",
            price: 1100000,
        },
        {
            planeCode: "QG",
            departureDate: new Date("2024-06-06T13:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-06T17:00:00Z"),
            destinationCity: "Bandung",
            destinationCityCode: "BDO",
            price: 1000000,
        },
        {
            planeCode: "JT",
            departureDate: new Date("2024-06-07T14:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-07T18:00:00Z"),
            destinationCity: "Yogyakarta",
            destinationCityCode: "JOG",
            price: 1150000,
        },
        {
            planeCode: "JT",
            departureDate: new Date("2024-06-08T15:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-08T19:00:00Z"),
            destinationCity: "Balikpapan",
            destinationCityCode: "BPN",
            price: 1250000,
        },
        {
            planeCode: "ID",
            departureDate: new Date("2024-06-09T16:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-09T20:00:00Z"),
            destinationCity: "Pekanbaru",
            destinationCityCode: "PKU",
            price: 1350000,
        },
        {
            planeCode: "ID",
            departureDate: new Date("2024-06-10T17:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-10T21:00:00Z"),
            destinationCity: "Padang",
            destinationCityCode: "PDG",
            price: 1450000,
        },
    ];

    const flightSeats = [];

    const seatRows = 12;
    const seatLetters = ['A', 'B', 'C', 'D'];

    for (let i = 1; i <= seatRows; i++) {
        for (let letter of seatLetters) {
            flightSeats.push({
                seatNumber: `${i}${letter}`,
                isBooked: false,
                type: 'ECONOMY'
            });
        }
    }

    // create airports, airlines
    await prisma.airport.createMany({ data: airports });
    await prisma.airline.createMany({ data: airlines });

    const airlinesMap = await prisma.airline.findMany();
    const airportsMap = await prisma.airport.findMany();
 
    // create user, auth
    await Promise.all(
        accountAuthData.map((name) =>
            prisma.user.create({
                data: {
                    name: name,
                    role: "BUYER",
                    phoneNumber: "628123456789",
                    Auth: {
                        create: {
                            email: `${name.toLowerCase()}@test.com`,
                            password: secretHash("password"),
                            isVerified: true,
                            otpToken: null,
                            secretToken: null,
                        },
                    },
                },
            })
        )
    );

    // create flight
    await Promise.all(
        flights.map(async (flight) => {
            const plane = airlinesMap.find((a) => a.code === flight.planeCode);
            const departureAirport = airportsMap.find(
                (a) => a.code === flight.departureCityCode
            );
            const destinationAirport = airportsMap.find(
                (a) => a.code === flight.destinationCityCode
            );

            if (plane && departureAirport && destinationAirport) {
                await prisma.flight.create({
                    data: {
                        planeId: plane.id,
                        departureDate: flight.departureDate,
                        departureCity: departureAirport.city,
                        departureCityCode: departureAirport.code,
                        arrivalDate: flight.arrivalDate,
                        destinationCity: destinationAirport.city,
                        destinationCityCode: destinationAirport.code,
                        price: flight.price,
                    },
                });
            }
        })
    );

    const flightData = await prisma.flight.findMany();
    
    await Promise.all(
        flightData.map(async (flight) => {
            await Promise.all(
                flightSeats.map(async (seat) => {
                    await prisma.flightSeat.create({
                        data: {
                            flightId: flight.id,
                            seatNumber: seat.seatNumber,
                            isBooked: seat.isBooked,
                            type: seat.type,
                            tickets: {
                                create: {
                                    code: randomUUID(),
                                    flightId: flight.id,
                                    bookingDate: new Date('2024-06-01T10:00:00Z'),
                                    price: 1500000n,
                                },
                            },
                        },
                    });
                })
            );
        })
    );

    
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
