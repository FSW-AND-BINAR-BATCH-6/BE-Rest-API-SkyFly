const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");
const { generateTOTP, validateTOTP } = require("../utils/otp");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createHttpError = require("http-errors");
const nodeMailer = require("../lib/nodeMailer");

const prisma = new PrismaClient();

const handleRegister = async (req, res, next) => {
    try {
        const data = req.body;

        const saltRounds = parseInt(process.env.SALT);
        const hashedPassword = bcrypt.hashSync(data.password, saltRounds);

        const OTPToken = generateTOTP();

        try {
            const userauthData = await prisma.user.create({
                data: {
                    id: randomUUID(),
                    name: data.name,
                    phoneNumber: data.phoneNumber,
                    role: "CUSTOMER",
                    Auth: {
                        create: {
                            id: randomUUID(),
                            email: data.email,
                            password: hashedPassword,
                            otpToken: OTPToken,
                            isVerified: false,
                        },
                    },
                },
            });

            const urlTokenVerification = `http://localhost:2000/api/v1/auth/verified?secret=${bcrypt.hashSync(
                userauthData.id,
                saltRounds
            )}&data=${data.email}&key=${userauthData.id}&unique=${
                userauthData.phoneNumber
            }skyfly1`;

            const html = await nodeMailer.getHtml("verifyOtp.ejs", {
                email: data.email,
                OTPToken,
                urlTokenVerification,
            });

            nodeMailer.sendEmail(
                data.email,
                "Email Activation | SkyFly Team 01 Jago",
                html
            );

            res.status(200).json({
                status: true,
                message:
                    "Verification token has been sent, please check your email",
                data: {
                    name: data.name,
                    email: data.email,
                    phoneNumber: data.phoneNumber,
                },
            });
        } catch (error) {
            next(createHttpError(409, { message: "Email has already taken" }));
        }
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const handleLogin = async (req, res, next) => {
    try {
        const data = req.body;

        const userAccount = await prisma.auth.findUnique({
            where: {
                email: data.email,
            },
            include: {
                user: true,
            },
        });

        if (
            userAccount &&
            bcrypt.compareSync(data.password, userAccount.password)
        ) {
            const token = jwt.sign(
                {
                    id: userAccount.user.id,
                    name: userAccount.user.name,
                    email: userAccount.email,
                    phoneNumber: userAccount.user.phoneNumber,
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRED,
                }
            );

            res.status(200).json({
                message: "user logged in successfully",
                _token: token,
            });
        }

        !userAccount
            ? next(createHttpError(404, { message: "email not registered" }))
            : null;
        !bcrypt.compareSync(data.password, userAccount.password)
            ? next(createHttpError(401, { message: "Wrong password" }))
            : null;
    } catch (error) {
        next(createHttpError(500, { error: error.message }));
    }
};

const resendOTP = async (req, res, next) => {
    try {
        const { secret, data, key, unique } = req.query;

        const saltRounds = parseInt(process.env.SALT);

        if (!bcrypt.compareSync(key, secret)) {
            return next(
                createHttpError(401, {
                    message: "You does not have an access to be here",
                })
            );
        }

        const foundUser = await prisma.auth.findUnique({
            where: {
                email: data,
            },
            include: {
                user: true,
            },
        });

        if (!foundUser) {
            return next(createHttpError(404, { message: "User is not found" }));
        }

        if (foundUser.isVerified) {
            return next(
                createHttpError(403, {
                    message: "User email has been verified",
                })
            );
        }

        const OTPToken = generateTOTP();

        await prisma.auth.update(
            {
                where: { email: data },
            },
            {
                otpToken: OTPToken,
            }
        );

        const urlTokenVerification = `http://localhost:2000/api/v1/auth/verified?secret=${bcrypt.hashSync(
            key,
            saltRounds
        )}&data=${data}&key=${key}&unique=${unique}skyfly1-resendOTP`;

        const html = await nodeMailer.getHtml("verifyOtp.ejs", {
            email: data,
            OTPToken,
            urlTokenVerification,
        });

        nodeMailer.sendEmail(
            data,
            "Email Activation | SkyFly Team 01 Jago",
            html
        );

        res.status(201).json({
            status: true,
            message: "Verification link has been sent, please check your email",
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const verifyOTP = async (req, res, next) => {
    try {
        const { secret, data, key, unique } = req.query;
        const { otp } = req.body;

        if (!bcrypt.compareSync(key, secret)) {
            return next(
                createHttpError(401, {
                    message: "You does not have an access to be here",
                })
            );
        }

        const foundUser = await prisma.auth.findUnique({
            where: {
                email: data,
            },
            include: {
                user: true,
            },
        });

        if (!foundUser) {
            return next(createHttpError(404, { message: "User is not found" }));
        }

        let delta = validateTOTP(otp);

        if (delta === null || delta === 0 || otp != foundUser.otpToken) {
            return next(
                createHttpError(422, { message: "Token OTP is invalid" })
            );
        }

        await prisma.auth.update({
            where: {
                id: foundUser.id,
            },
            data: {
                isVerified: true,
            },
        });

        res.status(200).json({
            status: true,
            message: "user email verified successfully",
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const sendResetPassword = async (req, res, next) => {
    try {
        const saltRounds = parseInt(process.env.SALT);
        const { email } = req.body;

        const foundUser = await prisma.auth.findUnique({
            where: {
                email,
            },
            include: {
                user: true,
            },
        });

        if (!foundUser) {
            return next(
                createHttpError(404, {
                    message:
                        "User is not found and reset password link is invalid",
                })
            );
        }

        const urlResetPassword = `http://localhost:2000/api/v1/auth/resetPassword?secret=${bcrypt.hashSync(
            email,
            saltRounds
        )}&data=${email}&key=${foundUser.id}&unique=${
            foundUser.userId
        }skyfly1-resetPassword`;

        const html = await nodeMailer.getHtml("emailPasswordReset.ejs", {
            email,
            urlResetPassword,
        });

        nodeMailer.sendEmail(
            email,
            "Reset Password | SkyFly Team 01 Jago",
            html
        );

        res.status(200).json({
            status: true,
            message:
                "Reset password link has been sent, please check your email",
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { secret, data, key, unique } = req.query;
        const { password, confirmPassword } = req.body;

        const saltRounds = parseInt(process.env.SALT);
        const hashedPassword = bcrypt.hashSync(password, saltRounds);

        if (!bcrypt.compareSync(data, secret)) {
            return next(
                createHttpError(401, {
                    message: "You does not have an access to be here",
                })
            );
        }

        const foundUser = await prisma.auth.findUnique({
            where: {
                email: data,
            },
            include: {
                user: true,
            },
        });

        if (!foundUser) {
            return next(createHttpError(404, { message: "User is not found" }));
        }

        await prisma.auth.update({
            where: {
                id: foundUser.id,
            },
            data: {
                password: hashedPassword,
            },
        });

        res.status(200).json({
            status: true,
            message: "user password updated successfully",
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

module.exports = {
    handleRegister,
    handleLogin,
    verifyOTP,
    resendOTP,
    sendResetPassword,
    resetPassword,
};
