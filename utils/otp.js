const OTPAuth = require("otpauth");

const totp = new OTPAuth.TOTP({
    issuer: "ACME",
    label: "AzureDiamond",
    algorithm: "SHA1",
    digits: 6,
    period: 180, // by second
    secret: "NB2W45DFOIZA",
});

const generateTOTP = () => {
    return totp.generate();
};

const validateTOTP = (tokenOtp) => {
    return totp.validate({
        token: tokenOtp,
        window: 1,
    });
};

const getSeconds = () => {
    let seconds =
        (totp.period * (1 - ((Date.now() / 1000 / totp.period) % 1))) | 0;
    return seconds;
};

module.exports = {
    generateTOTP,
    validateTOTP,
    getSeconds,
};
