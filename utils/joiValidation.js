const Joi = require("joi");

// auth
const LoginSchema = Joi.object({
    password: Joi.string().min(8).max(50).required(),
    email: Joi.string()
        .email({
            minDomainSegments: 2,
            maxDomainSegments: 3,
            tlds: { allow: ["com", "net", "id"] },
        })
        .required(),
});

const RegisterSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(30)
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/) //will allow user to input only alphabet and won't accept if there is only blank space
        .required(),
    email: Joi.string()
        .email({
            minDomainSegments: 2,
            maxDomainSegments: 3,
            tlds: { allow: ["com", "net", "id"] },
        })
        .required(),
    phoneNumber: Joi.string().min(11).max(13).required(),
    password: Joi.string().min(8).max(20).required(),
});

const PasswordSchema = Joi.object({
    password: Joi.string().min(8).max(20).required(),
    confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
        "any.only": "Confirm password does not match password",
    }),
});

const OTPSchema = Joi.object({
    otp: Joi.string().min(6).max(6).required(),
});

const forgetPasswordSchema = Joi.object({
    email: Joi.string()
        .email({
            minDomainSegments: 2,
            maxDomainSegments: 3,
            tlds: { allow: ["com", "net", "id"] },
        })
        .required(),
});

// user
const userCreateSchema = Joi.object({
    name: Joi.string()
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/)
        .required(),
    phoneNumber: Joi.string().min(11).max(13).optional(),
    familyName: Joi.string()
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/)
        .required(),
    role: Joi.string().valid("BUYER", "ADMIN").default("BUYER"), // Set default value for role
});

const userUpdateSchema = Joi.object({
    id: Joi.string(),
    name: Joi.string().regex(/^(?!\s*$)[a-zA-Z\s]+$/),
    phoneNumber: Joi.string().optional(),
    familyName: Joi.string()
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/)
        .required(),
    role: Joi.forbidden(), // Ensure role is not allowed in request body
});

// flight
const createFlightSchema = Joi.object({
    planeId: Joi.string().regex(/^\d+$/).required(), //will only accept number
    departureDate: Joi.date().iso().required().messages({
        "date.format":
            '"departureDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    departureAirportId: Joi.string().regex(/^\d+$/).required(),
    arrivalDate: Joi.date().iso().required().messages({
        "date.format":
            '"arrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    destinationAirportId: Joi.string().regex(/^\d+$/).required(),
    price: Joi.number().required(),
    capacity: Joi.number().min(2).max(850).required(),
});

const updateFlightSchema = Joi.object({
    planeId: Joi.string().regex(/^\d+$/),
    departureDate: Joi.date().iso().required().messages({
        "date.format":
            '"departureDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }).optional(),
    departureAirportId: Joi.string().regex(/^\d+$/),
    arrivalDate: Joi.date().iso().required().messages({
        "date.format":
            '"arrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }).optional(),
    destinationAirportId: Joi.string().regex(/^\d+$/),
    price: Joi.number().optional(),
    capacity: Joi.number().min(2).max(850).optional()
});

// flightSeat
const createFlightSeatSchema = Joi.object({
    flightId: Joi.string().required(),
    seatNumber: Joi.string().required(),
    type: Joi.string().valid("ECONOMY", "BUSINESS", "FIRST").required(),
});

// Airline
const createAirlineSchema = Joi.object({
    name: Joi.string()
        .min(6)
        .max(30)
        .pattern(/^[A-Za-z\s]+$/)
        .required(),
    code: Joi.string().min(5).max(6).required(),
});

const updateAirlineSchema = Joi.object({
    name: Joi.string()
        .min(6)
        .max(30)
        .pattern(/^[A-Za-z\s]+$/),
    code: Joi.string().min(5).max(6),
});

// Airport
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
    createAirlineSchema,
    updateAirlineSchema,
    createAirportSchema,
    updateAirportSchema,
};
