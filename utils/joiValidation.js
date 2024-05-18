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

module.exports = { LoginSchema, RegisterSchema, OTPSchema };
