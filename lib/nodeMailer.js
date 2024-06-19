const nodemailer = require("nodemailer");
const ejs = require("ejs");
const createHttpError = require("http-errors");
const { APP_EMAIL, APP_PASS } = process.env;

const sendEmail = async (to, subject, html) => {
    const transport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: APP_EMAIL,
            pass: APP_PASS,
        },
    });

    await transport.sendMail({ to, subject, html });
};

const getHtml = async (fileName, data) => {
    try {
        const path = `${__dirname}/../views/templates/${fileName}`;
        const html = await ejs.renderFile(path, data);
        return html;
    } catch (error) {
        next(
            createHttpError(500, {
                message: error.message,
            })
        );
    }
};
module.exports = {
    sendEmail,
    getHtml,
};
