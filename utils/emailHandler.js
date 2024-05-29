const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const nodeMailer = require("../lib/nodeMailer");

const prisma = new PrismaClient();

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

    const urlTokenVerification = `${process.env.BASE_URL}/auth/${type}?token=${dataUrl.token}`;

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
    generateSecretEmail,
};
