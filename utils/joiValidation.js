const Joi = require("joi").extend(require("@joi/date"));

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

const updateUserLoginSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(30)
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/) //will allow user to input only alphabet and won't accept if there is only blank space
        .required(),
    email: Joi.string().email({
        minDomainSegments: 2,
        maxDomainSegments: 3,
        tlds: { allow: ["com", "net", "id"] },
    }),
    phoneNumber: Joi.string().min(11).max(13),
    familyName: Joi.string(),
    password: Joi.string().min(8).max(20),
    confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
        "any.only": "Confirm password does not match password",
    }),
});

const PasswordSchema = Joi.object({
    password: Joi.string().min(8).max(30).required(),
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
    familyName: Joi.string().regex(/^(?!\s*$)[a-zA-Z\s]+$/),
    role: Joi.forbidden(), // Ensure role is not allowed in request body
});

// flight
const createFlightSchema = Joi.object({
    planeId: Joi.string()
        .regex(/^[a-zA-Z0-9]*$/)
        .required(),
    departureDate: Joi.date().iso().required().messages({
        "date.format":
            '"departureDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    departureAirportId: Joi.string().required(),
    arrivalDate: Joi.date().iso().required().messages({
        "date.format":
            '"arrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    transitAirportId: Joi.string().allow(null),
    transitArrivalDate: Joi.alternatives().conditional("transitAirportId", {
        is: Joi.exist(),
        then: Joi.date().iso().required().messages({
            "date.format":
                '"transitArrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
        }),
        otherwise: Joi.forbidden(),
    }),
    transitDepartureDate: Joi.alternatives().conditional("transitAirportId", {
        is: Joi.exist(),
        then: Joi.date().iso().required().messages({
            "date.format":
                '"transitDepartureDate" must be in ISO format, eg: 2024-01-07 09:30:00',
        }),
        otherwise: Joi.forbidden(),
    }),
    destinationAirportId: Joi.string().required(),
    price: Joi.number().required(),
    discount: Joi.number().min(0).max(100),
    capacity: Joi.number().min(2).max(850).required(),
    facilities: Joi.string(),
});

const updateFlightSchema = Joi.object({
    planeId: Joi.string(),
    departureDate: Joi.date().iso().messages({
        "date.format":
            '"departureDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    departureAirportId: Joi.string(),
    arrivalDate: Joi.date().iso().messages({
        "date.format":
            '"arrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    transitAirportId: Joi.string(),
    transitArrivalDate: Joi.date().iso().messages({
        "date.format":
            '"arrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    transitDepartureDate: Joi.date().iso().messages({
        "date.format":
            '"arrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    destinationAirportId: Joi.string().required(),
    discount: Joi.number().min(0).max(100),
    price: Joi.number().required(),
    capacity: Joi.number().min(2).max(850).required(),
    facilities: Joi.string(),
});

// ticket
const TicketSchema = Joi.object({
    flightId: Joi.string().required(),
    userId: Joi.string().required(),
    seatId: Joi.string().required(),
    transactionId: Joi.string().required(),
    detailTransactionId: Joi.string().required(),
});

const UpdateTicketSchema = Joi.object({
    flightId: Joi.string(),
    userId: Joi.string(),
    seatId: Joi.string(),
    transactionId: Joi.string(),
    detailTransactionId: Joi.string(),
});

// flightSeat
const createSeatSchema = Joi.object({
    flightId: Joi.string()
        .regex(/^[a-zA-Z0-9]*$/)
        .required(),
    seatNumber: Joi.string().min(2).max(4).required(),
    type: Joi.string().valid("ECONOMY", "BUSINESS", "FIRST").required(),
    status: Joi.string()
        .valid("AVAILABLE", "OCCUPIED", "BOOKED")
        .default("AVAILABLE"),
});

const updateSeatSchema = Joi.object({
    seatNumber: Joi.string()
        .regex(/^[a-zA-Z0-9]*$/)
        .required(),
    status: Joi.string().valid("AVAILABLE", "OCCUPIED", "BOOKED").required(),
});

// Airline
const createAirlineSchema = Joi.object({
    name: Joi.string()
        .min(6)
        .max(20)
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/)
        .required(),
    code: Joi.string().min(2).max(2).required(),
});

const updateAirlineSchema = Joi.object({
    name: Joi.string()
        .min(6)
        .max(20)
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/),
    code: Joi.string().min(2).max(2),
});

// Airport
const createAirportSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(70)
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/)
        .required(),
    code: Joi.string().min(3).max(3).required(),
    country: Joi.string()
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/)
        .required(),
    city: Joi.string()
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/)
        .required(),
});

const updateAirportSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(70)
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/),
    code: Joi.string().min(3).max(3),
    country: Joi.string()
        .min(3)
        .max(25)
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/),
    city: Joi.string()
        .min(3)
        .max(40)
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/),
});

