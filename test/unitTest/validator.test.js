const Joi = require("joi");
const createHttpError = require("http-errors");

const validator = require("../../lib/validator");
const {
    LoginSchema,
    RegisterSchema,
    OTPSchema,
    PasswordSchema,
    forgetPasswordSchema,
    userCreateSchema,
    userUpdateSchema,
} = require("../../utils/joiValidation");

const runValidationTest = async (schema, inputData, expectedOutcome) => {
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    const next = jest.fn();
    const mReq = { body: inputData };

    await validator(schema)(mReq, res, next);

    if (expectedOutcome.success) {
        expect(next).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    } else {
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                status: expectedOutcome.status,
                message: expect.stringContaining(expectedOutcome.message),
            })
        );
    }
};

describe("Auth input Validation", () => {
    describe("Login Input", () => {
        const loginTests = [
            {
                description: "Valid input for login",
                schema: LoginSchema,
                inputData: { email: "test@mail.com", password: "password" },
                expectedOutcome: { success: true },
            },
            {
                description:
                    "Invalid input for login, password must be at least 8 characters",
                schema: LoginSchema,
                inputData: { email: "test@mail.ses", password: "1235" },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message:
                        '"password" length must be at least 8 characters long',
                },
            },
            {
                description: "Invalid input for login, invalid email",
                schema: LoginSchema,
                inputData: {
                    email: "test@mail.xixixixi",
                    password: "12345678",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: '"email" must be a valid email',
                },
            },
        ];

        loginTests.forEach((test) => {
            it(test.description, async () => {
                await runValidationTest(
                    test.schema,
                    test.inputData,
                    test.expectedOutcome
                );
            });
        });
    });

    describe("Register Input", () => {
        const registerTests = [
            {
                description: "Success Register",
                schema: RegisterSchema,
                inputData: {
                    email: "test@gmail.com",
                    name: "abdulRohim",
                    phoneNumber: "081268356723",
                    password: "123456780",
                },
                expectedOutcome: { success: true },
            },
            {
                description: "Failed Input, null input at name",
                schema: RegisterSchema,
                inputData: {
                    email: "test@gmail.com",
                    phoneNumber: "081268356723",
                    password: "123456780",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: '"name" is required',
                },
            },
            {
                description: "Failed Input, invalid email tlds",
                schema: RegisterSchema,
                inputData: {
                    name: "Abdul Rohim",
                    email: "test@gmail.123",
                    phoneNumber: "081268356723",
                    password: "123456780",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: '"email" must be a valid email',
                },
            },
            {
                description:
                    "Failed input, phoneNumber has more than 13 characters",
                schema: RegisterSchema,
                inputData: {
                    email: "test@gmail.com",
                    name: "abdulRohim",
                    phoneNumber: "089753468263845623",
                    password: "123456780",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message:
                        '"phoneNumber" length must be less than or equal to 13 characters long',
                },
            },
            {
                description: "Invalid Input, wrong data type at password",
                schema: RegisterSchema,
                inputData: {
                    email: "test@gmail.com",
                    name: "abdulRohim",
                    phoneNumber: "0897654352632",
                    password: 123456780,
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: '"password" must be a string',
                },
            },
        ];

        registerTests.forEach((test) => {
            it(test.description, async () => {
                await runValidationTest(
                    test.schema,
                    test.inputData,
                    test.expectedOutcome
                );
            });
        });
    });

    describe("Reset Password Input", () => {
        const resetPasswordTests = [
            {
                description: "Success Reset Password",
                schema: PasswordSchema,
                inputData: {
                    password: "123456789",
                    confirmPassword: "123456789",
                },
                expectedOutcome: { success: true },
            },
            {
                description: "Invalid input, confirmPassword doesn't match",
                schema: PasswordSchema,
                inputData: {
                    password: "123456789",
                    confirmPassword: "1234567810",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: "Confirm password does not match password",
                },
            },
            {
                description: "Invalid input, wrong input type data value",
                schema: PasswordSchema,
                inputData: {
                    password: 123456789,
                    confirmPassword: "123456789",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: '"password" must be a string',
                },
            },
        ];

        resetPasswordTests.forEach((test) => {
            it(test.description, async () => {
                await runValidationTest(
                    test.schema,
                    test.inputData,
                    test.expectedOutcome
                );
            });
        });
    });

    describe("OTP Input", () => {
        const otpTests = [
            {
                description: "Success input OTP",
                schema: OTPSchema,
                inputData: { otp: "223344" },
                expectedOutcome: { success: true },
            },
            {
                description:
                    "Invalid OTP Input, input has more than 6 characters",
                schema: OTPSchema,
                inputData: { otp: "1234567" },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message:
                        '"otp" length must be less than or equal to 6 characters long',
                },
            },
            {
                description:
                    "Invalid OTP Input, input has less than 6 characters",
                schema: OTPSchema,
                inputData: { otp: "12345" },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: '"otp" length must be at least 6 characters long',
                },
            },
            {
                description: "Invalid OTP Input, wrong input type data value",
                schema: OTPSchema,
                inputData: { otp: 123456 },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: '"otp" must be a string',
                },
            },
        ];

        otpTests.forEach((test) => {
            it(test.description, async () => {
                await runValidationTest(
                    test.schema,
                    test.inputData,
                    test.expectedOutcome
                );
            });
        });
    });

    describe("Forget Password Input", () => {
        const forgetPasswordTests = [
            {
                description: "Success Input Forget Password",
                schema: forgetPasswordSchema,
                inputData: { email: "test@mail.com" },
                expectedOutcome: { success: true },
            },
            {
                description: "Invalid Input, invalid email tlds",
                schema: forgetPasswordSchema,
                inputData: { email: "test@mail.com.netc" },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: '"email" must be a valid email',
                },
            },
        ];

        forgetPasswordTests.forEach((test) => {
            it(test.description, async () => {
                await runValidationTest(
                    test.schema,
                    test.inputData,
                    test.expectedOutcome
                );
            });
        });
    });
});

