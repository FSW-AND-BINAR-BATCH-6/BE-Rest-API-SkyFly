const Joi = require("joi")

const validator = (schema) => (payload) => {
    const {error, value} = schema.validate(payload, {abortEarly: false});
    return {error, value}
}

const handleLoginInput = Joi.object({
    password: Joi.string().min(8).max(20).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required()
})

const handleRegisterInput = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    phoneNumber: Joi.string().min(10).max(13).required(),
    password: Joi.string().min(8).max(20).required()
})

const validateLoginInput = validator(handleLoginInput)
const validateRegisterInput = validator(handleRegisterInput)

module.exports = {validateLoginInput, validateRegisterInput}