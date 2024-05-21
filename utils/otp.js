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

module.exports = {
    generateTOTP,
    validateTOTP,
};
