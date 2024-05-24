const Joi = require("joi").extend(require("@joi/date"));

//ticket
const TicketSchema = Joi.object({
    bookingDate: Joi.date()

        .required()
        .greater(Date.now() - 24 * 60 * 60 * 1000),
    // bookingDate: Joi.date()
    //     .required()
    //     .greater(Date.now() - 24 * 60 * 60 * 1000),
    price: Joi.number().positive().required(),
    status: Joi.string().valid("PENDING", "SUCCESS", "FAILED").required(),
});

const UpdateTicketSchema = Joi.object({
    bookingDate: Joi.date().min("now"),
    price: Joi.number().positive(),
    status: Joi.string(),
});

module.exports = { TicketSchema, UpdateTicketSchema };
