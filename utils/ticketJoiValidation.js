const Joi = require("joi").extend(require("@joi/date"));

//ticket
const TicketSchema = Joi.object({
    flightId: Joi.string().required(),
    userId: Joi.string().required(),
    seatId: Joi.string().required(),
    bookingDate: Joi.date()
        .required()
        .greater(Date.now() - 24 * 60 * 60 * 1000),
    // bookingDate: Joi.date()
    //     .required()
    //     .greater(Date.now() - 24 * 60 * 60 * 1000),
    price: Joi.number().positive().required(),
});

const UpdateTicketSchema = Joi.object({
    code: Joi.string(),
    bookingDate: Joi.date().greater(Date.now() - 24 * 60 * 60 * 1000),
    price: Joi.number().positive(),
});

module.exports = { TicketSchema, UpdateTicketSchema };
