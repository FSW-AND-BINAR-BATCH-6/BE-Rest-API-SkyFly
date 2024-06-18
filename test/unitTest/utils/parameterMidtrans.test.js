const {
    totalPrice,
    parameterMidtrans,
} = require("../../../utils/parameterMidtrans");

jest.mock("crypto", () => ({
    randomUUID: jest.fn(),
}));

describe("parameterMidtrans function", () => {
    it("should return formatted orderer and passenger data", async () => {
        const body = {
            orderer: {
                fullName: "John Doe",
                familyName: "Doe",
                phoneNumber: "+1234567890",
                email: "john.doe@example.com",
            },
            passengers: [
                {
                    title: "Mr.",
                    fullName: "Alice Smith",
                    dob: "2000-01-01", // Date string or object
                    passport: "123456789",
                    validityPeriod: "2025-01-01", // Date string or object
                    familyName: "Smith",
                    citizenship: "USA",
                    issuingCountry: "USA",
                    price: 100,
                    quantity: 1,
                    seatId: "A1",
                },
            ],
        };

        let dob = new Date(body.passengers[0].dob);
        let validityPeriod = new Date(body.passengers[0].validityPeriod);

        const expectedResult = {
            orderer: {
                fullName: "John Doe",
                familyName: "Doe",
                phoneNumber: "+1234567890",
                email: "john.doe@example.com",
            },
            passengers: [
                {
                    title: "Mr.",
                    name: "Mr. Alice Smith", // Adjusted name format
                    fullName: "Alice Smith",
                    dob: new Date(
                        dob.getTime() + 7 * 60 * 60 * 1000
                    ).toISOString(), // Ensured Date object
                    passport: "123456789",
                    validityPeriod: new Date(
                        validityPeriod.getTime() + 7 * 60 * 60 * 1000
                    ).toISOString(), // Ensured Date object
                    familyName: "Smith",
                    citizenship: "USA",
                    issuingCountry: "USA",
                    price: 100,
                    quantity: 1,
                    seatId: "A1",
                },
            ],
        };

        const actualResult = await parameterMidtrans(body);
        expect(actualResult).toEqual(expectedResult);
    });
});

describe("totalPrice", () => {
    it("should calculate total price correctly", async () => {
        const input = [
            { price: 100, quantity: 2 },
            { price: 150, quantity: 1 },
        ];
        const result = await totalPrice(input);
        expect(result).toBe(350);
    });

    it("should return zero for empty input", async () => {
        const input = [];
        const result = await totalPrice(input);
        expect(result).toBe(0);
    });
});
