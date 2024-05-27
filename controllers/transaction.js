const { randomUUID } = require('crypto');
const { coreApi, snap, iris } = require('../config/coreApiMidtrans');
const createHttpError = require('http-errors');
const { dataCustomerDetail, dataItemDetail, totalPrice } = require('../utils/parameterMidtrans');
const { unescape } = require('querystring');
const { PrismaClient } = require('@prisma/client');
require('dotenv/config');
const prisma = new PrismaClient()

const getTransaction = async (req, res, next) => {
	try {
		const { order_id } = req.query;

		// encode serverKey for authorization get transaction status
		const encodedServerKey = btoa(unescape(encodeURIComponent(`${process.env.SANDBOX_SERVER_KEY}:`)));

		const url = `https://api.sandbox.midtrans.com/v2/${order_id}/status`;
		const options = {
			method: 'GET',
			headers: {
				accept: 'application/json',
				authorization: `Basic ${encodedServerKey}`,
			},
		};

		const response = await fetch(url, options);
		const transaction = await response.json();

		if (transaction.status_code === '404') {
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
				message: 'Transaction data retrieved successfully',
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

const bankTransfer = async (req, res, next) => {
	try {
		let { bank, payment_type, name} = req.query;

		if (bank) {
			payment_type = 'bank_transfer';
			const allowedBanks = ['bca', 'bni', 'bri', 'mandiri', 'permata', 'cimb'];

			if (!allowedBanks.includes(bank)) {
				return next(
					createHttpError(422, {
						message: `Allowed Banks: ${allowedBanks.join(', ')}`,
					})
				);
			}
		}

		const allowedPaymentTypes = ['bank_transfer', 'echannel', 'permata'];
		let parameter;

		//TODO:
		//? req body: contains data from input form (check figma): order details, passenger details
		//? name sesuaikan dengan nama variable di fungsi dataCustomerDetail & dataItemDetail



		const dataCustomer = await dataCustomerDetail(req.query);
		const dataItem = await dataItemDetail(req.query);

		if (!allowedPaymentTypes.includes(payment_type)) {
			return next(
				createHttpError(422, {
					message: `Allowed payment types: ${allowedPaymentTypes.join(', ')}`,
				})
			);
		}

		if (payment_type !== 'bank_transfer') {
			// permata
			console.log('bukan bank transfer');
			if (payment_type === 'permata') {
				parameter = {
					payment_type: 'permata',
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
					payment_type: 'echannel',
					echannel: {
						bill_info1: 'Payment:',
						bill_info2: 'Online purchase',
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
			console.log('bank transfer');
			parameter = {
				payment_type: 'bank_transfer',
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

		// generate payment details
		const response = await coreApi.charge(parameter);

		//TODO: DB: Transaction.orderID = parameter.transactin_details.order_id
		//TODO: insert data into table transaction & transaction detail after charge

		await prisma.transaction.create({
			data: {
				name: name,
				status: response.transaction_status,
				totalPrice: parseInt(response.gross_amount),
				order_id: response.order_id
			}
		});

		res.status(201).json({
			status: true,
			message: 'Bank VA created successfully',
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
	} catch (error) {
		next(createHttpError(500, error.message));
	}
};

const updateTransaction = async (req, res, next) => {
	try {
		const { order_id } = req.query;

		// encode serverKey for authorization get transaction status
		const encodedServerKey = btoa(unescape(encodeURIComponent(`${process.env.SANDBOX_SERVER_KEY}:`)));

		const url = `https://api.sandbox.midtrans.com/v2/${order_id}/status`;
		const options = {
			method: 'GET',
			headers: {
				accept: 'application/json',
				authorization: `Basic ${encodedServerKey}`,
			},
		};

		const response = await fetch(url, options);
		const transaction = await response.json();

		if (transaction.status_code === '404') {
			return next(
				createHttpError(422, {
					message: "Transaction doesn't exist",
				})
			);
		}

		if (transaction.transaction_status !== 'pending' || transaction.transaction_status !== 'PENDING') {
			await prisma.transaction.update({
				data: {
					status: transaction.transaction_status,
				},
				where: {
					order_id,
				},
			});
		}

		res.status(200).json({
			status: true,
			message: 'Transaction data retrieved successfully',
			data: {
				transaction_status: transaction.transaction_status,
			},
		});
	} catch (error) {
		next(createHttpError(500, { message: error.message }));
	}
};

const creditCard = async (req, res, next) => {
	try {
		let { name } = req.query
		let CardParameter = {
			card_number: '5264 2210 3887 4659',
			card_exp_month: '02',
			card_exp_year: '2025',
			card_cvv: '123',
			client_key: coreApi.apiConfig.clientKey,
		};

		const cardResponse = await coreApi.cardToken(CardParameter);
		const cardToken = cardResponse.token_id;

		const dataCustomer = await dataCustomerDetail(req.query);
		const dataItem = await dataItemDetail(req.query);

		let parameter = {
			payment_type: 'credit_card',
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

		await prisma.transaction.create({
			data: {
				name: name,
				status: response.transaction_status,
				totalPrice: parseInt(response.gross_amount),
				order_id: response.order_id
			}
		})

		res.status(201).json({
			status: true,
			message: 'CC Token & Transaction successfully',
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
		next(createHttpError(500, {
			message: error.message
		}));
	}
};

const gopay = async (req, res, next) => {
	try {
		let { name } = req.query
		const dataCustomer = await dataCustomerDetail(req.query);
		const dataItem = await dataItemDetail(req.query);

		let parameter = {
			payment_type: 'gopay',
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

		await prisma.transaction.create({
			data: {
				name: name,
				totalPrice: parseInt(response.gross_amount),
				status: response.transaction_status,
				order_id: response.order_id
			}
		})

		res.status(201).json({
			status: true,
			message: 'transaction created successfully',
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
