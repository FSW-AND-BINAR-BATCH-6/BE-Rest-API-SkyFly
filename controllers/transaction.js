require("dotenv/config");
const { randomUUID } = require("crypto");
const { coreApi, snap } = require("../config/coreApiMidtrans");
const createHttpError = require("http-errors");
const {
    totalPrice,
    parameterMidtrans,
    totalNormalPrice,
} = require("../utils/parameterMidtrans");
const { checkSeatAvailability } = require("../utils/checkSeat");
const {
    formatDate,
    formatTime,
    formatMonthAndYear,
} = require("../utils/formatDate");
const { calculateFlightDuration } = require("../utils/calculateDuration");
const { PrismaClient } = require("@prisma/client");
const { generateBookingCode } = require("../utils/generateBookingCode");
const prisma = new PrismaClient();

const getTransaction = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        // encode serverKey for authorization get transaction status
        const encodedServerKey = btoa(`${process.env.SANDBOX_SERVER_KEY}:`);

        const url = `https://api.sandbox.midtrans.com/v2/${orderId}/status`;
        const options = {
            method: "GET",
            headers: {
                accept: "application/json",
                authorization: `Basic ${encodedServerKey}`,
            },
        };

        const response = await fetch(url, options);
        const transaction = await response.json();

        if (transaction.status_code === "404") {
            return next(
                createHttpError(422, {
                    message: "Transaction doesn't exist",
                })
            );
        }

        res.status(200).json({
            status: true,
            message: "Transaction data retrieved successfully",
            data: {
                transaction_status: transaction.transaction_status,
                payment_status: transaction.fraud_status,
                transaction_id: transaction.transaction_id,
                order_id: transaction.order_id,
                merchant_id: transaction.merchant_id,
                currency: transaction.currency,
                gross_amount: transaction.gross_amount,
                payment_type: transaction.payment_type,
                transaction_time: transaction.transaction_time,
                expiry_time: transaction.expiry_time,
                signature_key: transaction.signature_key,
                va_numbers: transaction.va_numbers,
            },
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const cancelTransaction = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        // encode serverKey for authorization get transaction status
        const encodedServerKey = btoa(`${process.env.SANDBOX_SERVER_KEY}:`);

        const url = `https://api.sandbox.midtrans.com/v2/${orderId}/cancel`;
        const options = {
            method: "POST",
            headers: {
                accept: "application/json",
                authorization: `Basic ${encodedServerKey}`,
            },
        };

        const response = await fetch(url, options);
        const transaction = await response.json();

        if (transaction.status_code === "404") {
            return next(
                createHttpError(422, {
                    message: "Transaction doesn't exist",
                })
            );
        }
        const ticketTransaction = await prisma.ticketTransaction.findUnique({
            where: {
                orderId,
            },
            include: {
                Transaction_Detail: true,
            },
        });

        const seatIds = ticketTransaction.Transaction_Detail.map(
            (data) => data.seatId
        );

        let where = {
            id: {
                in: seatIds,
            },
        };

        await prisma.$transaction(async (tx) => {
            // and response with 200 OK
            await tx.ticketTransaction.update({
                where: {
                    orderId,
                },
                data: {
                    status: "cancel",
                },
            });

            await tx.flightSeat.updateMany({
                where,
                data: {
                    status: "AVAILABLE",
                },
            });
        });

        res.status(200).json({
            status: true,
            message: "Transaction canceled successfully",
            data: {
                transaction_status: transaction.transaction_status,
                payment_status: transaction.fraud_status,
                transaction_id: transaction.transaction_id,
                order_id: transaction.order_id,
                merchant_id: transaction.merchant_id,
                currency: transaction.currency,
                gross_amount: transaction.gross_amount,
                payment_type: transaction.payment_type,
                transaction_time: transaction.transaction_time,
                expiry_time: transaction.expiry_time,
                signature_key: transaction.signature_key,
                va_numbers: transaction.va_numbers,
            },
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const notification = async (req, res) => {
    const data = req.body;
    const ticketTransaction = await prisma.ticketTransaction.findUnique({
        where: {
            orderId: data.order_id,
        },
        include: {
            Transaction_Detail: true,
        },
    });

    const seatIds = ticketTransaction.Transaction_Detail.map(
        (data) => data.seatId
    );

    let where = {
        id: {
            in: seatIds,
        },
    };

    let notification = {
        currency: req.body.currency,
        fraud_status: req.body.fraud_status,
        gross_amount: req.body.gross_amount,
        order_id: req.body.order_id,
        payment_type: req.body.payment_type,
        status_code: req.body.status_code,
        status_message: req.body.status_message,
        transaction_id: req.body.transaction_id,
        transaction_status: req.body.transaction_status,
        transaction_time: req.body.transaction_time,
        merchant_id: req.body.merchant_id,
    };

    let datas = await snap.transaction.notification(notification);

    await prisma.ticketTransaction.update({
        where: {
            orderId: datas.order_id,
        },
        data: {
            status: datas.transaction_status,
        },
    });

    if (datas.transaction_status == "capture") {
        if (datas.fraud_status == "accept") {
            // TODO set transaction status on your database to 'success'
            // and response with 200 OK

            await prisma.flightSeat.updateMany({
                where,
                data: {
                    status: "BOOKED",
                },
            });

            const dataTransaction = await prisma.ticketTransaction.findUnique({
                where: {
                    orderId: data.order_id,
                },
                include: {
                    Transaction_Detail: true,
                },
            });

            if (!dataTransaction) {
                return next(createHttpError(404, "Transaction not found"));
            }

            const ticketFlightIds = dataTransaction.Transaction_Detail.map(
                (data) => data.flightId
            );
            const ticketSeatIds = dataTransaction.Transaction_Detail.map(
                (data) => data.seatId
            );

            const flights = await prisma.flight.findMany({
                where: {
                    id: {
                        in: ticketFlightIds,
                    },
                },
                include: {
                    plane: true,
                    departureAirport: true,
                },
            });

            if (flights.length === 0) {
                return next(createHttpError(404, "Flight not found"));
            }

            const seats = await prisma.flightSeat.findMany({
                where: {
                    id: {
                        in: ticketSeatIds,
                    },
                },
            });

            if (seats.length === 0) {
                return next(createHttpError(404, "Seat not found"));
            }

            const airlineCode = flights[0].plane.code;
            const airportCode = flights[0].departureAirport.code;
            const flightCode = flights[0].code;

            // Create the new ticket
            seats.map(async (seat) => {
                let uniqueCode = `${airlineCode}-${airportCode}-${flightCode}-${seat.seatNumber}`;

                const existingTicket = await prisma.ticket.findUnique({
                    where: { code: uniqueCode },
                });
                console.log("capture - tiket akan dibuat");

                if (existingTicket) {
                    return next(
                        createHttpError(422, {
                            message: "ticket is already exist",
                        })
                    );
                }

                await prisma.ticket.create({
                    data: {
                        userId: dataTransaction.userId,
                        flightId: ticketFlightIds[0],
                        seatId: seat.id,
                        code: uniqueCode,
                        ticketTransactionId: dataTransaction.id,
                    },
                });

                console.log("capture - masuk tiket dibuat");
                res.status(200).json({ message: "OK" });
            });
        }
    } else if (datas.transaction_status == "settlement") {
        // TODO set transaction status on your database to 'success'
        // and response with 200 OK
        await prisma.flightSeat.updateMany({
            where,
            data: {
                status: "BOOKED",
            },
        });

        const dataTransaction = await prisma.ticketTransaction.findUnique({
            where: {
                orderId: data.order_id,
            },
            include: {
                Transaction_Detail: true,
            },
        });

        if (!dataTransaction) {
            return next(createHttpError(404, "Transaction not found"));
        }

        const ticketFlightIds = dataTransaction.Transaction_Detail.map(
            (data) => data.flightId
        );
        const ticketSeatIds = dataTransaction.Transaction_Detail.map(
            (data) => data.seatId
        );

        const flights = await prisma.flight.findMany({
            where: {
                id: {
                    in: ticketFlightIds,
                },
            },
            include: {
                plane: true,
                departureAirport: true,
            },
        });

        if (flights.length === 0) {
            return next(createHttpError(404, "Flight not found"));
        }

        const seats = await prisma.flightSeat.findMany({
            where: {
                id: {
                    in: ticketSeatIds,
                },
            },
        });

        if (seats.length === 0) {
            return next(createHttpError(404, "Seat not found"));
        }

        const airlineCode = flights[0].plane.code;
        const airportCode = flights[0].departureAirport.code;
        const flightCode = flights[0].code;

        // Create the new ticket
        seats.map(async (seat) => {
            let uniqueCode = `${airlineCode}-${airportCode}-${flightCode}-${seat.seatNumber}`;

            const existingTicket = await prisma.ticket.findUnique({
                where: { code: uniqueCode },
            });

            if (existingTicket) {
                return next(
                    createHttpError(422, { message: "ticket is already exist" })
                );
            }

            console.log("settlement - tiket akan dibuat");

            await prisma.ticket.create({
                data: {
                    userId: dataTransaction.userId,
                    flightId: ticketFlightIds[0],
                    seatId: seat.id,
                    code: uniqueCode,
                    ticketTransactionId: dataTransaction.id,
                },
                include: {
                    flight: true,
                    user: true,
                    seat: true,
                    ticketTransaction: true,
                },
            });
            console.log("settlement - tiket dibuat");
            res.status(200).json({ message: "OK" });
        });
    } else if (
        datas.transaction_status == "cancel" ||
        datas.transaction_status == "deny" ||
        datas.transaction_status == "expire"
    ) {
        // TODO set transaction status on your database to 'failure'
        // and response with 200 OK
        await prisma.flightSeat.updateMany({
            where,
            data: {
                status: "AVAILABLE",
            },
        });
    } else if (datas.transaction_status == "pending") {
        // TODO set transaction status on your database to 'pending' / waiting payment
        // and response with 200 OK
        await prisma.flightSeat.updateMany({
            where,
            data: {
                status: "OCCUPIED",
            },
        });
    }

    // end try
    res.status(200).send("OK");
};

const snapPayment = async (req, res, next) => {
    try {
        let { flightId } = req.query;

        const { passengers, orderer } = await parameterMidtrans(req.body);

        const seats = await prisma.flightSeat.findMany({
            where: {
                id: {
                    in: passengers.map((passenger) => passenger.seatId),
                },
            },
        });

        const { error, seatNumber } = await checkSeatAvailability(
            seats,
            flightId,
            passengers
        );

        if (error.flight) {
            return next(
                createHttpError(404, { message: "Flight is not found" })
            );
        }
        if (error.seat) {
            return next(createHttpError(404, { message: "Seat is not found" }));
        }
        if (error.booked) {
            return next(
                createHttpError(400, {
                    message: `Seat in this flight with seat number: ${seatNumber.join(
                        " & "
                    )} is booked`,
                })
            );
        }

        let parameter = {
            credit_card: {
                secure: true,
            },
            transaction_details: {
                gross_amount: await totalPrice(passengers),
                order_id: randomUUID(),
            },
            item_details: passengers,
            customer_details: orderer,
        };

        try {
            const bookingCode = await generateBookingCode(passengers);
            let normalPrice = await totalNormalPrice(passengers);
            let tax = parameter.transaction_details.gross_amount - normalPrice;

            await prisma.$transaction(async (tx) => {
                const response = await snap.createTransaction(parameter);

                const transaction = await tx.ticketTransaction.create({
                    data: {
                        userId: req.user.id, // req.user.id (from user loggedIn)
                        orderId: parameter.transaction_details.order_id,
                        status: "pending",
                        totalPrice: parameter.transaction_details.gross_amount,
                        tax: tax,
                        bookingDate: new Date().toISOString(),
                        bookingCode,
                    },
                });

                await Promise.all(
                    passengers.map(async (passenger) => {
                        await tx.ticketTransactionDetail.create({
                            data: {
                                id: randomUUID(),
                                transactionId: transaction.id,
                                price: parseFloat(passenger.normalPrice),
                                name: passenger.name,
                                type: passenger.type,
                                seatId: passenger.seatId,
                                familyName: passenger.familyName,
                                flightId,
                                dob: passenger.dob,
                                citizenship: passenger.citizenship,
                                passport: passenger.passport,
                                issuingCountry: passenger.issuingCountry,
                                validityPeriod: passenger.validityPeriod,
                            },
                        });
                    })
                );

                await tx.flightSeat.updateMany({
                    where: {
                        id: {
                            in: passengers.map((passenger) => passenger.seatId),
                        },
                    },
                    data: {
                        status: "OCCUPIED",
                    },
                });

                res.status(200).json({
                    status: true,
                    message: "Transaction created successfully",
                    _token: response.token,
                    redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${response.token}`,
                    transactionId: transaction.id,
                    data: {
                        orderer,
                        passengers,
                    },
                });
            });
        } catch (error) {
            return next(
                createHttpError(422, {
                    message: error.message,
                })
            );
        }
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const bankTransfer = async (req, res, next) => {
    try {
        let data = req.body;
        let { flightId } = req.query;

        const { passengers, orderer } = await parameterMidtrans(req.body);

        const seats = await prisma.flightSeat.findMany({
            where: {
                id: {
                    in: passengers.map((passenger) => passenger.seatId),
                },
            },
        });

        const { error, seatNumber } = await checkSeatAvailability(
            seats,
            flightId,
            passengers
        );

        if (error.flight) {
            return next(
                createHttpError(404, { message: "Flight is not found" })
            );
        }
        if (error.seat) {
            return next(createHttpError(404, { message: "Seat is not found" }));
        }
        if (error.booked) {
            return next(
                createHttpError(400, {
                    message: `Seat in this flight with seat number: ${seatNumber.join(
                        " & "
                    )} is booked`,
                })
            );
        }

        if (data.bank) {
            data.payment_type = "bank_transfer";
            const allowedBanks = [
                "bca",
                "bni",
                "bri",
                "mandiri",
                "permata",
                "cimb",
            ];

            if (!allowedBanks.includes(data.bank)) {
                return next(
                    createHttpError(422, {
                        message: `Allowed Banks: ${allowedBanks.join(", ")}`,
                    })
                );
            }
        }

        const allowedPaymentTypes = ["bank_transfer", "echannel", "permata"];
        let parameter;

        if (!allowedPaymentTypes.includes(data.payment_type)) {
            return next(
                createHttpError(422, {
                    message: `Allowed payment types: ${allowedPaymentTypes.join(
                        ", "
                    )}`,
                })
            );
        }

        if (data.payment_type !== "bank_transfer") {
            // permata
            if (data.payment_type === "permata") {
                parameter = {
                    payment_type: "permata",
                    transaction_details: {
                        gross_amount: await totalPrice(passengers),
                        order_id: randomUUID(),
                    },
                    customer_details: orderer,
                    item_details: passengers,
                };
            } else {
                // mandiri / mandiri bill
                parameter = {
                    payment_type: "echannel",
                    echannel: {
                        bill_info1: "Payment:",
                        bill_info2: "Online purchase",
                    },
                    transaction_details: {
                        gross_amount: await totalPrice(passengers),
                        order_id: randomUUID(),
                    },
                    customer_details: orderer,
                    item_details: passengers,
                };
            }
        } else {
            parameter = {
                payment_type: "bank_transfer",
                bank_transfer: {
                    bank: data.bank,
                },
                transaction_details: {
                    gross_amount: await totalPrice(passengers),
                    order_id: randomUUID(),
                },
                customer_details: orderer,
                item_details: passengers,
            };
        }

        try {
            const bookingCode = await generateBookingCode(passengers);
            let normalPrice = await totalNormalPrice(passengers);
            let tax = parameter.transaction_details.gross_amount - normalPrice;

            await prisma.$transaction(async (tx) => {
                const response = await coreApi.charge(parameter);

                const transaction = await tx.ticketTransaction.create({
                    data: {
                        userId: req.user.id, // req.user.id (from user loggedIn)
                        orderId: parameter.transaction_details.order_id,
                        status: "pending",
                        totalPrice: parameter.transaction_details.gross_amount,
                        tax,
                        bookingDate: new Date().toISOString(),
                        bookingCode,
                    },
                });

                await Promise.all(
                    passengers.map(async (passenger) => {
                        await tx.ticketTransactionDetail.create({
                            data: {
                                id: randomUUID(),
                                transactionId: transaction.id,
                                price: parseFloat(passenger.normalPrice),
                                name: passenger.name,
                                type: passenger.type,
                                seatId: passenger.seatId,
                                familyName: passenger.familyName,
                                flightId,
                                dob: passenger.dob,
                                citizenship: passenger.citizenship,
                                passport: passenger.passport,
                                issuingCountry: passenger.issuingCountry,
                                validityPeriod: passenger.validityPeriod,
                            },
                        });
                    })
                );

                let seatId = seats.map((seat) => {
                    return seat.id;
                });

                await tx.flightSeat.updateMany({
                    where: {
                        id: {
                            in: passengers.map((passenger) => passenger.seatId),
                        },
                    },
                    data: {
                        status: "OCCUPIED",
                    },
                });

                res.status(200).json({
                    status: true,
                    message: "Bank VA created successfully",
                    data: {
                        payment_type: response.payment_type,
                        transaction_id: response.transaction_id,
                        order_id: response.order_id,
                        gross_amount: response.gross_amount,
                        transaction_time: response.transaction_time,
                        transaction_status: response.transaction_status,
                        payment_status: response.fraud_status,
                        expiry_time: response.expiry_time,
                        va_numbers: response.va_numbers,
                        flightId: flightId,
                        seatId: seatId,
                        orderer: orderer,
                        passengers: passengers,
                    },
                });
            });
        } catch (error) {
            return next(
                createHttpError(422, {
                    message: error.message,
                })
            );
        }
    } catch (error) {
        next(createHttpError(500, error.message));
    }
};

const creditCard = async (req, res, next) => {
    try {
        let data = req.body;
        let { flightId } = req.query;

        const { passengers, orderer } = await parameterMidtrans(req.body);

        const seats = await prisma.flightSeat.findMany({
            where: {
                id: {
                    in: passengers.map((passenger) => passenger.seatId),
                },
            },
        });

        const { error, seatNumber } = await checkSeatAvailability(
            seats,
            flightId,
            passengers
        );

        if (error.flight) {
            return next(
                createHttpError(404, { message: "Flight is not found" })
            );
        }
        if (error.seat) {
            return next(createHttpError(404, { message: "Seat is not found" }));
        }
        if (error.booked) {
            return next(
                createHttpError(400, {
                    message: `Seat in this flight with seat number: ${seatNumber.join(
                        " & "
                    )} is booked`,
                })
            );
        }

        let cardParameter = {
            card_number: data.card_number,
            card_exp_month: data.card_exp_month,
            card_exp_year: data.card_exp_year,
            card_cvv: data.card_cvv,
            client_key: coreApi.apiConfig.clientKey,
        };

        const cardResponse = await coreApi.cardToken(cardParameter);
        const cardToken = cardResponse.token_id;

        let parameter = {
            payment_type: "credit_card",
            credit_card: {
                token_id: cardToken,
                authentication: true,
                secure: true,
            },
            transaction_details: {
                gross_amount: await totalPrice(passengers),
                order_id: randomUUID(),
            },
            customer_details: orderer,
            item_details: passengers,
        };

        try {
            const bookingCode = await generateBookingCode(passengers);
            let normalPrice = await totalNormalPrice(passengers);
            let tax = parameter.transaction_details.gross_amount - normalPrice;

            await prisma.$transaction(async (tx) => {
                const response = await coreApi.charge(parameter);
                const transaction = await tx.ticketTransaction.create({
                    data: {
                        userId: req.user.id, // req.user.id (from user loggedIn)
                        orderId: parameter.transaction_details.order_id,
                        status: "pending",
                        totalPrice: parameter.transaction_details.gross_amount,
                        tax,
                        bookingDate: new Date().toISOString(),
                        bookingCode,
                    },
                });

                await Promise.all(
                    passengers.map(async (passenger) => {
                        await tx.ticketTransactionDetail.create({
                            data: {
                                id: randomUUID(),
                                transactionId: transaction.id,
                                price: parseFloat(passenger.normalPrice),
                                name: passenger.name,
                                type: data.type,
                                seatId: passenger.seatId,
                                familyName: passenger.familyName,
                                flightId,
                                dob: passenger.dob,
                                citizenship: passenger.citizenship,
                                passport: passenger.passport,
                                issuingCountry: passenger.issuingCountry,
                                validityPeriod: passenger.validityPeriod,
                            },
                        });
                    })
                );

                await tx.flightSeat.updateMany({
                    where: {
                        id: {
                            in: passengers.map((passenger) => passenger.seatId),
                        },
                    },
                    data: {
                        status: "OCCUPIED",
                    },
                });

                res.status(200).json({
                    status: true,
                    message: "CC Token & Transaction successfully",
                    _token: cardToken,
                    data: {
                        payment_type: response.payment_type,
                        card_type: response.card_type,
                        transaction_id: response.transaction_id,
                        order_id: response.order_id,
                        gross_amount: response.gross_amount,
                        transaction_time: response.transaction_time,
                        transaction_status: response.transaction_status,
                        payment_status: response.fraud_status,
                        expiry_time: response.expiry_time,
                        redirect_url: response.redirect_url,
                        bank: response.bank,
                        orderer,
                        passengers,
                    },
                });
            });
        } catch (error) {
            return next(
                createHttpError(422, {
                    message: error.message,
                })
            );
        }
    } catch (error) {
        next(
            createHttpError(500, {
                message: error.message,
            })
        );
    }
};

const gopay = async (req, res, next) => {
    try {
        let { flightId } = req.query;

        const { passengers, orderer } = await parameterMidtrans(req.body);
        console.log(passengers);
        const seats = await prisma.flightSeat.findMany({
            where: {
                id: {
                    in: passengers.map((passenger) => passenger.seatId),
                },
            },
        });

        const { error, seatNumber } = await checkSeatAvailability(
            seats,
            flightId,
            passengers
        );

        if (error.flight) {
            return next(
                createHttpError(404, { message: "Flight is not found" })
            );
        }
        console.log(seats);
        if (error.seat) {
            console.log("seat");
            return next(createHttpError(404, { message: "Seat is not found" }));
        }
        if (error.booked) {
            return next(
                createHttpError(400, {
                    message: `Seat in this flight with seat number: ${seatNumber.join(
                        " & "
                    )} is booked`,
                })
            );
        }

        let parameter = {
            payment_type: "gopay",
            transaction_details: {
                gross_amount: await totalPrice(passengers),
                order_id: randomUUID(),
            },
            customer_details: orderer,
            item_details: passengers,
        };

        try {
            const bookingCode = await generateBookingCode(passengers);
            let normalPrice = await totalNormalPrice(passengers);
            let tax = parameter.transaction_details.gross_amount - normalPrice;

            await prisma.$transaction(async (tx) => {
                const response = await coreApi.charge(parameter);

                const transaction = await tx.ticketTransaction.create({
                    data: {
                        userId: req.user.id, // req.user.id (from user loggedIn)
                        orderId: parameter.transaction_details.order_id,
                        status: "pending",
                        totalPrice: parameter.transaction_details.gross_amount,
                        tax,
                        bookingDate: new Date().toISOString(),
                        bookingCode,
                    },
                });

                await Promise.all(
                    passengers.map(async (passenger) => {
                        await tx.ticketTransactionDetail.create({
                            data: {
                                id: randomUUID(),
                                transactionId: transaction.id,
                                price: parseFloat(passenger.normalPrice),
                                name: passenger.name,
                                type: passenger.type,
                                seatId: passenger.seatId,
                                familyName: passenger.familyName,
                                flightId,
                                dob: passenger.dob,
                                citizenship: passenger.citizenship,
                                passport: passenger.passport,
                                issuingCountry: passenger.issuingCountry,
                                validityPeriod: passenger.validityPeriod,
                            },
                        });
                    })
                );

                await tx.flightSeat.updateMany({
                    where: {
                        id: {
                            in: passengers.map((passenger) => passenger.seatId),
                        },
                    },
                    data: {
                        status: "OCCUPIED",
                    },
                });

                res.status(200).json({
                    status: true,
                    message: "Gopay transaction created successfully",
                    data: {
                        payment_type: response.payment_type,
                        transaction_id: response.transaction_id,
                        order_id: response.order_id,
                        gross_amount: response.gross_amount,
                        transaction_time: response.transaction_time,
                        transaction_status: response.transaction_status,
                        payment_status: response.fraud_status,
                        expiry_time: response.expiry_time,
                        action: response.actions,
                        orderer,
                        passengers,
                    },
                });
            });
        } catch (error) {
            return next(
                createHttpError(422, {
                    message: error.message,
                })
            );
        }
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const getAllTransactionByUserLoggedIn = async (req, res, next) => {
    try {
        let { startDate, endDate, flightCode } = req.query;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const parseStartDate = new Date(startDate);
        const parseEndDate = new Date(endDate);

        let transactionCondition = {
            userId: req.user.id,
        };
        let flightCondition;

        if (startDate && endDate) {
            transactionCondition = {
                userId: req.user.id,
                bookingDate: {
                    gte: new Date(parseStartDate.setHours(0, 0, 0, 0)),
                    lt: new Date(parseEndDate.setHours(23, 59, 59, 0)),
                },
            };
        } else if (startDate) {
            transactionCondition = {
                userId: req.user.id,
                bookingDate: {
                    gte: new Date(parseStartDate.setHours(0, 0, 0, 0)),
                },
            };
        } else if (endDate) {
            transactionCondition = {
                userId: req.user.id,
                bookingDate: {
                    lt: new Date(parseEndDate.setHours(23, 59, 59, 0)),
                },
            };
        }

        if (flightCode) {
            flightCondition = {
                code: {
                    contains: flightCode,
                    mode: "insensitive",
                },
            };
        }

        const transactions = await prisma.ticketTransaction.findMany({
            skip: offset,
            take: limit,
            include: {
                Transaction_Detail: {
                    include: {
                        flight: {
                            where: flightCondition,
                            include: {
                                plane: true,
                                transitAirport: true,
                                departureAirport: true,
                                destinationAirport: true,
                            },
                        },
                        seat: true,
                    },
                },
            },
            where: transactionCondition,
        });

        const count = await prisma.ticketTransaction.count({
            where: {
                userId: req.user.id,
            },
        });

        const filteredTransactions = transactions.filter((transaction) =>
            transaction.Transaction_Detail.some(
                (detail) => detail.flight !== null
            )
        );

        let response = [];

        filteredTransactions.forEach((data) => {
            data.Transaction_Detail.map((detail) => {
                const currentDate = formatMonthAndYear(data.bookingDate);

                if (!response[currentDate]) {
                    response.push(
                        (response[currentDate] = {
                            date: currentDate,
                            transactions: [],
                        })
                    );
                }
                response[currentDate].transactions.push({
                    id: data.id,
                    orderId: data.orderId,
                    userId: data.userId,
                    tax: data.tax,
                    totalPrice: data.totalPrice,
                    status: data.status,
                    booking: {
                        date: formatDate(data.bookingDate),
                        time: formatTime(data.bookingDate),
                        code: data.bookingCode,
                    },
                    Transaction_Detail: [
                        {
                            id: detail.id,
                            transactionId: detail.transactionId,
                            totalPrice: detail.price,
                            name: detail.name,
                            passengerCategory: detail.type,
                            familyName: detail.familyName,
                            dob: formatDate(detail.dob),
                            citizenship: detail.citizenship,
                            passport: detail.passport,
                            issuingCountry: detail.issuingCountry,
                            validityPeriod: formatDate(detail.validityPeriod),
                            flight: {
                                id: detail.flight.id,
                                code: detail.flight.code,
                                departure: {
                                    date: formatDate(
                                        detail.flight.departureDate
                                    ),
                                    time: formatTime(
                                        detail.flight.departureDate
                                    ),
                                },
                                arrival: {
                                    date: formatDate(detail.flight.arrivalDate),
                                    time: formatTime(detail.flight.arrivalDate),
                                },
                                flightPrice: detail.flight.price,
                                flightDuration: calculateFlightDuration(
                                    detail.flight.departureDate,
                                    detail.flight.arrivalDate
                                ),
                                airline: {
                                    id: detail.flight.plane.id,
                                    code: detail.flight.plane.code,
                                    name: detail.flight.plane.name,
                                    image: detail.flight.plane.image,
                                    terminal: detail.flight.plane.terminal,
                                },
                                departureAirport: {
                                    id: detail.flight.departureAirport.id,
                                    code: detail.flight.departureAirport.code,
                                    name: detail.flight.departureAirport.name,
                                    city: detail.flight.departureAirport.city,
                                    country:
                                        detail.flight.departureAirport.country,
                                    continent:
                                        detail.flight.departureAirport
                                            .continent,
                                    image: detail.flight.departureAirport.image,
                                },
                                destinationAirport: {
                                    id: detail.flight.destinationAirport.id,
                                    code: detail.flight.destinationAirport.code,
                                    name: detail.flight.destinationAirport.name,
                                    city: detail.flight.destinationAirport.city,
                                    country:
                                        detail.flight.destinationAirport
                                            .country,
                                    continent:
                                        detail.flight.destinationAirport
                                            .continent,
                                    image: detail.flight.destinationAirport
                                        .image,
                                },
                            },
                            seat: {
                                id: detail.seat.id,
                                flightId: detail.seat.id,
                                seatNumber: detail.seat.seatNumber,
                                status: detail.seat.status,
                                type: detail.seat.type,
                                seatPrice: detail.seat.price,
                            },
                        },
                    ],
                });
            });
        });

        res.status(200).json({
            status: true,
            message: "All transaction data retrieved successfully",
            totalItems: count,
            pagination: {
                totalPage: Math.ceil(count / limit),
                currentPage: page,
                pageItems: filteredTransactions.length,
                nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null,
            },
            data: response,
        });
    } catch (error) {
        next(
            createHttpError(500, {
                message: error.message,
            })
        );
    }
};

const getTransactionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ticketTransaction = await prisma.ticketTransaction.findUnique({
            where: {
                id,
                userId: req.user.id,
            },
            include: {
                Transaction_Detail: {
                    include: {
                        flight: {
                            include: {
                                plane: true,
                                transitAirport: true,
                                departureAirport: true,
                                destinationAirport: true,
                            },
                        },
                        seat: true,
                    },
                },
            },
        });

        if (!ticketTransaction) {
            return next(createHttpError(404, "Transaction not found"));
        }

        let response = {
            id: ticketTransaction.id,
            orderId: ticketTransaction.orderId,
            userId: ticketTransaction.userId,
            tax: ticketTransaction.tax,
            totalPrice: ticketTransaction.totalPrice,
            status: ticketTransaction.status,
            booking: {
                date: formatDate(ticketTransaction.bookingDate),
                time: formatTime(ticketTransaction.bookingDate),
                code: ticketTransaction.bookingCode,
            },
            Transaction_Detail: [],
        };

        ticketTransaction.Transaction_Detail.map((detail) => {
            response.Transaction_Detail.push({
                id: detail.id,
                transactionId: detail.transactionId,
                totalPrice: detail.price,
                name: detail.name,
                passengerCategory: detail.type,
                familyName: detail.familyName,
                dob: formatDate(detail.dob),
                citizenship: detail.citizenship,
                passport: detail.passport,
                issuingCountry: detail.issuingCountry,
                validityPeriod: formatDate(detail.validityPeriod),
                flight: {
                    id: detail.flight.id,
                    code: detail.flight.code,
                    departure: {
                        date: formatDate(detail.flight.departureDate),
                        time: formatTime(detail.flight.departureDate),
                    },
                    arrival: {
                        date: formatDate(detail.flight.arrivalDate),
                        time: formatTime(detail.flight.arrivalDate),
                    },
                    flightPrice: detail.flight.price,
                    flightDuration: calculateFlightDuration(
                        detail.flight.departureDate,
                        detail.flight.arrivalDate
                    ),
                    airline: {
                        id: detail.flight.plane.id,
                        code: detail.flight.plane.code,
                        name: detail.flight.plane.name,
                        image: detail.flight.plane.image,
                        terminal: detail.flight.plane.terminal,
                    },
                    departureAirport: {
                        id: detail.flight.departureAirport.id,
                        code: detail.flight.departureAirport.code,
                        name: detail.flight.departureAirport.name,
                        city: detail.flight.departureAirport.city,
                        country: detail.flight.departureAirport.country,
                        continent: detail.flight.departureAirport.continent,
                        image: detail.flight.departureAirport.image,
                    },
                    destinationAirport: {
                        id: detail.flight.destinationAirport.id,
                        code: detail.flight.destinationAirport.code,
                        name: detail.flight.destinationAirport.name,
                        city: detail.flight.destinationAirport.city,
                        country: detail.flight.destinationAirport.country,
                        continent: detail.flight.destinationAirport.continent,
                        image: detail.flight.destinationAirport.image,
                    },
                },
                seat: {
                    id: detail.seat.id,
                    flightId: detail.seat.id,
                    seatNumber: detail.seat.seatNumber,
                    status: detail.seat.status,
                    type: detail.seat.type,
                    seatPrice: detail.seat.price,
                },
            });
        });

        res.status(200).json({
            status: true,
            message: "ticket transaction data retrieved successfully",
            data: response,
        });
    } catch (error) {
        next(createHttpError(500, error.message));
    }
};

//TODO: dashboard action

const getAllTransaction = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const transactions = await prisma.ticketTransaction.findMany({
            skip: offset,
            take: limit,
            include: {
                Transaction_Detail: true,
            },
        });

        const count = await prisma.ticketTransaction.count();

        res.status(200).json({
            status: true,
            message: "All transaction data retrieved successfully",
            totalItems: count,
            pagination: {
                totalPage: Math.ceil(count / limit),
                currentPage: page,
                pageItems: transactions.length,
                nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null,
            },
            data: transactions,
        });
    } catch (error) {
        next(
            createHttpError(500, {
                message: error.message,
            })
        );
    }
};

const getAdminTransactionById = async (req, res, next) => {
    // get transaction data by id from ticketTransaction & include ticketTransaction detail
    try {
        const { id } = req.params;
        const ticketTransaction = await prisma.ticketTransaction.findUnique({
            where: { id },
            include: {
                Transaction_Detail: {
                    include: {
                        flight: {
                            include: {
                                plane: true,
                                transitAirport: true,
                                departureAirport: true,
                                destinationAirport: true,
                            },
                        },
                        seat: true,
                    },
                },
            },
        });

        if (!ticketTransaction) {
            return next(createHttpError(404, "Transaction not found"));
        }

        let response = {
            id: ticketTransaction.id,
            orderId: ticketTransaction.orderId,
            userId: ticketTransaction.userId,
            tax: ticketTransaction.tax,
            totalPrice: ticketTransaction.totalPrice,
            status: ticketTransaction.status,
            booking: {
                date: formatDate(ticketTransaction.bookingDate),
                time: formatTime(ticketTransaction.bookingDate),
                code: ticketTransaction.bookingCode,
            },
            Transaction_Detail: [],
        };

        ticketTransaction.Transaction_Detail.map((detail) => {
            response.Transaction_Detail.push({
                id: detail.id,
                transactionId: detail.transactionId,
                totalPrice: detail.price,
                name: detail.name,
                passengerCategory: detail.type,
                familyName: detail.familyName,
                dob: formatDate(detail.dob),
                citizenship: detail.citizenship,
                passport: detail.passport,
                issuingCountry: detail.issuingCountry,
                validityPeriod: formatDate(detail.validityPeriod),
                flight: {
                    id: detail.flight.id,
                    code: detail.flight.code,
                    departure: {
                        date: formatDate(detail.flight.departureDate),
                        time: formatTime(detail.flight.departureDate),
                    },
                    arrival: {
                        date: formatDate(detail.flight.arrivalDate),
                        time: formatTime(detail.flight.arrivalDate),
                    },
                    flightPrice: detail.flight.price,
                    flightDuration: calculateFlightDuration(
                        detail.flight.departureDate,
                        detail.flight.arrivalDate
                    ),
                    airline: {
                        id: detail.flight.plane.id,
                        code: detail.flight.plane.code,
                        name: detail.flight.plane.name,
                        image: detail.flight.plane.image,
                        terminal: detail.flight.plane.terminal,
                    },
                    departureAirport: {
                        id: detail.flight.departureAirport.id,
                        code: detail.flight.departureAirport.code,
                        name: detail.flight.departureAirport.name,
                        city: detail.flight.departureAirport.city,
                        country: detail.flight.departureAirport.country,
                        continent: detail.flight.departureAirport.continent,
                        image: detail.flight.departureAirport.image,
                    },
                    destinationAirport: {
                        id: detail.flight.destinationAirport.id,
                        code: detail.flight.destinationAirport.code,
                        name: detail.flight.destinationAirport.name,
                        city: detail.flight.destinationAirport.city,
                        country: detail.flight.destinationAirport.country,
                        continent: detail.flight.destinationAirport.continent,
                        image: detail.flight.destinationAirport.image,
                    },
                },
                seat: {
                    id: detail.seat.id,
                    flightId: detail.seat.id,
                    seatNumber: detail.seat.seatNumber,
                    status: detail.seat.status,
                    type: detail.seat.type,
                    seatPrice: detail.seat.price,
                },
            });
        });

        res.status(200).json({
            status: true,
            message: "ticket transaction data retrieved successfully",
            data: response,
        });
    } catch (error) {
        next(createHttpError(500, error.message));
    }
};

const updateTransaction = async (req, res, next) => {
    // update transaction data by id from ticketTransaction & include ticketTransaction detail
    // pake db transaction yak.. contoh ada di atas / di auth controller -> update user logged in
    // kalau perlu bikin function baru buat update transactionDetail satuan
    const { id } = req.params;
    const { totalPrice, status, transactionDetails } = req.body;

    try {
        await prisma.$transaction(async (tx) => {
            // Update the ticketTransaction record
            const validateId = await prisma.ticketTransaction.findUnique({
                where: { id },
            });

            if (!validateId) {
                return next(createHttpError(404, "Transaction not found"));
            }

            const updatedTransaction = await tx.ticketTransaction.update({
                where: { id: id },
                data: {
                    totalPrice,
                    status,
                },
                include: {
                    Transaction_Detail: true,
                },
            });

            // Update each transactionDetail record if provided
            if (transactionDetails && transactionDetails.length > 0) {
                await Promise.all(
                    transactionDetails.map(async (detail) => {
                        await tx.transactionDetail.update({
                            where: { ide: detail.ide },
                            data: {
                                transactionId: detail.transactionId,
                                ticketId: detail.ticketId,
                                name: detail.name,
                                familyName: detail.familyName,
                                dob: detail.dob,
                                citizenship: detail.citizenship,
                                passport: detail.passport,
                                issuingCountry: detail.issuingCountry,
                                validityPeriod: detail.validityPeriod,
                            },
                        });
                    })
                );
            }

            res.status(200).json({
                status: true,
                message: "Transaction updated successfully",
                data: updatedTransaction,
            });
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const deleteTransaction = async (req, res, next) => {
    // delete transaction data by id from ticketTransaction & include ticketTransaction detail
    const { id } = req.params;

    try {
        const validateId = await prisma.ticketTransaction.findUnique({
            where: { id },
        });

        if (!validateId) {
            return next(createHttpError(404, "Transaction not found"));
        }

        const ticketTransactions = await prisma.ticketTransaction.delete({
            where: { id },
            include: {
                Transaction_Detail: true,
            },
        });

        res.status(200).json({
            status: true,
            message: "Transaction deleted successfully",
            data: ticketTransactions,
        });
    } catch (error) {
        next(createHttpError(500, error.message));
    }
};

const deleteTransactionDetail = async (req, res, next) => {
    // delete transaction detail data by id
    const { id } = req.params;

    try {
        const validateId = await prisma.ticketTransactionDetail.findUnique({
            where: { id },
        });

        if (!validateId) {
            return next(createHttpError(404, "Transaction Detail not found"));
        }

        const ticketTransactions = await prisma.ticketTransactionDetail.delete({
            where: { id },
        });

        res.status(200).json({
            status: true,
            message: "Transaction Detail deleted successfully",
            data: ticketTransactions,
        });
    } catch (error) {
        next(createHttpError(500, error.message));
    }
};

module.exports = {
    getTransaction,
    cancelTransaction,
    notification,
    snapPayment,
    gopay,
    bankTransfer,
    creditCard,
    getAllTransaction,
    getAllTransactionByUserLoggedIn,
    getTransactionById,
    getAdminTransactionById,
    updateTransaction,
    deleteTransaction,
    deleteTransactionDetail,
};
