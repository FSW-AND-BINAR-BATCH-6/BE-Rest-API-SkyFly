const jwt = require("jsonwebtoken")

const generateJWT = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRED
        }
    )

}

module.exports = {generateJWT}