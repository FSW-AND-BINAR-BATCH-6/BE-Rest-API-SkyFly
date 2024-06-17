const jwt = require("jsonwebtoken");
const createHttpError = require("http-errors");
const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");

const { generateTOTP, validateTOTP } = require("../utils/otp");
const { secretCompare, secretHash } = require("../utils/hashSalt");
const { generateJWT } = require("../utils/jwtGenerate");

const { authorizationUrl, oauth2Client } = require("../lib/googleOauth2");
const { google } = require("googleapis");
const { smsHandler } = require("../utils/smsHandler");
const { sendEmail, getHtml } = require("../lib/nodeMailer");

const prisma = new PrismaClient();

const handleRegister = async (req, res, next) => {
    try {
        const { name, phoneNumber, password, email } = req.body;

        // generate secret data
        const hashedPassword = secretHash(password);
        const OTPToken = generateTOTP();

        // data token for verification
        const payload = {
            registerId: randomUUID(),
            email: email,
            emailTitle: "Email Activation",
        };

        // data sent via email
        const dataUrl = {
            // create jwt token for verification token
            token: generateJWT(payload),
        };

        // check email is unvailable
        const checkEmail = await prisma.auth.findUnique({
            where: {
                email: email,
            },
            include: {
                user: true,
            },
        });

        if (checkEmail) {
            return next(
                createHttpError(409, {
                    message: "Email has already been taken",
                })
            );
        }

        // insert data to db
        await prisma.user.create({
            data: {
                id: randomUUID(),
                name: name,
                phoneNumber: phoneNumber,
                role: "BUYER",
                auth: {
                    create: {
                        id: randomUUID(),
                        email: email,
                        password: hashedPassword,
                        otpToken: OTPToken,
                        isVerified: false,
                        secretToken: dataUrl.token,
                    },
                },
            },
        });

        // sending email
        const urlTokenVerification = `${process.env.BASE_URL}/auth/verified?token=${dataUrl.token}`;
        let html = await getHtml("verifyOtp.ejs", {
            email,
            OTPToken,
            urlTokenVerification,
        });

        await sendEmail(email, `${payload.emailTitle} | SkyFly Team C1`, html);

        res.status(200).json({
            status: true,
            message:
                "Verification token has been sent, please check your email",
            _token: dataUrl.token,
        });
    } catch (error) {
        next(
            createHttpError(500, {
                message: error.message,
            })
        );
    }
};

const handleLoginGoogle = async (req, res, next) => {
    try {
        // generate token
        const { code } = req.query;
        const { tokens } = await oauth2Client.getToken(code);

        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: "v2",
        });

        const { data } = await oauth2.userinfo.get();

        if (!data) {
            return next(
                createHttpError(404, {
                    message: "Account Not Found",
                })
            );
        }

        const hashedPassword = secretHash(data.id);
        console.log("=====================================================");
        console.log(`Password google login: ${data.id}`);
        console.log("=====================================================");

        await prisma.auth.upsert({
            where: {
                email: data.email,
            },
            update: {
                isVerified: true,
                secretToken: null,
                otpToken: null,
            },
            create: {
                id: randomUUID(),
                email: data.email,
                password: hashedPassword,
                otpToken: null,
                isVerified: true,
                secretToken: null,
                user: {
                    create: {
                        id: data.id,
                        name: data.name,
                        role: "BUYER",
                    },
                },
            },
        });

        const payload = {
            id: data.id,
            name: data.name,
            email: data.email,
        };

        const token = generateJWT(payload);

        return res.status(200).json({
            status: true,
            message: "User logged in successfully",
            _token: token,
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const handleLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // get user data
        const userAccount = await prisma.auth.findUnique({
            where: {
                email,
            },
            include: {
                user: true,
            },
        });

        if (!userAccount) {
            return next(
                createHttpError(404, {
                    message: "User is not found",
                })
            );
        }

        // check email is unverified
        if (!userAccount.isVerified) {
            return next(
                createHttpError(401, {
                    message: "Email has not been activated",
                })
            );
        }

        // create data user logged in
        const payload = {
            id: userAccount.user.id,
            name: userAccount.user.name,
            email: userAccount.email,
            phoneNumber: userAccount.user.phoneNumber,
        };

        // check password
        if (userAccount && secretCompare(password, userAccount.password)) {
            // create jwt token
            const token = generateJWT(payload);

            res.status(200).json({
                status: true,
                message: "User logged in successfully",
                _token: token,
            });
        }

        // check matching input value
        !userAccount
            ? next(createHttpError(404, { message: "Email not registered" }))
            : null;
        !secretCompare(password, userAccount.password)
            ? next(createHttpError(401, { message: "Wrong password" }))
            : null;
    } catch (error) {
        next(createHttpError(500, { error: error.message }));
    }
};

