const Joi = require("joi")

const createAirplaneSchema = Joi.object({
    name: Joi.string().min(6).max(30).required(),
    code: Joi.string().min(5).max(6).required()
})

const updateAirplaneSchema = Joi.object({
    name: Joi.string().min(6).max(30),
    code: Joi.string().min(5).max(6)
})

module.exports = {createAirplaneSchema, updateAirplaneSchema}