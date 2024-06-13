require("dotenv/config");
const { randomUUID } = require("crypto");
const { coreApi, snap } = require("../config/coreApiMidtrans");
const createHttpError = require("http-errors");
const {
    dataCustomerDetail,
    dataItemDetail,
    totalPrice,
} = require("../utils/parameterMidtrans");
const { unescape } = require("querystring");
const { PrismaClient } = require("@prisma/client");
const { checkSeatAvailability } = require("../utils/checkSeat");
const { extractSecondData } = require("../utils/extractItems");
const prisma = new PrismaClient();

const getTransaction = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        // encode serverKey for authorization get transaction status
        const encodedServerKey = btoa(
            unescape(encodeURIComponent(`${process.env.SANDBOX_SERVER_KEY}:`))
        );

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
            data: {
                status: true,
                message: "Transaction data retrieved successfully",
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

const createTransaction = async (req, res, next) => {
    try {
        let { flightId } = req.query;

        req.body.flightId = flightId;
        const secondData = extractSecondData(req.body);

        req.body.flightId = flightId;

        let where = {
            id: {
                in: [req.body.first_seatId],
            },
        };
        if (Object.keys(secondData).length !== 0) {
            where = {
                id: {
                    in: [req.body.first_seatId, req.body.second_seatId],
                },
            };
        }

        // Check if the seat exists and is not booked
        const seats = await prisma.flightSeat.findMany({
            where,
        });

        // check seat
        const { error, seatNumber } = await checkSeatAvailability(
            seats,
            flightId
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

        const dataCustomer = await dataCustomerDetail(req.body);
        const dataItem = await dataItemDetail(req.body);

        let parameter = {
            credit_card: {
                secure: true,
            },
            transaction_details: {
                gross_amount: await totalPrice(dataItem),
                order_id: randomUUID(),
            },
            item_details: dataItem,
            customer_details: {
                ...dataCustomer,
            },
        };

        try {
            await prisma.$transaction(async (tx) => {
                const response = await snap.createTransaction(parameter);

                const transaction = await tx.ticketTransaction.create({
                    data: {
                        userId: req.user.id, // req.user.id (from user loggedIn)
                        orderId: parameter.transaction_details.order_id,
                        status: "pending",
                        totalPrice: parseFloat(
                            parameter.transaction_details.gross_amount
                        ),
                        bookingDate: dataCustomer.bookingDate,
                    },
                });

                await Promise.all(
                    dataItem.map(async (dataItem) => {
                        await tx.ticketTransactionDetail.create({
                            data: {
                                id: randomUUID(),
                                transactionId: transaction.id,
                                price: parseFloat(dataItem.price),
                                name: dataItem.name,
                                seatId: dataItem.seatId,
                                familyName: dataItem.familyName,
                                flightId: req.body.flightId,
                                dob: dataItem.dob,
                                citizenship: dataItem.citizenship,
                                passport: randomUUID(),
                                issuingCountry: dataItem.issuingCountry,
                                validityPeriod: dataItem.validityPeriod,
                            },
                        });
                    })
                );

                let seatId = seats.map((seat) => {
                    return seat.id;
                });

                let whereUpdate = {
                    id: {
                        in: [seatId[0]],
                    },
                };
                if (Object.keys(secondData).length !== 0) {
                    whereUpdate = {
                        id: {
                            in: [seatId[0], seatId[1]],
                        },
                    };
                }

                await tx.flightSeat.updateMany({
                    where: whereUpdate,
                    data: {
                        status: "OCCUPIED",
                    },
                });

                res.status(200).json({
                    status: true,
                    message: "Transaction created successfully",
                    _token: response.token,
                    redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${response.token}`,
                    data: {
                        ...dataCustomer,
                        dataItem,
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
    console.log(datas);

    // ! [start] ticket
    // TODO: create ticket disini
    // TODO: kan kalo mau hit endpoint ini harus deploy dulu
    // TODO: sementara mas lowis bikin aja endpoint sendiri buat get data sama create sesuai logic yang ku bikin. kalo aman bisa di paste lagi kesini

    // user_id ambil aja dari kondisi where find transaction where order Id, terus ambil userId
    // ? contoh
    const dataTransaction = await prisma.ticketTransaction.findUnique({
        where: {
            orderId: notification.order_id,
        },
        include: {
            Transaction_Detail: true,
        },
    });

    const ticketFlightId = dataTransaction.Transaction_Detail.map(
        (data) => data.flightId
    );
    const ticketSeatId = dataTransaction.Transaction_Detail.map(
        (data) => data.seatId
    );

    // const flight = await prisma.flight.findUnique({
    //     where: { id: ticketFlightId },
    //     include: {
    //         plane: true,
    //         departureAirport: true,
    //     },
    // });

    // if (!flight) {
    //     throw createHttpError(404, 'Flight not found');
    // }

    // const seat = await prisma.flightSeat.findUnique({
    //     where: { id: ticketSeatId },
    // });

    // if (!seat) {
    //     throw createHttpError(404, 'Seat not found');
    // }

    // const airlineCode = flight.plane.code;
    // const airportCode = flight.departureAirport.code;
    // const flightCode = flight.code;
    // const seatNumber = seat.seatNumber;

    // let uniqueCode = `${airlineCode}-${airportCode}-${flightCode}-${seatNumber}`;
    //         let isUnique = false;

    //         // Ensure the code is unique
    //         while (!isUnique) {
    //             const existingTicket = await prisma.ticket.findUnique({
    //                 where: { code: uniqueCode },
    //             });

    //             if (existingTicket) {
    //                 uniqueCode = `${airlineCode}-${airportCode}-${flightCode}-${seatNumber}-${uuidv4()}`;
    //             } else {
    //                 isUnique = true;
    //             }
    //         }

    // // create ticket
    // await prisma.ticket.create({
    //     data: {
    //         userId: dataTransaction.userId,
    //         flightId: ticketFlightId,
    //         seatId: ticketSeatId,
    //         code: uniqueCode,
    //     },
    // });

    // ! [end] ticket

    await prisma.ticketTransaction.update({
        where: {
            orderId: data.order_id,
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

const bankTransfer = async (req, res, next) => {
    try {
        let { bank, payment_type } = req.body;
        let { flightId } = req.query;

        const secondData = extractSecondData(req.body);

        req.body.flightId = flightId;

        let where = {
            id: {
                in: [req.body.first_seatId],
            },
        };

        if (Object.keys(secondData).length !== 0) {
            where = {
                id: {
                    in: [req.body.first_seatId, req.body.second_seatId],
                },
            };
        }

        // Check if the seat exists and is not booked
        const seats = await prisma.flightSeat.findMany({
            where,
        });

        // check seat
        const { error, seatNumber } = await checkSeatAvailability(
            seats,
            flightId
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

        const dataCustomer = await dataCustomerDetail(req.body);
        const dataItem = await dataItemDetail(req.body);

        if (bank) {
            payment_type = "bank_transfer";
            const allowedBanks = [
                "bca",
                "bni",
                "bri",
                "mandiri",
                "permata",
                "cimb",
            ];

            if (!allowedBanks.includes(bank)) {
                return next(
                    createHttpError(422, {
                        message: `Allowed Banks: ${allowedBanks.join(", ")}`,
                    })
                );
            }
        }

        const allowedPaymentTypes = ["bank_transfer", "echannel", "permata"];
        let parameter;

        if (!allowedPaymentTypes.includes(payment_type)) {
            return next(
                createHttpError(422, {
                    message: `Allowed payment types: ${allowedPaymentTypes.join(
                        ", "
                    )}`,
                })
            );
        }

        if (payment_type !== "bank_transfer") {
            // permata
            if (payment_type === "permata") {
                parameter = {
                    payment_type: "permata",
                    transaction_details: {
                        gross_amount: await totalPrice(dataItem),
                        order_id: randomUUID(),
                    },
                    customer_details: {
                        ...dataCustomer,
                    },
                    item_details: dataItem,
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
                        gross_amount: await totalPrice(dataItem),
                        order_id: randomUUID(),
                    },
                    customer_details: {
                        ...dataCustomer,
                    },
                    item_details: dataItem,
                };
            }
        } else {
            parameter = {
                payment_type: "bank_transfer",
                bank_transfer: {
                    bank,
                },
                transaction_details: {
                    gross_amount: await totalPrice(dataItem),
                    order_id: randomUUID(),
                },
                customer_details: {
                    ...dataCustomer,
                },
                item_details: dataItem,
            };
        }

        try {
            await prisma.$transaction(async (tx) => {
                const response = await coreApi.charge(parameter);

                const transaction = await tx.ticketTransaction.create({
                    data: {
                        userId: req.user.id, // req.user.id (from user loggedIn)
                        orderId: response.order_id,
                        status: response.transaction_status,
                        totalPrice: parseFloat(response.gross_amount),
                        bookingDate: dataCustomer.bookingDate,
                    },
                });

                await Promise.all(
                    dataItem.map(async (dataItem) => {
                        await tx.ticketTransactionDetail.create({
                            data: {
                                id: randomUUID(),
                                transactionId: transaction.id,
                                price: parseFloat(dataItem.price),
                                name: dataItem.name,
                                seatId: dataItem.seatId,
                                familyName: dataItem.familyName,
                                flightId: req.body.flightId,
                                dob: dataItem.dob,
                                citizenship: dataItem.citizenship,
                                passport: randomUUID(),
                                issuingCountry: dataItem.issuingCountry,
                                validityPeriod: dataItem.validityPeriod,
                            },
                        });
                    })
                );

                let seatId = seats.map((seat) => {
                    return seat.id;
                });

                let whereUpdate = {
                    id: {
                        in: [seatId[0]],
                    },
                };
                if (Object.keys(secondData).length !== 0) {
                    whereUpdate = {
                        id: {
                            in: [seatId[0], seatId[1]],
                        },
                    };
                }

                await tx.flightSeat.updateMany({
                    where: whereUpdate,
                    data: {
                        status: "OCCUPIED",
                    },
                });

                res.status(200).json({
                    status: true,
                    message: "Bank VA created successfully",
                    data: {
                        flightId: flightId,
                        seatId: seatId,
                        payment_type: response.payment_type,
                        transaction_id: response.transaction_id,
                        order_id: response.order_id,
                        gross_amount: response.gross_amount,
                        transaction_time: response.transaction_time,
                        transaction_status: response.transaction_status,
                        payment_status: response.fraud_status,
                        expiry_time: response.expiry_time,
                        va_numbers: response.va_numbers,
                        dataItem,
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
        let { card_number, card_exp_month, card_exp_year, card_cvv } = req.body;
        let { flightId } = req.query;

        req.body.flightId = flightId;

        const secondData = extractSecondData(req.body);

        req.body.flightId = flightId;

        let where = {
            id: {
                in: [req.body.first_seatId],
            },
        };
        if (Object.keys(secondData).length !== 0) {
            where = {
                id: {
                    in: [req.body.first_seatId, req.body.second_seatId],
                },
            };
        }

        const seats = await prisma.flightSeat.findMany({
            where,
        });

        // check seat
        const { error, seatNumber } = await checkSeatAvailability(
            seats,
            flightId
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

        const dataCustomer = await dataCustomerDetail(req.body);
        const dataItem = await dataItemDetail(req.body);

        let cardParameter = {
            card_number,
            card_exp_month,
            card_exp_year,
            card_cvv,
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
                gross_amount: await totalPrice(dataItem),
                order_id: randomUUID(),
            },
            item_details: dataItem,
            customer_details: {
                ...dataCustomer,
            },
        };

        try {
            await prisma.$transaction(async (tx) => {
                const response = await coreApi.charge(parameter);

                const transaction = await tx.ticketTransaction.create({
                    data: {
                        userId: req.user.id, // req.user.id (from user loggedIn)
                        orderId: response.order_id,
                        status: response.transaction_status,
                        totalPrice: parseFloat(response.gross_amount),
                        bookingDate: dataCustomer.bookingDate,
                    },
                });

                await Promise.all(
                    dataItem.map(async (dataItem) => {
                        await tx.ticketTransactionDetail.create({
                            data: {
                                id: randomUUID(),
                                transactionId: transaction.id,
                                price: parseFloat(dataItem.price),
                                name: dataItem.name,
                                seatId: dataItem.seatId,
                                familyName: dataItem.familyName,
                                flightId: req.body.flightId,
                                dob: dataItem.dob,
                                citizenship: dataItem.citizenship,
                                passport: randomUUID(),
                                issuingCountry: dataItem.issuingCountry,
                                validityPeriod: dataItem.validityPeriod,
                            },
                        });
                    })
                );

                let seatId = seats.map((seat) => {
                    return seat.id;
                });

                let whereUpdate = {
                    id: {
                        in: [seatId[0]],
                    },
                };
                if (Object.keys(secondData).length !== 0) {
                    whereUpdate = {
                        id: {
                            in: [seatId[0], seatId[1]],
                        },
                    };
                }

                await tx.flightSeat.updateMany({
                    where: whereUpdate,
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
                        dataItem,
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

        req.body.flightId = flightId;

        const secondData = extractSecondData(req.body);

        req.body.flightId = flightId;

        let where = {
            id: {
                in: [req.body.first_seatId],
            },
        };
        if (Object.keys(secondData).length !== 0) {
            where = {
                id: {
                    in: [req.body.first_seatId, req.body.second_seatId],
                },
            };
        }

        // Check if the seat exists and is not booked
        const seats = await prisma.flightSeat.findMany({
            where,
        });

        // check seat
        const { error, seatNumber } = await checkSeatAvailability(
            seats,
            flightId
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

        const dataCustomer = await dataCustomerDetail(req.body);
        const dataItem = await dataItemDetail(req.body);

        let parameter = {
            payment_type: "gopay",
            transaction_details: {
                gross_amount: await totalPrice(dataItem),
                order_id: randomUUID(),
            },
            item_details: dataItem,
            customer_details: {
                ...dataCustomer,
            },
        };

        try {
            await prisma.$transaction(async (tx) => {
                const response = await coreApi.charge(parameter);

                const transaction = await tx.ticketTransaction.create({
                    data: {
                        userId: req.user.id, // req.user.id (from user loggedIn)
                        orderId: response.order_id,
                        status: response.transaction_status,
                        totalPrice: parseFloat(response.gross_amount),
                        bookingDate: dataCustomer.bookingDate,
                    },
                });

                await Promise.all(
                    dataItem.map(async (dataItem) => {
                        await tx.ticketTransactionDetail.create({
                            data: {
                                id: randomUUID(),
                                transactionId: transaction.id,
                                price: parseFloat(dataItem.price),
                                name: dataItem.name,
                                seatId: dataItem.seatId,
                                familyName: dataItem.familyName,
                                flightId: req.body.flightId,
                                dob: dataItem.dob,
                                citizenship: dataItem.citizenship,
                                passport: randomUUID(),
                                issuingCountry: dataItem.issuingCountry,
                                validityPeriod: dataItem.validityPeriod,
                            },
                        });
                    })
                );

                let seatId = seats.map((seat) => {
                    return seat.id;
                });

                let whereUpdate = {
                    id: {
                        in: [seatId[0]],
                    },
                };
                if (Object.keys(secondData).length !== 0) {
                    whereUpdate = {
                        id: {
                            in: [seatId[0], seatId[1]],
                        },
                    };
                }

                await tx.flightSeat.updateMany({
                    where: whereUpdate,
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
                        dataItem,
                        action: response.actions,
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

//TODO: dashboard action

const getAllTransactionByUserLoggedIn = async (req, res, next) => {
    // get all transaction data from ticketTransaction & include ticketTransaction detail

    try {
        let { dateOfDeparture, returnDate, flightCode } = req.query;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const parsedDepartureDate = new Date(dateOfDeparture);
        const parsedReturnDate = new Date(returnDate);

        let flightCondition = {
            code: {
                contains: flightCode,
                mode: "insensitive",
            },
        };

        if (dateOfDeparture || returnDate) {
            if (flightCode) {
                flightCondition = {
                    departureDate: {
                        gte: new Date(parsedDepartureDate.setHours(0, 0, 0, 0)),
                    },
                    arrivalDate: {
                        lt: new Date(parsedReturnDate.setHours(23, 59, 59, 0)),
                    },
                    code: {
                        contains: flightCode,
                        mode: "insensitive",
                    },
                };
            }
        }

        const transactions = await prisma.ticketTransaction.findMany({
            skip: offset,
            take: limit,
            include: {
                Transaction_Detail: {
                    include: {
                        flight: {
                            where: flightCondition,
                        },
                    },
                },
            },
            where: {
                userId: req.user.id,
            },
        });

        const count = await prisma.ticketTransaction.count();

        const filteredTransactions = transactions.filter((transaction) =>
            transaction.Transaction_Detail.some(
                (detail) => detail.flight !== null
            )
        );

        // console.log(filteredTransaction);

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
            data:
                filteredTransactions.length !== 0
                    ? filteredTransactions
                    : "transaction data is empty",
        });
    } catch (error) {
        next(
            createHttpError(500, {
                message: error.message,
            })
        );
    }
};

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
            data:
                transactions.length !== 0
                    ? transactions
                    : "empty transaction data",
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
    // get transaction data by id from ticketTransaction & include ticketTransaction detail
    try {
        const { id } = req.params;
        const ticketTransactions = await prisma.ticketTransaction.findUnique({
            where: { id },
            include: {
                Transaction_Detail: true,
            },
        });

        if (!ticketTransactions) {
            return next(createHttpError(404, "Transaction not found"));
        }

        res.status(200).json({
            status: true,
            message: "ticket transactions data retrieved successfully",
            data: ticketTransactions,
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

const createTicketTest = async (req, res, next) => {
    const dataTransaction = await prisma.ticketTransaction.findUnique({
        where: {
            orderId: "f24cecfd-d153-4b01-b513-521223f82183",
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

    for (let i = 0; i < ticketFlightIds.length; i++) {
        const flight = flights.find((f) => f.id === ticketFlightIds[i]);
        const seat = seats.find((s) => s.id === ticketSeatIds[i]);

        if (!flight || !seat) {
            continue;
        }

        const airlineCode = flight.plane.code;
        const airportCode = flight.departureAirport.code;
        const flightCode = flight.code;
        const seatNumber = seat.seatNumber;

        let uniqueCode = `${airlineCode}-${airportCode}-${flightCode}-${seatNumber}`;

        const existingTicket = await prisma.ticket.findUnique({
            where: { code: uniqueCode },
        });

        if (existingTicket) {
            return next(
                createHttpError(422, { message: "ticket is already exist" })
            );
        }

        // Create the new ticket
        const dataTicket = await prisma.ticket.create({
            data: {
                userId: dataTransaction.userId,
                flightId: ticketFlightIds[i],
                seatId: ticketSeatIds[i],
                code: uniqueCode,
                transactionId: dataTransaction.id,
            },
            include: {
                flight: true,
                user: true,
                seat: true,
                ticketTransaction: true,
            },
        });
    }
};

module.exports = {
    createTicketTest,
    getTransaction,
    createTransaction,
    notification,
    gopay,
    bankTransfer,
    creditCard,
    getAllTransaction,
    getAllTransactionByUserLoggedIn,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    deleteTransactionDetail,
};
