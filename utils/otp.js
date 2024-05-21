const OTPAuth = require("otpauth");
const nodeMailer = require("../lib/nodeMailer");
const jwt = require("jsonwebtoken");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

const generateSecretEmail = async (dataUrl, type, template) => {
    const payload = jwt.verify(dataUrl.token, process.env.JWT_SIGNATURE_KEY);

    await prisma.auth.update({
        where: {
            email: payload.email,
        },
        data: {
            secretToken: payload.token,
        },
    });

    const urlTokenVerification = `http://localhost:${process.env.PORT}/api/v1/auth/${type}?token=${dataUrl.token}`;

    const html = await nodeMailer.getHtml(template, {
        email: payload.email,
        OTPToken: payload.otp,
        urlTokenVerification,
    });

    nodeMailer.sendEmail(
        payload.email,
        `${payload.emailTitle} | SkyFly Team 01 Jago`,
        html
    );

    return urlTokenVerification;
};

module.exports = {
    generateTOTP,
    validateTOTP,
    getSeconds,
    generateSecretEmail,
};
