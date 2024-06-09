const setRateLimit = require('express-rate-limit');
const createHttpError = require('http-errors');

const rateLimit = (windowMs, max, message, header, keyGenerator) => {
    try {
        return setRateLimit({
            windowMs: windowMs,
            max: max,
            message: message,
            headers: header,
            keyGenerator: keyGenerator
        })
    } catch (error) {
        next(createHttpError(500, {message: error.message}))
    }
}

module.exports = { rateLimit }