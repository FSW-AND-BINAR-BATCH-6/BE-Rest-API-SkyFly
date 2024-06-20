const bcrypt = require("bcrypt");

const secretHash = async (string) => {
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
