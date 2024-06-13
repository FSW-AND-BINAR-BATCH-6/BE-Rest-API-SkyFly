const validator = require("../../../lib/validator");
const {
    LoginSchema,
    RegisterSchema,
    OTPSchema,
    createFlightSchema,
    updateFlightSchema,
    PasswordSchema,
    forgetPasswordSchema,
    userCreateSchema,
    userUpdateSchema,
    createSeatSchema,
    createAirlineSchema,
    updateAirlineSchema,
    createAirportSchema,
    updateAirportSchema,
} = require("../../../utils/joiValidation");

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
                description: "Valid input",
                schema: LoginSchema,
                inputData: { email: "test@mail.com", password: "password" },
                expectedOutcome: { success: true },
            },
            {
                description:
                    "Invalid input, password must be at least 8 characters",
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
                description: "Invalid input, invalid email",
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
                    name: "abdul rohim",
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
            {
                description:
                    "Invalid Input, name fails to match the required pattern:",
                schema: RegisterSchema,
                inputData: {
                    email: "test@gmail.com",
                    name: "abdul Rohim*123",
                    phoneNumber: "0897654352632",
                    password: "123456780",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: `"name" with value "abdul Rohim*123" fails to match the required pattern: /^(?!\\s*$)[a-zA-Z\\s]+$/`,
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
            {
                description:
                    "Invalid Input, familyName fails to match the required pattern",
                schema: userCreateSchema,
                inputData: {
                    name: "Benito",
                    phoneNumber: "089213267523",
                    familyName: "Mussolini*123",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: `"familyName" with value "Mussolini*123" fails to match the required pattern: /^(?!\\s*$)[a-zA-Z\\s]+$/`,
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
                },
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
            },
            {
                description:
                    "Invalid Input, name fails to match the required pattern",
                schema: userUpdateSchema,
                inputData: {
                    name: "Benito*",
                    phoneNumber: "089213267523",
                    familyName: "Mussolini",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: `"name" with value "Benito*" fails to match the required pattern: /^(?!\\s*$)[a-zA-Z\\s]+$/`,
                },
            },
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

describe("Flight Schema Validation", () => {
    describe("createFlightSchema", () => {
        const createFlightTests = [
            {
                description: "Valid input",
                schema: createFlightSchema,
                inputData: {
                    planeId: "AB123",
                    departureDate: "2024-01-07T09:30:00Z",
                    departureAirportId: "JFK",
                    arrivalDate: "2024-01-07T15:30:00Z",
                    destinationAirportId: "LAX",
                    price: 1000,
                    discount: 10,
                    capacity: 150,
                    facilities: "WiFi",
                },
                expectedOutcome: { success: true },
            },
            {
                description: "Invalid input, incorrect planeId format",
                schema: createFlightSchema,
                inputData: {
                    planeId: "AB 123",
                    departureDate: "2024-01-07T09:30:00Z",
                    departureAirportId: "JFK",
                    arrivalDate: "2024-01-07T15:30:00Z",
                    destinationAirportId: "LAX",
                    price: 1000,
                    discount: 10,
                    capacity: 150,
                    facilities: "WiFi",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message:
                        '\"planeId\" with value \"AB 123\" fails to match the required pattern: /^[a-zA-Z0-9]*$/',
                },
            },
            {
                description: "Invalid input, missing required field",
                schema: createFlightSchema,
                inputData: {
                    planeId: "AB123",
                    departureDate: "2024-01-07T09:30:00Z",
                    arrivalDate: "2024-01-07T15:30:00Z",
                    destinationAirportId: "LAX",
                    price: 1000,
                    discount: 10,
                    capacity: 150,
                    facilities: "WiFi",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: '"departureAirportId" is required',
                },
            },
            {
                description: "Valid input with transit information",
                schema: createFlightSchema,
                inputData: {
                    planeId: "AB123",
                    departureDate: "2024-01-07T09:30:00Z",
                    departureAirportId: "JFK",
                    arrivalDate: "2024-01-07T15:30:00Z",
                    transitAirportId: "ORD",
                    transitArrivalDate: "2024-01-07T11:30:00Z",
                    transitDepartureDate: "2024-01-07T12:30:00Z",
                    destinationAirportId: "LAX",
                    price: 1000,
                    discount: 10,
                    capacity: 150,
                    facilities: "WiFi",
                },
                expectedOutcome: { success: true },
            },
            {
                description: "Invalid input with missing transit dates",
                schema: createFlightSchema,
                inputData: {
                    planeId: "AB123",
                    departureDate: "2024-01-07T09:30:00Z",
                    departureAirportId: "JFK",
                    arrivalDate: "2024-01-07T15:30:00Z",
                    transitAirportId: "ORD",
                    destinationAirportId: "LAX",
                    price: 1000,
                    discount: 10,
                    capacity: 150,
                    facilities: "WiFi",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: '"transitArrivalDate" is required',
                },
            },
        ];

        createFlightTests.forEach((test) => {
            it(test.description, async () => {
                await runValidationTest(
                    test.schema,
                    test.inputData,
                    test.expectedOutcome
                );
            });
        });
    });

    describe("updateFlightSchema", () => {
        const updateFlightTests = [
            {
                description: "Valid input",
                schema: updateFlightSchema,
                inputData: {
                    planeId: "AB123",
                    departureDate: "2024-01-07T09:30:00Z",
                    arrivalDate: "2024-01-07T15:30:00Z",
                    destinationAirportId: "LAX",
                    price: 1000,
                    discount: 10,
                    capacity: 150,
                    facilities: "WiFi",
                },
                expectedOutcome: { success: true },
            },
            {
                description: "Invalid input, missing required field",
                schema: updateFlightSchema,
                inputData: {
                    planeId: "AB123",
                    departureDate: "2024-01-07T09:30:00Z",
                    arrivalDate: "2024-01-07T15:30:00Z",
                    price: 1000,
                    discount: 10,
                    capacity: 150,
                    facilities: "WiFi",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: '"destinationAirportId" is required',
                },
            },
        ];

        updateFlightTests.forEach((test) => {
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

describe("FlightSeat Input Validation", () => {
    describe("Create FlightSeat Input", () => {
        const updateFlightSeatTest = [
            {
                description: "Success",
                schema: createSeatSchema,
                inputData: {
                    flightId: "12345",
                    seatNumber: "12B",
                    type: "ECONOMY",
                },
                expectedOutcome: {
                    success: true,
                },
            },
            {
                description:
                    "Invalid Input, there are letters in the flightId input",
                schema: createSeatSchema,
                inputData: {
                    flightId: "asd1231@",
                    seatNumber: "13B",
                    type: "ECONOMY",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message:
                        '"flightId" with value "asd1231@" fails to match the required pattern: /^[a-zA-Z0-9]*$/',
                },
            },
            {
                description:
                    "Invalid Input, seatNumber must has less than or equal 5",
                schema: createSeatSchema,
                inputData: {
                    flightId: "123456",
                    seatNumber: "1234B",
                    type: "ECONOMY",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message:
                        '"seatNumber" length must be less than or equal to 4 characters long',
                },
            },
            {
                description:
                    "Invalid Input, input at type doesn't match enum data",
                schema: createSeatSchema,
                inputData: {
                    flightId: "123456",
                    seatNumber: "123B",
                    type: "SUPER",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: `"type" must be one of [ECONOMY, BUSINESS, FIRST]`,
                },
            },
            {
                description: "Invalid Input, wrong data tyoe at flightId",
                schema: createSeatSchema,
                inputData: {
                    flightId: 12344,
                    seatNumber: "123B",
                    type: "ECONOMY",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: `"flightId" must be a string`,
                },
            },
        ];
        updateFlightSeatTest.forEach((test) => {
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

describe("Airline Input Validation", () => {
    describe("Create Airline Input", () => {
        const createAirlineTest = [
            {
                description: "Success",
                schema: createAirlineSchema,
                inputData: {
                    name: "Garuda Indonesia",
                    code: "GA",
                },
                expectedOutcome: {
                    success: true,
                },
            },
            {
                description:
                    "Invalid Input, code must has less than or equal 2",
                schema: createAirlineSchema,
                inputData: {
                    name: "Garuda Indonesia",
                    code: "GK-456",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message:
                        '"code" length must be less than or equal to 2 characters long',
                },
            },
            {
                description:
                    "Invalid Input, name can't have any special character",
                schema: createAirlineSchema,
                inputData: {
                    name: "Garuda-Indonesia",
                    code: "GA",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: `"name" with value "Garuda-Indonesia" fails to match the required pattern: /^(?!\\s*$)[a-zA-Z\\s]+$/`,
                },
            },
        ];
        createAirlineTest.forEach((test) => {
            it(test.description, async () => {
                await runValidationTest(
                    test.schema,
                    test.inputData,
                    test.expectedOutcome
                );
            });
        });
    });

    describe("Create Airline Input", () => {
        const updateAirlineTest = [
            {
                description: "Success",
                schema: updateAirlineSchema,
                inputData: {
                    name: "Garuda Indonesia",
                    code: "GA",
                },
                expectedOutcome: {
                    success: true,
                },
            },
            {
                description:
                    "Invalid Input, code must has less than or equal 2",
                schema: updateAirlineSchema,
                inputData: {
                    name: "Garuda Indonesia",
                    code: "GK-456",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message:
                        '"code" length must be less than or equal to 2 characters long',
                },
            },
            {
                description:
                    "Invalid Input, name can't have any special character",
                schema: updateAirlineSchema,
                inputData: {
                    name: "Garuda-Indonesia",
                    code: "GA",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: `"name" with value "Garuda-Indonesia" fails to match the required pattern: /^(?!\\s*$)[a-zA-Z\\s]+$/`,
                },
            },
        ];
        updateAirlineTest.forEach((test) => {
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

describe("Airport Input Validation", () => {
    describe("Create Airport Input", () => {
        const createAirportTest = [
            {
                description: "Success",
                schema: createAirportSchema,
                inputData: {
                    name: "Sultan Hasanuddin International Airport",
                    code: "UPG",
                    country: "Indonesia",
                    city: "Makasar",
                },
                expectedOutcome: {
                    success: true,
                },
            },
            {
                description:
                    "Invalid Input, name can't have any special character",
                schema: createAirportSchema,
                inputData: {
                    name: "Sultan-Hasanuddin-International-Airport",
                    code: "UPG",
                    country: "Indonesia",
                    city: "Makasar",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: `"Sultan-Hasanuddin-International-Airport" fails to match the required pattern: /^(?!\\s*$)[a-zA-Z\\s]+$/`,
                },
            },
            {
                description:
                    "Invalid Input, code must has less than or equal 3 ",
                schema: createAirportSchema,
                inputData: {
                    name: "Los Angeles International Airport",
                    code: "LAXV",
                    country: "United State Of America",
                    city: "Los Angeles",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: `"code" length must be less than or equal to 3 characters long`,
                },
            },
            {
                description: "Invalid Input, name can't be null",
                schema: createAirportSchema,
                inputData: {
                    code: "LAV",
                    country: "USA",
                    city: "Los Angeles",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: `"name" is required`,
                },
            },
        ];
        createAirportTest.forEach((test) => {
            it(test.description, async () => {
                await runValidationTest(
                    test.schema,
                    test.inputData,
                    test.expectedOutcome
                );
            });
        });
    });

    describe("Update Airport Input", () => {
        const updateAirportTest = [
            {
                description: "Success",
                schema: updateAirportSchema,
                inputData: {
                    name: "Sultan Hasanuddin International Airport",
                    code: "UPG",
                    country: "Indonesia",
                    city: "Makasar",
                },
                expectedOutcome: {
                    success: true,
                },
            },
            {
                description:
                    "Invalid Input, name can't have any special character",
                schema: updateAirportSchema,
                inputData: {
                    name: "Sultan-Hasanuddin-International-Airport",
                    code: "UPG",
                    country: "Indonesia",
                    city: "Makasar",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: `"Sultan-Hasanuddin-International-Airport" fails to match the required pattern: /^(?!\\s*$)[a-zA-Z\\s]+$/`,
                },
            },
            {
                description:
                    "Invalid Input, code must has less than or equal 3 ",
                schema: updateAirportSchema,
                inputData: {
                    name: "Los Angeles International Airport",
                    code: "LAXV",
                    country: "United State Of America",
                    city: "Los Angeles",
                },
                expectedOutcome: {
                    success: false,
                    status: 422,
                    message: `"code" length must be less than or equal to 3 characters long`,
                },
            },
            {
                description: "Success, allow null input at name",
                schema: updateAirportSchema,
                inputData: {
                    code: "LAV",
                    country: "USA",
                    city: "Los Angeles",
                },
                expectedOutcome: {
                    success: true,
                },
            },
        ];
        updateAirportTest.forEach((test) => {
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
