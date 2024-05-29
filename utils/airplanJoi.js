const Joi = require("joi");

const createAirplaneSchema = Joi.object({
    name: Joi.string().min(6).max(30).pattern(/^[A-Za-z\s]+$/).required(),
    code: Joi.string().min(5).max(6).required(),
});

const updateAirplaneSchema = Joi.object({
    name: Joi.string().min(6).max(30).pattern(/^[A-Za-z\s]+$/),
    code: Joi.string().min(5).max(6),
});

const createAirportSchema = Joi.object({
    name: Joi.string().min(2).max(70).required(),
    code: Joi.string().min(3).max(3).required(),
    country: Joi.string().pattern(/^[A-Za-z\s]+$/).required(),
    city: Joi.string().pattern(/^[A-Za-z\s]+$/).required(),
});

const updateAirportSchema = Joi.object({
    name: Joi.string().min(2).max(70).pattern(/^[A-Za-z\s]+$/),
    code: Joi.string().min(3).max(3),
    country: Joi.string().min(3).max(25).pattern(/^[A-Za-z\s]+$/),
    city: Joi.string().min(3).max(40).pattern(/^[A-Za-z\s]+$/),
});
module.exports = {
    createAirplaneSchema,
    updateAirplaneSchema,
    createAirportSchema,
    updateAirportSchema,
};
