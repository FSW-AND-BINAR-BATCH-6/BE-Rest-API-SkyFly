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
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/, "only alphabet characters is allowed")
        .required(),
    email: Joi.string()
        .email({
            minDomainSegments: 2,
            maxDomainSegments: 3,
            tlds: { allow: ["com", "net", "id"] },
        })
        .required(),
    phoneNumber: Joi.string().min(10).max(16).required(),
    password: Joi.string().min(8).max(20).required(),
});

const updateUserLoginSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(30)
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/, "only alphabet characters is allowed"),
    email: Joi.string().email({
        minDomainSegments: 2,
        maxDomainSegments: 3,
        tlds: { allow: ["com", "net", "id"] },
    }),
    phoneNumber: Joi.string().min(10).max(16),
    familyName: Joi.string(),
    password: Joi.string().min(8).max(20),
    confirmPassword: Joi.any().valid(Joi.ref("password")).messages({
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
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/, "only alphabet characters is allowed")
        .required(),
    phoneNumber: Joi.string().min(10).max(16).optional(),
    familyName: Joi.string()
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/, "only alphabet characters is allowed")
        .optional(),
    role: Joi.string().valid("BUYER", "ADMIN").default("BUYER"), // Set default value for role
    isVerified: Joi.boolean().optional(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(20),
    confirmPassword: Joi.any().valid(Joi.ref("password")).messages({
        "any.only": "Confirm password does not match password",
    }),
});

const userUpdateSchema = Joi.object({
    name: Joi.string().regex(
        /^(?!\s*$)[a-zA-Z\s]+$/,
        "only alphabet characters is allowed"
    ),
    phoneNumber: Joi.string().min(10).max(16),
    familyName: Joi.string()
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/, "only alphabet characters is allowed")
        .optional(),
    password: Joi.string().min(8).max(20),
    confirmPassword: Joi.any().valid(Joi.ref("password")).messages({
        "any.only": "Confirm password does not match password",
    }),
    role: Joi.string().valid("ADMIN", "BUYER").optional(),
    isVerified: Joi.boolean().optional(),
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
    departureAirportId: Joi.string().regex(
        /^[a-zA-Z0-9]*$/,
        "only alphabet numeric characters is allowed"
    ),
    arrivalDate: Joi.date().iso().messages({
        "date.format":
            '"arrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    transitAirportId: Joi.string().regex(/^[a-zA-Z0-9]*$/),
    transitArrivalDate: Joi.date().iso().messages({
        "date.format":
            '"arrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    transitDepartureDate: Joi.date().iso().messages({
        "date.format":
            '"arrivalDate" must be in ISO format, eg: 2024-01-07 09:30:00',
    }),
    destinationAirportId: Joi.string().regex(
        /^[a-zA-Z0-9]*$/,
        "only alphabet numeric characters is allowed"
    ),
    discount: Joi.number().min(0).max(100),
    price: Joi.number().required(),
    capacity: Joi.number().min(2).max(850),
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
    flightId: Joi.string().required(),
    seatNumber: Joi.string()
        .min(2)
        .max(4)
        .regex(/^[a-zA-Z0-9]*$/, "only alphabet numeric characters is allowed")
        .required(),
    type: Joi.string().valid("ECONOMY", "BUSINESS", "FIRST").required(),
    status: Joi.string()
        .valid("AVAILABLE", "OCCUPIED", "BOOKED")
        .default("AVAILABLE"),
});

const updateSeatSchema = Joi.object({
    seatNumber: Joi.string()
        .min(2)
        .max(4)
        .regex(/^[a-zA-Z0-9]*$/, "only alphabet numeric characters is allowed")
        .required(),
    status: Joi.string().valid("AVAILABLE", "OCCUPIED", "BOOKED").required(),
});

// Airline
const createAirlineSchema = Joi.object({
    name: Joi.string()
        .min(6)
        .max(20)
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/, "only alphabet characters is allowed")
        .required(),
    code: Joi.string()
        .min(2)
        .max(2)
        .regex(
            /^(?!\s*$)[a-zA-Z\s]+$/,
            "only alphabet numeric characters is allowed"
        )
        .required(),
    terminal: Joi.string().required(),
});

const updateAirlineSchema = Joi.object({
    name: Joi.string()
        .min(6)
        .max(20)
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/, "only alphabet characters is allowed"),
    code: Joi.string()
        .min(2)
        .max(2)
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/, "only alphabet characters is allowed"),
    terminal: Joi.string(),
});

// Airport
const createAirportSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(70)
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/, "only alphabet characters is allowed")
        .required(),
    code: Joi.string()
        .min(3)
        .max(3)
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/, "only alphabet characters is allowed")
        .required(),
    country: Joi.string()
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/, "only alphabet characters is allowed")
        .required(),
    city: Joi.string()
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/, "only alphabet characters is allowed")
        .required(),
    continent: Joi.string().required(),
});

const updateAirportSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(70)
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/, "only alphabet characters is allowed"),
    code: Joi.string()
        .min(3)
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/, "only alphabet characters is allowed")
        .max(3),
    country: Joi.string()
        .min(3)
        .max(25)
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/, "only alphabet characters is allowed"),
    city: Joi.string()
        .min(3)
        .max(40)
        .regex(/^(?!\s*$)[a-zA-Z\s]+$/, "only alphabet characters is allowed"),
    continent: Joi.string().regex(
        /^(?!\s*$)[a-zA-Z\s]+$/,
        "only alphabet characters is allowed"
    ),
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

// Notifications

const createNotificationsSchema = Joi.object({
    type: Joi.string()
        .valid("Warning", "Information", "Update", "Promotions")
        .required(),
    title: Joi.string().required(),
    content: Joi.string().required(),
});

const updateNotificationsSchema = Joi.object({
    type: Joi.string().valid("Warning", "Information", "Update", "Promotions"),
    title: Joi.string(),
    content: Joi.string(),
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
    createNotificationsSchema,
    updateNotificationsSchema,
};
