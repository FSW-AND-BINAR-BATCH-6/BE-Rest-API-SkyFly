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
    let airlinesSeederData = [];
    for (const airline of airlines) {
        const data = {
            id: randomUUID(),
            code: airline.code,
            name: airline.name,
            terminal: `Terminal ${Math.floor(Math.random() * 3) + 1}`,
            image: "https://placehold.co/200x200",
        };
        airlinesSeederData.push(data);
    }

    for (const data of airlinesSeederData) {
        await prisma.airline.create({
            data: data,
        });
    }
    await prisma.airport.createMany({ data: airports });

    const hashedPassword = await secretHash("password");

    // create user, auth
    await Promise.all(
        accountAuthData.map(async (name) =>
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
                            password: hashedPassword,
                            isVerified: true,
                            otpToken: null,
                            secretToken: null,
                        },
                    },
                },
            })
        )
    );

    await prisma.user.create({
        data: {
            id: randomUUID(),
            name: "Mimin C1",
            role: "ADMIN",
            familyName: "Family",
            phoneNumber: "628123456789",
            auth: {
                create: {
                    id: randomUUID(),
                    email: `miminc1@test.com`,
                    password: hashedPassword,
                    isVerified: true,
                    otpToken: null,
                    secretToken: null,
                },
            },
        },
    });

    
    const airlinesMap = await prisma.airline.findMany();
    const airportsMap = await prisma.airport.findMany();

    const maxFlights = 2000;

    const AirlinesArray = airlinesMap.map((data) => data);
    const AirportArray = airportsMap.map((data) => data);

    const flightData = new Set();

    const generateFlights = () => {
        const capacity = 72;
        const price = 1500000;
        const startDate = new Date("2024-06-01T08:00:00Z");
        const msPerDay = 24 * 60 * 60 * 1000;

        let currentDate = new Date(startDate);

        while (currentDate < new Date("2024-07-31T08:00:00Z") && flightData.size < maxFlights) {
            for (const departureAirport of AirportArray) {
                const shuffledAirlines = AirlinesArray.sort(() => 0.5 - Math.random());

                const airline = shuffledAirlines[0];
                const destinationAirport = AirportArray.filter(airport => airport.id !== departureAirport.id)[Math.floor(Math.random() * (AirportArray.length - 1))];
                const departureDate = new Date(currentDate);
                const arrivalDate = new Date(departureDate.getTime() + 4 * 60 * 60 * 1000);
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
                const returnDepartureDate = new Date(departureDate.getTime() + msPerDay);
                const returnArrivalDate = new Date(returnDepartureDate.getTime() + 4 * 60 * 60 * 1000);
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

    for (const flight of flightData) {
        await prisma.flight.create({ data: JSON.parse(flight) });
    }

    const flight = await prisma.flight.findMany()
    await Promise.all(
        flight.map(async (flight) => {
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
    //! [START] Transaction
    // const transactions = [
    //     {
    //         id: randomUUID(),
    //         userId: users[0].id, // Replace with actual user ID
    //         orderId: "order-123",
    //         status: "pending",
    //         totalPrice: 100.0,
    //         tax: 3,
    //         bookingDate: new Date(),
    //         bookingCode: "ABC-12-DE",
    //     },
    //     {
    //         id: randomUUID(),
    //         userId: users[1].id, // Replace with actual user ID
    //         orderId: "order-124",
    //         status: "settlement",
    //         totalPrice: 200.0,
    //         tax: 6,
    //         bookingDate: new Date(),
    //         bookingCode: "ABC-11-EF",
    //     },
    // ];

    // const flight = await prisma.flight.findMany();
    // const seats = await prisma.flightSeat.findMany();

    // Sample data for ticketTransactionDetail
    // const transactionDetails = [
    //     {
    //         id: randomUUID(),
    //         transactionId: transactions[0].id,
    //         price: 100.0,
    //         name: "Seat A1",
    //         seatId: seats[0].id,
    //         familyName: "Smith",
    //         flightId: flight[0].id,
    //         dob: new Date("1990-01-01"),
    //         citizenship: "USA",
    //         passport: randomUUID(),
    //         issuingCountry: "USA",
    //         validityPeriod: new Date("2030-01-01"),
    //     },
    //     {
    //         id: randomUUID(),
    //         transactionId: transactions[1].id,
    //         price: 100.0,
    //         name: "Seat B1",
    //         seatId: seats[1].id,
    //         familyName: "Johnson",
    //         flightId: flight[0].id,
    //         dob: new Date("1985-01-01"),
    //         citizenship: "Canada",
    //         passport: randomUUID(),
    //         issuingCountry: "Canada",
    //         validityPeriod: new Date("2030-01-01"),
    //     },
    // ];

    // // Insert ticketTransaction data
    // for (const transaction of transactions) {
    //     await prisma.ticketTransaction.create({
    //         data: transaction,
    //     });
    // }

    // // Insert ticketTransactionDetail data
    // for (const detail of transactionDetails) {
    //     await prisma.ticketTransactionDetail.create({
    //         data: detail,
    //     });
    // }

    //! [END] Transaction

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
