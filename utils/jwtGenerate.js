const jwt = require("jsonwebtoken");

const generateJWT = async (payload) => {
    return jwt.sign(payload, process.env.JWT_SIGNATURE_KEY, {
        expiresIn: process.env.JWT_EXPIRED,
    });
};

module.exports = { generateJWT };
