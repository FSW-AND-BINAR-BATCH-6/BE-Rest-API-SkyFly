const Joi = require('joi');

// auth
const LoginSchema = Joi.object({
	password: Joi.string().min(8).max(20).required(),
	email: Joi.string()
		.email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'id'] } })
		.required(),
});

const RegisterSchema = Joi.object({
	name: Joi.string().min(3).max(30).required(),
	email: Joi.string()
		.email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'id'] } })
		.required(),
	phoneNumber: Joi.string().min(10).max(15).required(),
	password: Joi.string().min(8).max(20).required(),
});

const OTPSchema = Joi.object({
	otp: Joi.string().min(6).required(),
});

const createFlightSchema = Joi.object({
	planeId: Joi.string().required(),
	departureDate: Joi.date().iso().required().messages({
		'date.format': '"departureDate" must be in ISO format, eg: 2024-01-07 09:30:00',
	}),
	departureCity: Joi.string().required(),
	departureCityCode: Joi.string().required(),
	arrivalDate: Joi.date().iso().required().messages({
		'date.format': '"arrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
	}),
	destinationCity: Joi.string().required(),
	destinationCityCode: Joi.string().required(),
	price: Joi.number().required(),
});

const updateFlightSchema = Joi.object({
	planeId: Joi.string().required(),
	departureDate: Joi.date().iso().required().messages({
		'date.format': '"arrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
	}),
	departureCity: Joi.string().required(),
	departureCityCode: Joi.string().required(),
	arrivalDate: Joi.date().iso().required().messages({
		'date.format': '"arrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
	}),
	destinationCity: Joi.string().required(),
	destinationCityCode: Joi.string().required(),
	price: Joi.number().required(),
  });

module.exports = { LoginSchema, RegisterSchema, OTPSchema, createFlightSchema, updateFlightSchema };
