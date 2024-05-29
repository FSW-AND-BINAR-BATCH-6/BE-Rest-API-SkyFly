const Joi = require("joi");
const createHttpError = require("http-errors");

const validator = require("../lib/validator");
const {
    LoginSchema,
    RegisterSchema,
    OTPSchema,
    PasswordSchema,
    forgetPasswordSchema,
    userCreateSchema,
    userUpdateSchema,
} = require("../utils/joiValidation");

describe("Auth input Validation", () => {
    let res;
    let next;

    beforeEach(() => {
        next = jest.fn();
        res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    describe("Login Input", () => {
        it("Valid input for login", async () => {
            const loginValue = {
                email: "test@mail.com",
                password: "password",
            };
            const mLoginReq = { body: loginValue };
            await validator(LoginSchema)(mLoginReq, res, next);
            expect(next).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalledWith(expect.any(Error));
        });

        it("Invalid input for login, password must be at least 8 characters", async () => {
            const loginValue = {
                email: "test@mail.ses",
                password: "1235",
            };
            const mLoginReq = { body: loginValue };
            await validator(LoginSchema)(mLoginReq, res, next);
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 422,
                    message: expect.stringContaining(
                        '"password" length must be at least 8 characters long'
                    ),
                })
            );
        });

        it("Invalid input for login", async () => {
            const loginValue = {
                email: "test@mail.xixixixi",
                password: "12345678",
            };
            const mLoginReq = { body: loginValue };
            await validator(LoginSchema)(mLoginReq, res, next);
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 422,
                    message: expect.stringContaining(
                        '"email" must be a valid email'
                    ),
                })
            );
        });
    });

    describe("Register Input", () => {
        it("Success Register", async () => {
            const registerValue = {
                email: "test@gmail.com",
                name: "abdulRohim",
                phoneNumber: "081268356723",
                password: "123456780",
            };
            const mRegisterInput = { body: registerValue };
            await validator(RegisterSchema)(mRegisterInput, res, next);
            expect(next).not.toHaveBeenCalledWith(expect.any(Error));
        });

        it("Failed Input, null input at name", async () => {
            const registerValue = {
                email: "test@gmail.com",
                phoneNumber: "081268356723",
                password: "123456780",
            };
            const mRegisterInput = { body: registerValue };
            await validator(RegisterSchema)(mRegisterInput, res, next);
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 422,
                    message: expect.stringContaining('"name" is required'),
                })
            );
        });

        it("Failed Input, invalid email tlds", async () => {
            const registerValue = {
                name: "Abdul Rohim",
                email: "test@gmail.123", //invalid Email
                phoneNumber: "081268356723",
                password: "123456780",
            };
            const mRegisterInput = { body: registerValue };
            await validator(RegisterSchema)(mRegisterInput, res, next);
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 422,
                    message: expect.stringContaining(
                        '"email" must be a valid email'
                    ),
                })
            );
        });

        it("Failed input, phoneNumber has more than 13 characters", async () => {
            const registerValue = {
                email: "test@gmail.com",
                name: "abdulRohim",
                phoneNumber: "089753468263845623", // 14 characters
                password: "123456780",
            };
            const mRegisterInput = { body: registerValue };
            await validator(RegisterSchema)(mRegisterInput, res, next);
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 422,
                    message: expect.stringContaining(
                        '"phoneNumber" length must be less than or equal to 13 characters long'
                    ),
                })
            );
        });

        it("Invalid Input, wrong data type at password", async () => {
            const registerValue = {
                email: "test@gmail.com",
                name: "abdulRohim",
                phoneNumber: "0897654352632",
                password: 123456780,
            };
            const mRegisterInput = { body: registerValue };
            await validator(RegisterSchema)(mRegisterInput, res, next);
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 422,
                    message: expect.stringContaining(
                        `"password" must be a string`
                    ),
                })
            );
        });
    });

    describe("Reset Password Input", () => {
        it("Success Reset Password", async () => {
            const resetEmailValue = {
                password: "123456789",
                confirmPassword: "123456789",
            };
            const mResetEmaiInput = { body: resetEmailValue };
            await validator(PasswordSchema)(mResetEmaiInput, res, next);
            expect(next).not.toHaveBeenCalledWith(expect.any(Error));
        });

        it("Invalid input, confirmPassword doesnt match", async () => {
            const resetEmailValue = {
                password: "123456789",
                confirmPassword: "1234567810",
            };
            const mResetEmaiInput = { body: resetEmailValue };
            await validator(PasswordSchema)(mResetEmaiInput, res, next);
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 422,
                    message: expect.stringContaining(
                        `Confirm password does not match password`
                    ),
                })
            );
        });

        it("Invalid input, wrong input type data value", async () => {
            const resetEmailValue = {
                password: 123456789,
                confirmPassword: "123456789",
            };
            const mResetEmaiInput = { body: resetEmailValue };
            await validator(PasswordSchema)(mResetEmaiInput, res, next);
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 422,
                    message: expect.stringContaining(
                        `"password" must be a string`
                    ),
                })
            );
        });
    });

    describe("OTP Input", () => {
        it("Success input OTP", async () => {
            const OTPValue = {
                otp: "223344",
            };
            const mOTPInput = { body: OTPValue };
            await validator(OTPSchema)(mOTPInput, res, next);
            expect(next).not.toHaveBeenCalledWith(expect.any(Error));
        });

        it("Invalid OTP Input, input has more than 6 characters", async () => {
            const OTPValue = {
                otp: "1234567", //otp has 7 characters
            };
            const mOTPInput = { body: OTPValue };
            await validator(OTPSchema)(mOTPInput, res, next);
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 422,
                    message: expect.stringContaining(
                        `"otp" length must be less than or equal to 6 characters long`
                    ),
                })
            );
        });

        it("Invalid OTP Input, input has less than 6 characters", async () => {
            const OTPValue = {
                otp: "12345", //otp has 5 characters
            };
            const mOTPInput = { body: OTPValue };
            await validator(OTPSchema)(mOTPInput, res, next);
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 422,
                    message: expect.stringContaining(
                        `"otp" length must be at least 6 characters long`
                    ),
                })
            );
        });

        it("Invalid OTP Input, wrong input type data value", async () => {
            const OTPValue = {
                otp: 123456, //otp has 5 characters
            };
            const mOTPInput = { body: OTPValue };
            await validator(OTPSchema)(mOTPInput, res, next);
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 422,
                    message: expect.stringContaining(`"otp" must be a string`),
                })
            );
        });
    });

    describe("Forget Password Input", () => {
        it("Success Input Forget Password", async () => {
            const ForgetPasswordValue = {
                email: "test@mail.com"
            }
            const mForgetPasswordInput = {body: ForgetPasswordValue}
            await validator(forgetPasswordSchema)(mForgetPasswordInput, res, next)
            expect(next).not.toHaveBeenCalledWith(expect.any(Error))
        })

        it("Invalid Input, invalid email tlds", async () => {
            const ForgetPasswordValue = {
                email: "test@mail.com.netc  " //it has more than 2 domain segment
            }
            const mForgetPasswordInput = {body: ForgetPasswordValue}
            await validator(forgetPasswordSchema)(mForgetPasswordInput, res, next)
            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                status: 422,
                message: expect.stringContaining(`"email" must be a valid email`)
            }))
        })
    })
});

