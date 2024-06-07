require("dotenv/config");
const { randomUUID } = require("crypto");
const crypto = require("crypto");
const { coreApi, snap, iris } = require("../config/coreApiMidtrans");
const createHttpError = require("http-errors");
const {
    dataCustomerDetail,
    dataItemDetail,
    totalPrice,
} = require("../utils/parameterMidtrans");
const { unescape } = require("querystring");
const { PrismaClient } = require("@prisma/client");
const { checkSeatAvailability } = require("../utils/checkSeat");
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

        // Check if the seat exists and is not booked
        const seats = await prisma.flightSeat.findMany({
            where: {
                id: {
                    in: [req.body.first_seatId, req.body.second_seatId],
                },
            },
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

                await tx.flightSeat.updateMany({
                    where: {
                        id: {
                            in: [seatId[0], seatId[1]],
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

const notification = async (req, res, next) => {
    try {
        const data = req.body;
        const ticketTransaction = await prisma.ticketTransaction.findUnique({
            where: {
                orderI: data.order_id,
            },
            include: {
                Transaction_Detail: true,
            },
        });

        const seats = ticketTransaction.Transaction_Detail.map((data) => {
            return seatId.push(data.seatId);
        });

        let seatId = seats.map((seat) => {
            return seat.id;
        });

        if (ticketTransaction) {
            const hash = crypto
                .createHash("sha512")
                .update(
                    `${ticketTransaction.orderId}${data.status_code}${data.gross_amount}${process.env.SANDBOX_SERVER_KEY}`
                );
            if (data.signature_key !== hash) {
                return next(
                    createHttpError(403, { message: "Invalid Signature Key" })
                );
            }
            let responseData = null;
            let transactionStatus = data.transaction_status;
            let fraudStatus = data.fraud_status;

            if (transactionStatus == "capture") {
                if (fraudStatus == "accept") {
                    // TODO set transaction status on your database to 'success'
                    // and response with 200 OK

                    responseData = await prisma.flightSeat.updateMany({
                        where: {
                            id: {
                                in: ticketTransaction.ticketTransactionDetail
                                    .seatId,
                            },
                        },
                        data: {
                            status: "BOOKED",
                        },
                    });
                }
            } else if (transactionStatus == "settlement") {
                // TODO set transaction status on your database to 'success'
                // and response with 200 OK
                responseData = await prisma.flightSeat.updateMany({
                    where: {
                        id: {
                            in: [seatId[0], seatId[1]],
                        },
                    },
                    data: {
                        status: "BOOKED",
                    },
                });
            } else if (
                transactionStatus == "cancel" ||
                transactionStatus == "deny" ||
                transactionStatus == "expire"
            ) {
                // TODO set transaction status on your database to 'failure'
                // and response with 200 OK
                responseData = await prisma.flightSeat.updateMany({
                    where: {
                        id: {
                            in: [seatId[0], seatId[1]],
                        },
                    },
                    data: {
                        status: "AVAILABLE",
                    },
                });
            } else if (transactionStatus == "pending") {
                // TODO set transaction status on your database to 'pending' / waiting payment
                // and response with 200 OK
                responseData = await prisma.flightSeat.updateMany({
                    where: {
                        id: {
                            in: [seatId[0], seatId[1]],
                        },
                    },
                    data: {
                        status: "OCCUPIED",
                    },
                });
            }
        }

        res.status(200).json({
            status: true,
            message: "OK",
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const bankTransfer = async (req, res, next) => {
    try {
        let { bank, payment_type } = req.body;
        let { flightId } = req.query;

        req.body.flightId = flightId;

        // Check if the seat exists and is not booked
        const seats = await prisma.flightSeat.findMany({
            where: {
                id: {
                    in: [req.body.first_seatId, req.body.second_seatId],
                },
            },
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

                await tx.flightSeat.updateMany({
                    where: {
                        id: {
                            in: [seatId[0], seatId[1]],
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

        const seats = await prisma.flightSeat.findMany({
            where: {
                id: {
                    in: [req.body.first_seatId, req.body.second_seatId],
                },
            },
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

                await tx.flightSeat.updateMany({
                    where: {
                        id: {
                            in: [seatId[0], seatId[1]],
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

        // Check if the seat exists and is not booked
        const seats = await prisma.flightSeat.findMany({
            where: {
                id: {
                    in: [req.body.first_seatId, req.body.second_seatId],
                },
            },
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

                await tx.flightSeat.updateMany({
                    where: {
                        id: {
                            in: [seatId[0], seatId[1]],
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

const getAllTransaction = async (req, res, next) => {
    // get all transaction data from ticketTransaction & include ticketTransaction detail

    try {
        const ticketTransactions = await prisma.ticketTransaction.findMany({
            include: {
                Transaction_Detail: true,
            },
        });
        res.status(200).json({
            status: true,
            message: "ticket transactions data retrieved successfully",
            data: ticketTransactions,
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
};

const updateTransaction = async (req, res, next) => {
    // update transaction data by id from ticketTransaction & include ticketTransaction detail
    // pake db transaction yak.. contoh ada di atas / di auth controller -> update user logged in
    // kalau perlu bikin function baru buat update transactionDetail satuan
};

const deleteTransaction = async (req, res, next) => {
    // delete transaction data by id from ticketTransaction & include ticketTransaction detail
};

const deleteTransactionDetail = async (req, res, next) => {
    // delete transaction detail data by id
};

module.exports = {
    getTransaction,
    createTransaction,
    notification,
    gopay,
    bankTransfer,
    creditCard,
    getAllTransaction,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    deleteTransactionDetail,
};
