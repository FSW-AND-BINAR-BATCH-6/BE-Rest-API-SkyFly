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
            image: "",
        },
        {
            name: "Ngurah Rai International Airport",
            code: "DPS",
            country: "Indonesia",
            city: "Denpasar",
            continent: "Asia",
            image: "",
        },
        {
            name: "Juanda International Airport",
            code: "SUB",
            country: "Indonesia",
            city: "Surabaya",
            continent: "Asia",
            image: "",
        },
        {
            name: "Kuala Namu International Airport",
            code: "KNO",
            country: "Indonesia",
            city: "Medan",
            continent: "Asia",
            image: "",
        },
        {
            name: "Sultan Hasanuddin International Airport",
            code: "UPG",
            country: "Indonesia",
            city: "Makassar",
            continent: "Asia",
            image: "",
        },
        {
            name: "Ahmad Yani International Airport",
            code: "SRG",
            country: "Indonesia",
            city: "Semarang",
            continent: "Asia",
            image: "",
        },
        {
            name: "Husein Sastranegara International Airport",
            code: "BDO",
            country: "Indonesia",
            city: "Bandung",
            continent: "Asia",
            image: "",
        },
        {
            name: "Adisutjipto International Airport",
            code: "JOG",
            country: "Indonesia",
            city: "Yogyakarta",
            continent: "Asia",
            image: "",
        },
        {
            name: "Sepinggan International Airport",
            code: "BPN",
            country: "Indonesia",
            city: "Balikpapan",
            continent: "Asia",
            image: "",
        },
        {
            name: "Sultan Syarif Kasim II International Airport",
            code: "PKU",
            country: "Indonesia",
            city: "Pekanbaru",
            continent: "Asia",
            image: "",
        },
        {
            name: "Los Angeles International Airport",
            code: "LAX",
            country: "USA",
            city: "Los Angeles",
            continent: "America",
            image: "",
        },
        {
            name: "Heathrow Airport",
            code: "LHR",
            country: "United Kingdom",
            city: "London",
            continent: "Europe",
            image: "",
        },
        {
            name: "Changi Airport",
            code: "SIN",
            country: "Singapore",
            city: "Singapore",
            continent: "Asia",
            image: "",
        },
        {
            name: "Haneda Airport",
            code: "HND",
            country: "Japan",
            city: "Tokyo",
            continent: "Asia",
            image: "",
        },
        {
            name: "Dubai International Airport",
            code: "DXB",
            country: "UAE",
            city: "Dubai",
            continent: "Asia",
            image: "",
        },
        {
            name: "Charles de Gaulle Airport",
            code: "CDG",
            country: "France",
            city: "Paris",
            continent: "Europe",
            image: "",
        },
        {
            name: "Frankfurt Airport",
            code: "FRA",
            country: "Germany",
            city: "Frankfurt",
            continent: "Europe",
            image: "",
        },
        {
            name: "Sydney Kingsford Smith Airport",
            code: "SYD",
            country: "Australia",
            city: "Sydney",
            continent: "Australia",
            image: "",
        },
        {
            name: "Hong Kong International Airport",
            code: "HKG",
            country: "Hong Kong",
            city: "Hong Kong",
            continent: "Asia",
            image: "",
        },
        {
            name: "John F. Kennedy International Airport",
            code: "JFK",
            country: "USA",
            city: "New York",
            continent: "America",
            image: "",
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
    ];

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

    for(const data of airlinesSeederData){
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
