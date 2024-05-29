const Joi = require("joi").extend(require("@joi/date"));

// auth
const LoginSchema = Joi.object({
    password: Joi.string().min(8).max(50).required(),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "id"] } })
        .required(),
});

const RegisterSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "id"] } })
        .required(),
    phoneNumber: Joi.string().min(10).max(15).required(),
    password: Joi.string().min(8).max(20).required(),
});

const PasswordSchema = Joi.object({
    password: Joi.string().min(8).max(50).required(),
    confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
        "any.only": "Confirm password does not match password",
    }),
});

const OTPSchema = Joi.object({
    otp: Joi.string().min(6).max(6).required(),
});

const forgetPasswordSchema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "id"] } })
        .required(),
});

// user
const userCreateSchema = Joi.object({
    name: Joi.string().required(),
    phoneNumber: Joi.string().optional(),
    familyName: Joi.string().required(),
    role: Joi.string().default("BUYER"), // Set default value for role
});

const userUpdateSchema = Joi.object({
    id: Joi.string(),
    name: Joi.string(),
    phoneNumber: Joi.string().optional(),
    familyName: Joi.string().required(),
    role: Joi.forbidden(), // Ensure role is not allowed in request body
});

// flight
const createFlightSchema = Joi.object({
    planeId: Joi.string().required(),
    departureDate: Joi.date().iso().required().messages({
        "date.format":
            '"departureDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    departureAirportId: Joi.string().required(),
    arrivalDate: Joi.date().iso().required().messages({
        "date.format":
            '"arrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    destinationAirportId: Joi.string().required(),
    price: Joi.number().required(),
    capacity: Joi.number().required(),
});

const updateFlightSchema = Joi.object({
    planeId: Joi.string().required(),
    departureDate: Joi.date().iso().required().messages({
        "date.format":
            '"arrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    departureAirportId: Joi.string().required(),
    arrivalDate: Joi.date().iso().required().messages({
        "date.format":
            '"arrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    destinationAirportId: Joi.string().required(),
    price: Joi.number().required(),
});

// airplane
const createAirplaneSchema = Joi.object({
    name: Joi.string()
        .min(6)
        .max(30)
        .pattern(/^[A-Za-z\s]+$/)
        .required(),
    code: Joi.string().min(5).max(6).required(),
});

const updateAirplaneSchema = Joi.object({
    name: Joi.string()
        .min(6)
        .max(30)
        .pattern(/^[A-Za-z\s]+$/),
    code: Joi.string().min(5).max(6),
});

const createAirportSchema = Joi.object({
    name: Joi.string().min(2).max(70).required(),
    code: Joi.string().min(3).max(3).required(),
    country: Joi.string()
        .pattern(/^[A-Za-z\s]+$/)
        .required(),
    city: Joi.string()
        .pattern(/^[A-Za-z\s]+$/)
        .required(),
});

const updateAirportSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(70)
        .pattern(/^[A-Za-z\s]+$/),
    code: Joi.string().min(3).max(3),
    country: Joi.string()
        .min(3)
        .max(25)
        .pattern(/^[A-Za-z\s]+$/),
    city: Joi.string()
        .min(3)
        .max(40)
        .pattern(/^[A-Za-z\s]+$/),
});

//ticket
const TicketSchema = Joi.object({
    flightId: Joi.string().required(),
    userId: Joi.string().required(),
    seatId: Joi.string().required(),
    bookingDate: Joi.date()
        .required()
        .greater(Date.now() - 24 * 60 * 60 * 1000),
});

const UpdateTicketSchema = Joi.object({
    code: Joi.string(),
    bookingDate: Joi.date().greater(Date.now() - 24 * 60 * 60 * 1000),
});

// flightSeat
const createFlightSeatSchema = Joi.object({
    flightId: Joi.string().required(),
    seatNumber: Joi.string().required(),
    type: Joi.string().valid("ECONOMY", "BUSINESS", "FIRST").required(),
});

module.exports = {
    LoginSchema,
    RegisterSchema,
    OTPSchema,
    createFlightSchema,
    updateFlightSchema,
    PasswordSchema,
    forgetPasswordSchema,
    userCreateSchema,
    userUpdateSchema,
    createFlightSeatSchema,
    createAirplaneSchema,
    updateAirplaneSchema,
    createAirportSchema,
    updateAirportSchema,
    TicketSchema,
    UpdateTicketSchema,
};
