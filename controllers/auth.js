const {PrismaClient} = require("@prisma/client");
const httpError = require("http-errors")
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const inputValidation = require("../utils/validation/authInputValidation")

const handleRegister = async (req, res, next) => {
    try {
        const { error, value } = inputValidation.validateRegisterInput(req.body);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                errors: error.details.map(detail => detail.message)
            });
        }

        const saltRounds = parseInt(process.env.SALT);
        const hashedPassword = bcrypt.hashSync(value.password, saltRounds);

        try {
            await prisma.user.create({
                data: {
                    name: value.name,
                    phoneNumber: value.phoneNumber,
                    role: "CUSTOMER",
                    Auth: {
                        create: {
                            email: value.email,
                            password: hashedPassword
                        }
                    }
                }
            });
    
            res.status(200).json({
                status: true,
                message: "Success creating new account",
                data: {
                    value
                }
            });
        } catch (error) {
            next(new httpError(409, {message: "Email has already tekken"}))
        }
        
    } catch (error) {
        next(new httpError(500, {message: error.message}))
    }
};


const handleLogin = async (req, res, next) => {
    try {
        const {error, value} = inputValidation.validateLoginInput(req.body)

        if(error){
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                errors: error.details.map(detail => detail.message)
            })
        }

        const userAccount = await prisma.Auth.findUnique({
            where: {
                email: value.email
            },
            include: {
                user: true
            }
        })
        if(userAccount && bcrypt.compareSync(value.password, userAccount.password)){
            const token = jwt.sign({
                    id: userAccount.user.id,
                    name: userAccount.user.name,
                    email: userAccount.email,
                    phoneNumber: userAccount.user.phoneNumber
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRED
                }
            );
            res.status(200).json({
                data: userAccount,
                _token: token
            })
        }

        !userAccount ? next(new httpError(404, {message: "Email not register"})) : null
        !bcrypt.compareSync(value.password, userAccount.password) ? next(new httpError(401, {message: "Wrong password"})) : null

    } catch (error) {
        next(new httpError(500, {error: error.message}))
    }
}

module.exports = {handleRegister, handleLogin}