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
    transitArrivalDate: Joi.date().iso().messages({
        'date.format': '"transitArrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    transitDepartureDate: Joi.date().iso().messages({
        'date.format': '"transitDepartureDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    arrivalDate: Joi.date().iso().required().messages({
        "date.format":
            '"arrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    transitAirportId: Joi.string(),
    destinationAirportId: Joi.string().required(),
    price: Joi.number().required(),
    capacity: Joi.number().required(),
    facilities: Joi.string()
});

const updateFlightSchema = Joi.object({
    planeId: Joi.string().required(),
    departureDate: Joi.date().iso().required().messages({
        'date.format': '"departureDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    departureAirportId: Joi.string().required(),
    transitArrivalDate: Joi.date().iso().messages({
        'date.format': '"transitArrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    transitDepartureDate: Joi.date().iso().messages({
        'date.format': '"transitDepartureDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    arrivalDate: Joi.date().iso().required().messages({
        "date.format":
            '"arrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    transitAirportId: Joi.string(),
    destinationAirportId: Joi.string().required(),
    price: Joi.number().required(),
    capacity: Joi.number().required(),
    facilities: Joi.string()
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
