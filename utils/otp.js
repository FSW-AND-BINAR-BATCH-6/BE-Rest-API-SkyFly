const OTPAuth = require("otpauth");
const nodeMailer = require("../lib/nodeMailer");


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

const generateOTPEmail = async (dataUrl, OTPToken, email, type) => {
    const urlTokenVerification = `http://localhost:${process.env.PORT}/api/v1/auth/${type}?secret=${
        dataUrl.secret
            }&data=${dataUrl.data}&key=${dataUrl.key}&unique=${
                dataUrl.unique + dataUrl.note
            }`;

    console.log(urlTokenVerification)
    const html = await nodeMailer.getHtml("verifyOtp.ejs", {
        email: email,
        OTPToken,
        urlTokenVerification,
    });

    nodeMailer.sendEmail(
        email,
        "Email Activation | SkyFly Team 01 Jago",
        html
    );

    return urlTokenVerification
}

module.exports = {
    generateTOTP,
    validateTOTP,
    getSeconds,
    generateOTPEmail
};
