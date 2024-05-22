const Joi = require("joi");

// Skema validasi dengan Joi
const userSchema = Joi.object({
    name: Joi.string().required(),
    phoneNumber: Joi.string().optional(),
    role: Joi.string().required(),
});


const userUpdateSchema = Joi.object({
    id: Joi.string(),
    name: Joi.string(),
    phoneNumber: Joi.string().optional(),
    role: Joi.string().required(),
});

module.exports = { userSchema, userUpdateSchema};