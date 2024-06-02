require("dotenv/config");
const { randomUUID } = require("crypto");
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

//! on proggress
const updateTransaction = async (req, res, next) => {
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

        if (transaction.transaction_status === "expire") {
            return next(
                createHttpError(410, {
                    message: "Transaction is expired",
                })
            );
        }

        if (
            transaction.transaction_status !== "pending" ||
            transaction.transaction_status !== "PENDING"
        ) {
            await prisma.ticketTransaction.update({
                data: {
                    status: transaction.transaction_status,
                },
                where: {
                    orderId,
                },
            });
        }

        res.status(200).json({
            status: true,
            message: "Transaction data retrieved successfully",
            data: {
                transaction_status: transaction.transaction_status,
            },
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

        const { isFound, isBooked, seatNumber } = await checkSeatAvailability(
            seats
        );

        if (!isFound) {
            return next(createHttpError(404, { message: "Seat not found" }));
        }

        if (isBooked)
            next(
                createHttpError(422, {
                    message: `Flight seat in this flight with seat number: ${seatNumber} is already booked`,
                })
            );

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
                        userId: "clwudd72l000ujj2zedoasy2a", // req.user.id (from user loggedIn)
                        orderId: response.order_id,
                        status: response.transaction_status,
                        totalPrice: parseFloat(response.gross_amount),
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
                                dob: new Date().toISOString(),
                                citizenship: dataItem.citizenship,
                                passport: randomUUID(),
                                issuingCountry: dataItem.issuingCountry,
                                validityPeriod: new Date().toISOString(),
                            },
                        });
                    })
                );

                let seatId = seats.map((seat) => {
                    return seat.id;
                });

                await prisma.flightSeat.updateMany({
                    where: {
                        id: {
                            in: [seatId[0], seatId[1]],
                        },
                    },
                    data: {
                        isBooked: true,
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
                        userId: "clwt39neg000u11bv775dxt07", // req.user.id (from user loggedIn)
                        orderId: response.order_id,
                        status: response.transaction_status,
                        totalPrice: parseFloat(response.gross_amount),
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
                                familyName: dataItem.familyName,
                                flightId: req.body.flightId,
                                dob: new Date().toISOString(),
                                citizenship: dataItem.citizenship,
                                passport: randomUUID(),
                                issuingCountry: dataItem.issuingCountry,
                                validityPeriod: new Date().toISOString(),
                            },
                        });
                    })
                );

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
                        userId: "clwt39neg000u11bv775dxt07", // req.user.id (from user loggedIn)
                        orderId: response.order_id,
                        status: response.transaction_status,
                        totalPrice: parseFloat(response.gross_amount),
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
                                familyName: dataItem.familyName,
                                flightId: req.body.flightId,
                                dob: new Date().toISOString(),
                                citizenship: dataItem.citizenship,
                                passport: randomUUID(),
                                issuingCountry: dataItem.issuingCountry,
                                validityPeriod: new Date().toISOString(),
                            },
                        });
                    })
                );

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

module.exports = {
    getTransaction,
    updateTransaction,
    gopay,
    bankTransfer,
    creditCard,
};
