const jwt = require("jsonwebtoken");
const createHttpError = require("http-errors");
const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");

const { generateTOTP, validateTOTP } = require("../utils/otp");
const { secretCompare, secretHash } = require("../utils/hashSalt");
const { generateJWT } = require("../utils/jwtGenerate");
const { generateSecretEmail } = require("../utils/emailHandler");

const { authorizationUrl, oauth2Client } = require("../lib/googleOauth2");
const { google } = require("googleapis");

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
            otp: OTPToken,
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
        const userauthData = await prisma.user.create({
            data: {
                id: randomUUID(),
                name: name,
                phoneNumber: phoneNumber,
                role: "BUYER",
                Auth: {
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
        await generateSecretEmail(dataUrl, "verified", "verifyOtp.ejs");

        res.status(200).json({
            status: true,
            message:
                "Verification token has been sent, please check your email",
            data: {
                name: name,
                email: email,
                phoneNumber: phoneNumber,
                role: userauthData.role,
            },
        });
    } catch (error) {
        next(
            createHttpError(500, {
                message: error.message,
            })
        );
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
        console.log("masuk");

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
        await generateSecretEmail(dataUrl, "verified", "verifyOtp.ejs");

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
                createHttpError(422, { message: "OTP Token is invalid" })
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

        await generateSecretEmail(
            dataUrl,
            "resetPassword",
            "resetPassword.ejs"
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

        if (token !== foundUser.secretToken || token === "" || token === null) {
            return next(createHttpError(422, { message: "Token is invalid" }));
        }

        if (!foundUser) {
            return next(createHttpError(404, { message: "User is not found" }));
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
            return next(createHttpError(404, { message: "Account Not Found" }));
        }

        const checkEmail = await prisma.auth.findUnique({
            where: {
                email: data.email,
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

        const hashedPassword = secretHash(data.id);
        console.log("=====================================================");
        console.log(`Password google login: ${data.id}`);
        console.log("=====================================================");

        const OTPToken = generateTOTP();

        const payload = {
            registerId: randomUUID(),
            email: data.email,
            otp: OTPToken,
            emailTitle: "Email Activation",
        };

        const dataUrl = {
            token: generateJWT(payload),
        };

        await prisma.auth.create({
            data: {
                id: randomUUID(),
                email: data.email,
                password: hashedPassword,
                otpToken: OTPToken,
                isVerified: false,
                secretToken: dataUrl.token,
                user: {
                    create: {
                        id: randomUUID(),
                        name: data.name,
                        role: "BUYER",
                    },
                },
            },
        });

        await generateSecretEmail(dataUrl, "verified", "verifyOtp.ejs");

        return res.status(200).json({
            status: true,
            message:
                "Verification token has been sent, please check your email",
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const redirectAuthorization = (req, res) => {
    res.redirect(authorizationUrl);
};

// dummy route to check all email

const getUsers = async (req, res, next) => {
    try {
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                role: true,
                phoneNumber: true,
                Auth: {
                    select: {
                        id: true,
                        email: true,
                        isVerified: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
            skip: offset,
            take: limit,
        });

        const count = await prisma.user.count({
            where: {
                name: {
                    contains: search,
                },
            },
        });

        res.status(200).json({
            status: true,
            totalItems: count,
            pagination: {
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                pageItems: users.length,
                nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null,
            },
            data: users.length !== 0 ? users : "empty product data",
        });
    } catch (error) {
        next(createHttpError(500, { error: error.message }));
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

module.exports = {
    handleRegister,
    handleLogin,
    verifyOTP,
    resendOTP,
    sendResetPassword,
    resetPassword,
    handleLoginGoogle,
    redirectAuthorization,
    getUsers,
    getUserLoggedIn,
};
