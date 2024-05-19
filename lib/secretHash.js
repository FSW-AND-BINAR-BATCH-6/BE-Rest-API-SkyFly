const createHttpError = require("http-errors");
const bcrypt = require("bcrypt");

const secretHash = (string) => {
    const saltRounds = parseInt(process.env.SALT);
    const hashed = bcrypt.hashSync(string, saltRounds);
    return hashed;
};

const secretCompare = (data, hashed) => {
    return bcrypt.compareSync(data, hashed);
};

module.exports = {
    secretHash,
    secretCompare,
};