describe("User Input Validation", () => {
    let res;
    let next;

    beforeEach(() => {
        next = jest.fn();
        res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    describe("CreateUser Input", () => {
        it("Success Input Create New User", async () => {
            const createUserValue = {
                name: "Benito",
                phoneNumber: "089268351792",
                familyName: "Mussolini",
                role: "BUYER"
            }
            const mCreateUserInput = {body: createUserValue}
            await validator(userCreateSchema)(mCreateUserInput, res, next)
            expect(next).not.toHaveBeenCalledWith(expect.any(Error))
        })

        it("Invalid Input, input at role doesn't match enum data", async () => {
            const createUserValue = {
                name: "Benito",
                phoneNumber: "089268351792",
                familyName: "Mussolini",
                role: "CUSTOMER" //JOI validation are not allow this request
            }
            const mCreateUserInput = {body: createUserValue}
            await validator(userCreateSchema)(mCreateUserInput, res, next)
            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                status: 422,
                message: expect.stringContaining(`"role" must be one of [BUYER, ADMIN]`)
            }))
        })

        it("Invalid Input, forbidden input at role", async () => {
            const createUserValue = {
                name: "Benito",
                phoneNumber: "089268351792",
                familyName: "Mussolini",
                role: "BUYER" //JOI validation are not allow this request
            }
            const mCreateUserInput = {body: createUserValue}
            await validator(userUpdateSchema)(mCreateUserInput, res, next)
            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                status: 422,
                message: expect.stringContaining(`"role" is not allowed`)
            }))
        })
    })
})