const resendOTP = async (req, res, next) => {
    try {
        const { token } = req.query;
        // verify jwt token
        const payload = jwt.verify(token, process.env.JWT_SIGNATURE_KEY);

        console.log("masuk");
        // get user data
        const foundUser = await prisma.auth.findUnique({
            where: {
                email: payload.email,
            },
            include: {
                user: true,
            },
        });

        // check user is exist
        if (!foundUser) {
            return next(createHttpError(404, { message: "User is not found" }));
        }

        // check matching token with user secretToken
        if (token !== foundUser.secretToken || token === "" || token === null) {
            return next(createHttpError(404, { message: "Token is invalid" }));
        }

        if (foundUser.isVerified) {
            return next(
                createHttpError(403, {
                    message: "User email has been verified",
                })
            );
        }

        // generate secret data
        const OTPToken = generateTOTP();
        const newPayload = {
            registerId: randomUUID(),
            email: foundUser.email,
            emailTitle: "Resend Email Activation",
        };

        // generate sent data via email
        const dataUrl = {
            token: generateJWT(newPayload),
        };

        // update otp & secretToken user
        await prisma.auth.update({
            where: {
                email: payload.email,
            },
            data: {
                otpToken: OTPToken,
                secretToken: dataUrl.token,
            },
        });

        // sending email
        const urlTokenVerification = `${process.env.BASE_URL}/auth/verified?token=${dataUrl.token}`;
        let html = await getHtml("verifyOtp.ejs", {
            email: payload.email,
            OTPToken,
            urlTokenVerification,
        });

        await sendEmail(
            payload.email,
            `${newPayload.emailTitle} | SkyFly Team C1`,
            html
        );

        res.status(201).json({
            status: true,
            message: "Verification link has been sent, please check your email",
            _token: dataUrl.token,
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const verifyOTP = async (req, res, next) => {
    try {
        const { token } = req.query;
        const { otp } = req.body;

        // decoded data token
        const payload = jwt.verify(token, process.env.JWT_SIGNATURE_KEY);

        // find user
        const foundUser = await prisma.auth.findUnique({
            where: {
                email: payload.email,
            },
            include: {
                user: true,
            },
        });

        // check matching token with user secret token
        if (token !== foundUser.secretToken || token === "" || token === null) {
            return next(createHttpError(404, { message: "Token is invalid" }));
        }

        if (!foundUser) {
            return next(createHttpError(404, { message: "User is not found" }));
        }

        // check is verified
        if (foundUser.isVerified) {
            return next(
                createHttpError(403, {
                    message: "User email has been verified",
                })
            );
        }

        // check token otp status
        let delta = validateTOTP(otp);

        if (delta === null || otp != foundUser.otpToken) {
            return next(
                createHttpError(422, { message: "OTP Token is expired" })
            );
        }

        // update user verified & set value secret data to null
        await prisma.auth.update({
            where: {
                id: foundUser.id,
            },
            data: {
                isVerified: true,
                secretToken: null,
                otpToken: null,
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
                    message: "User is not found",
                })
            );
        }

        const payload = {
            registerId: randomUUID(),
            email: email,
            emailTitle: "Reset Password",
        };

        const dataUrl = {
            token: generateJWT(payload),
        };

        await prisma.auth.update({
            where: {
                email: payload.email,
            },
            data: {
                secretToken: dataUrl.token,
            },
        });

        // sending email
        const urlTokenVerification = `${process.env.BASE_URL}/auth/resetPassword?token=${dataUrl.token}`;

        let html = await getHtml("resetPassword.ejs", {
            email: payload.email,
            urlTokenVerification,
        });

        await sendEmail(
            payload.email,
            `${payload.emailTitle} | SkyFly Team C1`,
            html
        );

        res.status(200).json({
            status: true,
            message:
                "Reset password link has been sent, please check your email",
            _token: dataUrl.token,
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.query;
        const { password } = req.body;

        const payload = jwt.verify(token, process.env.JWT_SIGNATURE_KEY);
        const hashedPassword = secretHash(password);

        const foundUser = await prisma.auth.findUnique({
            where: {
                email: payload.email,
            },
            include: {
                user: true,
            },
        });

        if (!foundUser) {
            return next(createHttpError(404, { message: "User is not found" }));
        }

        if (token !== foundUser.secretToken || token === "" || token === null) {
            return next(createHttpError(422, { message: "Token is invalid" }));
        }

        await prisma.auth.update({
            where: {
                id: foundUser.id,
            },
            data: {
                password: hashedPassword,
                secretToken: null,
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

const getUserLoggedIn = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(createHttpError(401, { message: "Unauthenticated" }));

        res.status(200).json({
            status: true,
            data: user,
        });
    } catch (err) {
        next(createHttpError(500, { message: err.message }));
    }
};

const updateUserLoggedIn = async (req, res, next) => {
    try {
        const { name, phoneNumber, familyName, password } = req.body;
        let hashedPassword;
        if (password) {
            hashedPassword = secretHash(password);
        }

        try {
            await prisma.$transaction(async (tx) => {
                await tx.user.update({
                    where: {
                        id: req.user.id,
                    },
                    data: {
                        name,
                        phoneNumber,
                        familyName,
                    },
                });

                await tx.auth.update({
                    where: {
                        id: req.user.auth.id,
                    },
                    data: {
                        password: hashedPassword,
                    },
                });
            });

            res.status(200).json({
                status: true,
                message: "user data updated successfully",
            });
        } catch (error) {
            return next(
                createHttpError(422, {
                    message: error.message,
                })
            );
        }
    } catch (error) {
        next(
            createHttpError(500, {
                message: error.message,
            })
        );
    }
};

const redirectAuthorization = (req, res, next) => {
    try {
        res.redirect(authorizationUrl);
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const sendOTPSMS = async (req, res, next) => {
    try {
        const { phoneNumber } = req.body;
        const { token } = req.query;
        // verify jwt token
        const payload = jwt.verify(token, process.env.JWT_SIGNATURE_KEY);

        // get user data
        const foundUser = await prisma.auth.findUnique({
            where: {
                email: payload.email,
            },
            include: {
                user: true,
            },
        });

        // check matching token with user secretToken
        if (token !== foundUser.secretToken || token === "" || token === null) {
            return next(createHttpError(404, { message: "Token is invalid" }));
        }

        // check user is exist
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

        // generate secret data
        const OTPToken = generateTOTP();
        const newPayload = {
            registerId: randomUUID(),
            userId: foundUser.id,
            email: foundUser.email,
            otp: OTPToken,
            emailTitle: "Resend Email Activation",
        };

        // generate sent data via email
        const dataUrl = {
            token: generateJWT(newPayload),
        };

        const urlTokenVerification = `${process.env.BASE_URL}/auth/verified?token=${dataUrl.token}`;

        smsHandler(phoneNumber, OTPToken, urlTokenVerification);

        // update otp & secretToken user
        await prisma.auth.update({
            where: {
                email: payload.email,
            },
            data: {
                otpToken: OTPToken,
                secretToken: dataUrl.token,
            },
        });

        res.status(200).json({
            status: true,
            message: "SMS verification sent",
            _token: dataUrl.token,
        });
    } catch (error) {
        next(
            createHttpError(500, {
                message: error.message,
            })
        );
    }
};

module.exports = {
    handleRegister,
    handleLoginGoogle,
    handleLogin,
    verifyOTP,
    resendOTP,
    sendResetPassword,
    resetPassword,
    redirectAuthorization,
    getUserLoggedIn,
    updateUserLoggedIn,
    sendOTPSMS,
};
