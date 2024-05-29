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
        let { ticketId } = req.query;

        req.body.first_ticketId = ticketId;
        req.body.second_ticketId = ticketId;
        console.log(req.body);

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
                        userId: "105469596566547305919",
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
                                ticketId: dataItem.ticketId,
                                name: dataItem.name,
                                familyName: dataItem.familyName,
                                dob: new Date().toISOString(),
                                citizenship: dataItem.citizenship,
                                passport: randomUUID(),
                                issuingCountry: dataItem.issuingCountry,
                                validityPeriod: new Date().toISOString(),
                            },
                        });
                    })
                );

                res.status(201).json({
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
        let { name } = req.query;
        let CardParameter = {
            card_number: "5264 2210 3887 4659",
            card_exp_month: "02",
            card_exp_year: "2025",
            card_cvv: "123",
            client_key: coreApi.apiConfig.clientKey,
        };

        const cardResponse = await coreApi.cardToken(CardParameter);
        const cardToken = cardResponse.token_id;

        const dataCustomer = await dataCustomerDetail(req.query);
        const dataItem = await dataItemDetail(req.query);

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

        const response = await coreApi.charge(parameter);
        console.log(response);

        await prisma.ticketTransaction.create({
            data: {
                name: name,
                status: response.transaction_status,
                totalPrice: parseFloat(response.gross_amount),
                order_id: response.order_id,
            },
        });

        res.status(201).json({
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
        let { name } = req.query;
        const dataCustomer = await dataCustomerDetail(req.query);
        const dataItem = await dataItemDetail(req.query);

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

        const response = await coreApi.charge(parameter);

        await prisma.ticketTransaction.create({
            data: {
                name: name,
                totalPrice: parseFloat(response.gross_amount),
                status: response.transaction_status,
                order_id: response.order_id,
            },
        });

        res.status(201).json({
            status: true,
            message: "transaction created successfully",
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