// transaction
const BankSchema = Joi.object({
    bank: Joi.string().valid("bca", "bni", "bri", "mandiri", "permata", "cimb"),
    payment_type: Joi.string(),
    fullName: Joi.string().required(),
    familyName: Joi.string(),
    phoneNumber: Joi.string().min(10).required(),
    email: Joi.string()
        .email({
            minDomainSegments: 2,
            maxDomainSegments: 3,
            tlds: { allow: ["com", "net", "id"] },
        })
        .required(),
    first_title: Joi.string().required(),
    first_fullName: Joi.string().required(),
    first_dob: Joi.date().required(),
    first_validityPeriod: Joi.date().required().greater(Date.now()),
    first_familyName: Joi.string().required(),
    first_citizenship: Joi.string().required(),
    first_issuingCountry: Joi.string().required(),
    first_price: Joi.number().required(),
    first_quantity: Joi.number().required(),
    first_seatId: Joi.string().required(),

    second_title: Joi.string(),
    second_fullName: Joi.string(),
    second_dob: Joi.date(),
    second_validityPeriod: Joi.date().greater(Date.now()),
    second_familyName: Joi.string(),
    second_citizenship: Joi.string(),
    second_issuingCountry: Joi.string(),
    second_price: Joi.number(),
    second_quantity: Joi.number(),
    second_seatId: Joi.string(),
});

const GopaySchema = Joi.object({
    fullName: Joi.string().required(),
    familyName: Joi.string(),
    phoneNumber: Joi.string().min(10).required(),
    email: Joi.string()
        .email({
            minDomainSegments: 2,
            maxDomainSegments: 3,
            tlds: { allow: ["com", "net", "id"] },
        })
        .required(),
    first_title: Joi.string().required(),
    first_fullName: Joi.string().required(),
    first_dob: Joi.date().required(),
    first_validityPeriod: Joi.date().required().greater(Date.now()),
    first_familyName: Joi.string().required(),
    first_citizenship: Joi.string().required(),
    first_issuingCountry: Joi.string().required(),
    first_price: Joi.number().required(),
    first_quantity: Joi.number().required(),
    first_seatId: Joi.string().required(),

    second_title: Joi.string(),
    second_fullName: Joi.string(),
    second_dob: Joi.date(),
    second_validityPeriod: Joi.date().greater(Date.now()),
    second_familyName: Joi.string(),
    second_citizenship: Joi.string(),
    second_issuingCountry: Joi.string(),
    second_price: Joi.number(),
    second_quantity: Joi.number(),
    second_seatId: Joi.string(),
});

const SnapSchema = Joi.object({
    fullName: Joi.string().required(),
    familyName: Joi.string(),
    phoneNumber: Joi.string().min(10).required(),
    email: Joi.string()
        .email({
            minDomainSegments: 2,
            maxDomainSegments: 3,
            tlds: { allow: ["com", "net", "id"] },
        })
        .required(),
    first_title: Joi.string().required(),
    first_fullName: Joi.string().required(),
    first_dob: Joi.date().required(),
    first_validityPeriod: Joi.date().required().greater(Date.now()),
    first_familyName: Joi.string().required(),
    first_citizenship: Joi.string().required(),
    first_issuingCountry: Joi.string().required(),
    first_price: Joi.number().required(),
    first_quantity: Joi.number().required(),
    first_seatId: Joi.string().required(),

    second_title: Joi.string(),
    second_fullName: Joi.string(),
    second_dob: Joi.date(),
    second_validityPeriod: Joi.date().greater(Date.now()),
    second_familyName: Joi.string(),
    second_citizenship: Joi.string(),
    second_issuingCountry: Joi.string(),
    second_price: Joi.number(),
    second_quantity: Joi.number(),
    second_seatId: Joi.string(),
});

const CCSchema = Joi.object({
    card_number: Joi.string().min(8).required(),
    card_exp_month: Joi.string().min(1).required(),
    card_exp_year: Joi.string().min(4).required(),
    card_cvv: Joi.string().required(),

    fullName: Joi.string().required(),
    familyName: Joi.string(),
    phoneNumber: Joi.string().min(10).required(),
    email: Joi.string()
        .email({
            minDomainSegments: 2,
            maxDomainSegments: 3,
            tlds: { allow: ["com", "net", "id"] },
        })
        .required(),
    first_title: Joi.string().required(),
    first_fullName: Joi.string().required(),
    first_dob: Joi.date().required(),
    first_validityPeriod: Joi.date().required().greater(Date.now()),
    first_familyName: Joi.string().required(),
    first_citizenship: Joi.string().required(),
    first_issuingCountry: Joi.string().required(),
    first_price: Joi.number().required(),
    first_quantity: Joi.number().required(),
    first_seatId: Joi.string().required(),

    second_title: Joi.string(),
    second_fullName: Joi.string(),
    second_dob: Joi.date(),
    second_validityPeriod: Joi.date().greater(Date.now()),
    second_familyName: Joi.string(),
    second_citizenship: Joi.string(),
    second_issuingCountry: Joi.string(),
    second_price: Joi.number(),
    second_quantity: Joi.number(),
    second_seatId: Joi.string(),
});

const updateTransactionSchema = Joi.object({
    totalPrice: Joi.number().required(),
    status: Joi.string().valid("pending", "paid").required(),
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
    createSeatSchema,
    updateSeatSchema,
    createAirlineSchema,
    updateAirlineSchema,
    createAirportSchema,
    updateAirportSchema,
    TicketSchema,
    UpdateTicketSchema,
    updateUserLoginSchema,
    BankSchema,
    GopaySchema,
    CCSchema,
    SnapSchema,
    updateTransactionSchema,
};