describe("User Input Validation", () => {
    describe("CreateUser Input", () => {
        const createUserTests = [
            {
                description: "Success Input Create New User",
                schema: userCreateSchema,
                inputData: {
                    name: "Benito",
                    phoneNumber: "089268351792",
                    familyName: "Mussolini",
                    role: "BUYER",
                },
                expectedOutcome: { success: true },
            },
            {
                description:
                    "Invalid Input, input at role doesn't match enum data",
                schema: userCreateSchema,
                inputData: {
                    name: "Benito",
                    phoneNumber: "089268351792",
                    familyName: "Mussolini",
                    role: "CUSTOMER",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: '"role" must be one of [BUYER, ADMIN]',
                },
            },
            {
                description: "Invalid Input, wrong data type at phoneNumber",
                schema: userCreateSchema,
                inputData: {
                    name: "Benito",
                    phoneNumber: 6289268351792,
                    familyName: "Mussolini",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: '"phoneNumber" must be a string',
                },
            },
            {
                description: "Invalid Input, phoneNumber has 14 characters",
                schema: userCreateSchema,
                inputData: {
                    name: "Benito",
                    phoneNumber: "08982314566723",
                    familyName: "Mussolini",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message:
                        '"phoneNumber" length must be less than or equal to 13 characters long',
                },
            },
        ];

        createUserTests.forEach((test) => {
            it(test.description, async () => {
                await runValidationTest(
                    test.schema,
                    test.inputData,
                    test.expectedOutcome
                );
            });
        });
    });

    describe("UpdateUser Input", () => {
        const updateUserTests = [
            {
                description: "Success",
                schema: userUpdateSchema,
                inputData: {
                    name: "Togenashi",
                    phoneNumber: "089268351792",
                    familyName: "Togeari",
                },
                expectedOutcome: {
                    success: true,
                }
            },
            {
                description: "Invalid Input, forbidden input at role",
                schema: userUpdateSchema,
                inputData: {
                    name: "Benito",
                    phoneNumber: "089268351792",
                    familyName: "Mussolini",
                    role: "BUYER",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: '"role" is not allowed',
                },
            },
            {
                description: "Invalid Input, wrong data type at phoneNumber",
                schema: userUpdateSchema,
                inputData: {
                    name: "Benito",
                    phoneNumber: 6289268351792,
                    familyName: "Mussolini",
                    role: "BUYER",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: '"phoneNumber" must be a string',
                },
            }
           
        ];

        updateUserTests.forEach((test) => {
            it(test.description, async () => {
                await runValidationTest(
                    test.schema,
                    test.inputData,
                    test.expectedOutcome
                );
            });
        });
    });
});
