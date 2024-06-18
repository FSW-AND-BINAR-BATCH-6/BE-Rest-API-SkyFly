const { PrismaClient } = require("@prisma/client");
const { secretHash } = require("../../utils/hashSalt");
const { randomUUID } = require("crypto");

const prisma = new PrismaClient();

async function main() {
    // Seeder data
    const accountAuthData = [
        "Faris",
        "Viery",
        "Andhika",
        "Falah",
        "Naufal",
        "Yoga",
        "Rafi",
        "Lowis",
        "Komang",
        "Ihsan",
        "Bella",
        "Yusuf",
    ];

    const airports = [
        {
            name: "Soekarno-Hatta International Airport",
            code: "CGK",
            country: "Indonesia",
            city: "Jakarta",
            continent: "Asia",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
        {
            name: "Ngurah Rai International Airport",
            code: "DPS",
            country: "Indonesia",
            city: "Denpasar",
            continent: "Asia",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
        {
            name: "Juanda International Airport",
            code: "SUB",
            country: "Indonesia",
            city: "Surabaya",
            continent: "Asia",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
        {
            name: "Kuala Namu International Airport",
            code: "KNO",
            country: "Indonesia",
            city: "Medan",
            continent: "Asia",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
        {
            name: "Sultan Hasanuddin International Airport",
            code: "UPG",
            country: "Indonesia",
            city: "Makassar",
            continent: "Asia",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
        {
            name: "Ahmad Yani International Airport",
            code: "SRG",
            country: "Indonesia",
            city: "Semarang",
            continent: "Asia",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
        {
            name: "Husein Sastranegara International Airport",
            code: "BDO",
            country: "Indonesia",
            city: "Bandung",
            continent: "Asia",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
        {
            name: "Adisutjipto International Airport",
            code: "JOG",
            country: "Indonesia",
            city: "Yogyakarta",
            continent: "Asia",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
        {
            name: "Sepinggan International Airport",
            code: "BPN",
            country: "Indonesia",
            city: "Balikpapan",
            continent: "Asia",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
        {
            name: "Sultan Syarif Kasim II International Airport",
            code: "PKU",
            country: "Indonesia",
            city: "Pekanbaru",
            continent: "Asia",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
        {
            name: "Los Angeles International Airport",
            code: "LAX",
            country: "USA",
            city: "Los Angeles",
            continent: "America",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
        {
            name: "Heathrow Airport",
            code: "LHR",
            country: "United Kingdom",
            city: "London",
            continent: "Europe",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
        {
            name: "Changi Airport",
            code: "SIN",
            country: "Singapore",
            city: "Singapore",
            continent: "Asia",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
        {
            name: "Haneda Airport",
            code: "HND",
            country: "Japan",
            city: "Tokyo",
            continent: "Asia",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
        {
            name: "Dubai International Airport",
            code: "DXB",
            country: "UAE",
            city: "Dubai",
            continent: "Asia",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
        {
            name: "Charles de Gaulle Airport",
            code: "CDG",
            country: "France",
            city: "Paris",
            continent: "Europe",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
        {
            name: "Frankfurt Airport",
            code: "FRA",
            country: "Germany",
            city: "Frankfurt",
            continent: "Europe",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
        {
            name: "Sydney Kingsford Smith Airport",
            code: "SYD",
            country: "Australia",
            city: "Sydney",
            continent: "Australia",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
        {
            name: "Hong Kong International Airport",
            code: "HKG",
            country: "Hong Kong",
            city: "Hong Kong",
            continent: "Asia",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
        {
            name: "John F. Kennedy International Airport",
            code: "JFK",
            country: "USA",
            city: "New York",
            continent: "America",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/bangkok.jfif",
        },
    ];

    const airlines = [
        {
            code: "GA",
            name: "Garuda Indonesia",
        },
        {
            code: "SJ",
            name: "Sriwijaya Air",
        },
        {
            code: "QG",
            name: "Citilink",
        },
        {
            code: "JT",
            name: "Lion Air",
        },
        {
            code: "ID",
            name: "Batik Air",
        },
        {
            code: "IN",
            name: "Nam Air",
        },
        {
            code: "IW",
            name: "Wings Air",
        },
        {
            code: "KD",
            name: "Kalimantan Airlines",
        },
        {
            code: "RA",
            name: "Riau Airlines",
        },
        {
            code: "IE",
            name: "Super Air Jet",
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
            capacity: 72,
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
            capacity: 72,
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
            capacity: 72,
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
            capacity: 72,
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
            capacity: 72,
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
            capacity: 72,
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
            capacity: 72,
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
            capacity: 72,
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
            capacity: 72,
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
            capacity: 72,
            price: 1450000,
        },
        // Add 40 more flight objects here
        {
            planeCode: "IN",
            departureDate: new Date("2024-06-11T18:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-11T22:00:00Z"),
            destinationCity: "Palembang",
            destinationCityCode: "PLM",
            capacity: 72,
            price: 1250000,
        },
        {
            planeCode: "IW",
            departureDate: new Date("2024-06-12T19:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-12T23:00:00Z"),
            destinationCity: "Pontianak",
            destinationCityCode: "PNK",
            capacity: 72,
            price: 1100000,
        },
        {
            planeCode: "KD",
            departureDate: new Date("2024-06-13T20:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-14T00:00:00Z"),
            destinationCity: "Samarinda",
            destinationCityCode: "SRI",
            capacity: 72,
            price: 1000000,
        },
        {
            planeCode: "RA",
            departureDate: new Date("2024-06-14T21:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-15T01:00:00Z"),
            destinationCity: "Palangkaraya",
            destinationCityCode: "PKY",
            capacity: 72,
            price: 1150000,
        },
        {
            planeCode: "IE",
            departureDate: new Date("2024-06-15T22:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-16T02:00:00Z"),
            destinationCity: "Manado",
            destinationCityCode: "MDC",
            capacity: 72,
            price: 1250000,
        },
        {
            planeCode: "GA",
            departureDate: new Date("2024-06-16T08:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-16T12:00:00Z"),
            destinationCity: "Bali",
            destinationCityCode: "DPS",
            capacity: 72,
            price: 1500000,
        },
        {
            planeCode: "GA",
            departureDate: new Date("2024-06-17T09:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-17T13:00:00Z"),
            destinationCity: "Surabaya",
            destinationCityCode: "SUB",
            capacity: 72,
            price: 1200000,
        },
        {
            planeCode: "SJ",
            departureDate: new Date("2024-06-18T10:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-18T14:00:00Z"),
            destinationCity: "Medan",
            destinationCityCode: "KNO",
            capacity: 72,
            price: 1300000,
        },
        {
            planeCode: "SJ",
            departureDate: new Date("2024-06-19T11:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-19T15:00:00Z"),
            destinationCity: "Makassar",
            destinationCityCode: "UPG",
            capacity: 72,
            price: 1400000,
        },
        {
            planeCode: "QG",
            departureDate: new Date("2024-06-20T12:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",


            arrivalDate: new Date("2024-06-20T16:00:00Z"),
            destinationCity: "Semarang",
            destinationCityCode: "SRG",
            capacity: 72,
            price: 1100000,
        },
        {
            planeCode: "QG",
            departureDate: new Date("2024-06-21T13:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-21T17:00:00Z"),
            destinationCity: "Bandung",
            destinationCityCode: "BDO",
            capacity: 72,
            price: 1000000,
        },
        {
            planeCode: "JT",
            departureDate: new Date("2024-06-22T14:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-22T18:00:00Z"),
            destinationCity: "Yogyakarta",
            destinationCityCode: "JOG",
            capacity: 72,
            price: 1150000,
        },
        {
            planeCode: "JT",
            departureDate: new Date("2024-06-23T15:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-23T19:00:00Z"),
            destinationCity: "Balikpapan",
            destinationCityCode: "BPN",
            capacity: 72,
            price: 1250000,
        },
        {
            planeCode: "ID",
            departureDate: new Date("2024-06-24T16:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-24T20:00:00Z"),
            destinationCity: "Pekanbaru",
            destinationCityCode: "PKU",
            capacity: 72,
            price: 1350000,
        },
        {
            planeCode: "ID",
            departureDate: new Date("2024-06-25T17:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-25T21:00:00Z"),
            destinationCity: "Padang",
            destinationCityCode: "PDG",
            capacity: 72,
            price: 1450000,
        },
        {
            planeCode: "IN",
            departureDate: new Date("2024-06-26T18:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-26T22:00:00Z"),
            destinationCity: "Palembang",
            destinationCityCode: "PLM",
            capacity: 72,
            price: 1250000,
        },
        {
            planeCode: "IW",
            departureDate: new Date("2024-06-27T19:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-27T23:00:00Z"),
            destinationCity: "Pontianak",
            destinationCityCode: "PNK",
            capacity: 72,
            price: 1100000,
        },
        {
            planeCode: "KD",
            departureDate: new Date("2024-06-28T20:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-29T00:00:00Z"),
            destinationCity: "Samarinda",
            destinationCityCode: "SRI",
            capacity: 72,
            price: 1000000,
        },
        {
            planeCode: "RA",
            departureDate: new Date("2024-06-29T21:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-06-30T01:00:00Z"),
            destinationCity: "Palangkaraya",
            destinationCityCode: "PKY",
            capacity: 72,
            price: 1150000,
        },
        {
            planeCode: "IE",
            departureDate: new Date("2024-06-30T22:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-07-01T02:00:00Z"),
            destinationCity: "Manado",
            destinationCityCode: "MDC",
            capacity: 72,
            price: 1250000,
        },
        {
            planeCode: "GA",
            departureDate: new Date("2024-07-01T08:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-07-01T12:00:00Z"),
            destinationCity: "Bali",
            destinationCityCode: "DPS",
            capacity: 72,
            price: 1500000,
        },
        {
            planeCode: "GA",
            departureDate: new Date("2024-07-02T09:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-07-02T13:00:00Z"),
            destinationCity: "Surabaya",
            destinationCityCode: "SUB",
            capacity: 72,
            price: 1200000,
        },
        {
            planeCode: "SJ",
            departureDate: new Date("2024-07-03T10:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-07-03T14:00:00Z"),
            destinationCity: "Medan",
            destinationCityCode: "KNO",
            capacity: 72,
            price: 1300000,
        },
        {
            planeCode: "SJ",
            departureDate: new Date("2024-07-04T11:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-07-04T15:00:00Z"),
            destinationCity: "Makassar",
            destinationCityCode: "UPG",
            capacity: 72,
            price: 1400000,
        },
        {
            planeCode: "QG",
            departureDate: new Date("2024-07-05T12:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-07-05T16:00:00Z"),
            destinationCity: "Semarang",
            destinationCityCode: "SRG",
            capacity: 72,
            price: 1100000,
        },
        {
            planeCode: "QG",
            departureDate: new Date("2024-07-06T13:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-07-06T17:00:00Z"),
            destinationCity: "Bandung",
            destinationCityCode: "BDO",
            capacity: 72,
            price: 1000000,
        },
        {
            planeCode: "JT",
            departureDate: new Date("2024-07-07T14:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-07-07T18:00:00Z"),
            destinationCity: "Yogyakarta",
            destinationCityCode: "JOG",
            capacity: 72,
            price: 1150000,
        },
        {
            planeCode: "JT",
            departureDate: new Date("2024-07-08T15:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-07-08T19:00:00Z"),
            destinationCity: "Balikpapan",
            destinationCityCode: "BPN",
            capacity: 72,
            price: 1250000,
        },
        {
            planeCode: "ID",
            departureDate: new Date("2024-07-09T16:00:00Z"),
            departureCity: "Jakarta",
            departureCityCode: "CGK",
            arrivalDate: new Date("2024-07-09T20:00:00Z"),
            destinationCity: "Pekanbaru",
            destinationCityCode: "PKU",
            capacity: 72,
            price: 1350000,
        }
    ]

    const flightSeats = [];

    const seatRows = 12;
    const seatLetters = ["A", "B", "C", "D", "E", "F"];
    const seatClasses = ["ECONOMY", "BUSINESS", "FIRST"];

    function getRandomClass() {
        return seatClasses[Math.floor(Math.random() * seatClasses.length)];
    }

    for (let i = 1; i <= seatRows; i++) {
        for (let letter of seatLetters) {
            flightSeats.push({
                seatNumber: `${i}${letter}`,
                status: "AVAILABLE",
                type: getRandomClass(),
                price: 100000, 
            });
        }
    }

    // create airports, airlines
    let airlinesSeederData = []
    for (const airline of airlines) {
        const data = {
            id: randomUUID(),
            code: airline.code,
            name: airline.name,
            terminal: `Terminal ${Math.floor(Math.random() * 3) + 1}`,
        };
        airlinesSeederData.push(data)
    }

    for (const data of airlinesSeederData) {
        await prisma.airline.create({
            data: data
        })
    }
    await prisma.airport.createMany({ data: airports });

    const airlinesMap = await prisma.airline.findMany();
    const airportsMap = await prisma.airport.findMany();

    // create user, auth
    await Promise.all(
        accountAuthData.map((name) =>
            prisma.user.create({
                data: {
                    id: randomUUID(),
                    name: name,
                    role: "BUYER",
                    familyName: "Family",
                    phoneNumber: "628123456789",
                    auth: {
                        create: {
                            id: randomUUID(),
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
                        departureAirportId: departureAirport.id,
                        arrivalDate: flight.arrivalDate,
                        destinationAirportId: destinationAirport.id,
                        capacity: flight.capacity,
                        price: flight.price,
                        code: `${flight.planeCode}.${flight.departureCityCode}.${flight.destinationCityCode}`,
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
                })
            );
        })
    );

    const users = await prisma.user.findMany();
    const transactions = [
        {
            id: randomUUID(),
            userId: users[0].id, // Replace with actual user ID
            orderId: "order-123",
            status: "pending",
            totalPrice: 100.0,
            bookingDate: new Date(),
        },
        {
            id: randomUUID(),
            userId: users[1].id, // Replace with actual user ID
            orderId: "order-124",
            status: "success",
            totalPrice: 200.0,
            bookingDate: new Date(),
        },
    ];

    const flight = await prisma.flight.findMany();
    const seats = await prisma.flightSeat.findMany();
    // Sample data for ticketTransactionDetail
    const transactionDetails = [
        {
            id: randomUUID(),
            transactionId: transactions[0].id,
            price: 50.0,
            name: "Seat A1",
            seatId: seats[0].id,
            familyName: "Smith",
            flightId: flight[0].id,
            dob: new Date("1990-01-01"),
            citizenship: "USA",
            passport: randomUUID(),
            issuingCountry: "USA",
            validityPeriod: new Date("2030-01-01"),
        },
        {
            id: randomUUID(),
            transactionId: transactions[1].id,
            price: 100.0,
            name: "Seat B1",
            seatId: seats[1].id,
            familyName: "Johnson",
            flightId: flight[0].id,
            dob: new Date("1985-01-01"),
            citizenship: "Canada",
            passport: randomUUID(),
            issuingCountry: "Canada",
            validityPeriod: new Date("2030-01-01"),
        },
    ];

    // Insert ticketTransaction data
    for (const transaction of transactions) {
        await prisma.ticketTransaction.create({
            data: transaction,
        });
    }

    // Insert ticketTransactionDetail data
    for (const detail of transactionDetails) {
        await prisma.ticketTransactionDetail.create({
            data: detail,
        });
    }

    let notificationsData = [];
    const notificationType = [
        {
            type: "Promotions",
            title: "Diskon 50% buat kamu, iya kamu 😘",
            content:
                "Dapatkan potongan 50% dalam pembelian tiket!, promo ini berlaku untuk semua penerbangan",
        },
        {
            type: "Warning",
            title: "Pesawat kamu sudah mau berangkat!",
            content:
                "Jangan sampai ketinggalan pesawat! ayo buruan Check-in, pesawat kamu akan berangkat sebentar lagi",
        },
        {
            type: "Information",
            title: "Pemberitahuan penerbangan",
            content:
                "Penerbangan anda ke Bali akan segera berangkat 2 jam lagi. ayo buruan ke gerbang keberangkatan",
        },
        {
            type: "Update",
            title: "Pembaruan Aplikasi",
            content:
                "Ada update baru loh buat aplikasi kami. Nikmati fitur baru sekarang!",
        },
    ];

    if (users.length !== 0) {
        for (const notifications of notificationType) {
            const data = {
                id: randomUUID(),
                type: notifications.type,
                notificationsTitle: notifications.title,
                notificationsContent: notifications.content,
                date: new Date("2030-01-01"),
            };
            notificationsData.push(data);
        }
    }
    for (const notifications of notificationsData) {
        await prisma.notifications.create({
            data: notifications,
        });
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
