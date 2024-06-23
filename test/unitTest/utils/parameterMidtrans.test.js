const {
    totalPrice,
    parameterMidtrans,
    totalNormalPrice,
} = require("../../../utils/parameterMidtrans");

describe("parameterMidtrans", () => {
    it("should return orderer and passengers data", async () => {
        const body = {
            orderer: {
                fullName: "John Doe",
                familyName: "Doe",
                phoneNumber: "08123456789",
                email: "john.doe@example.com",
            },
            passengers: [
                {
                    id: "id child",
                    dob: "1990-01-01T00:00:00.000Z",
                    validityPeriod: "2024-06-19T00:00:00.000Z",
                    price: 1000,
                    type: "CHILD",
                    title: "Mr.",
                    fullName: "John Doe",
                    familyName: "Doe",
                    citizenship: "Indonesia",
                    issuingCountry: "Indonesia",
                    passport: "1234567890123",
                    quantity: 1,
                    seatId: "A1",
                },
                {
                    id: "id adult",
                    dob: "1995-01-01T00:00:00.000Z",
                    validityPeriod: "2024-06-19T00:00:00.000Z",
                    price: 1000,
                    type: "ADULT",
                    title: "Ms.",
                    fullName: "Jane Doe",
                    familyName: "Doe",
                    citizenship: "Indonesia",
                    issuingCountry: "Indonesia",
                    passport: "9876543210987",
                    quantity: 1,
                    seatId: "B2",
                },
                {
                    id: "id baby",
                    dob: "1995-01-01T00:00:00.000Z",
                    validityPeriod: "2024-06-19T00:00:00.000Z",
                    price: 1000,
                    type: "INFRANT",
                    title: "Ms.",
                    fullName: "Baby",
                    familyName: "Doe",
                    citizenship: "Indonesia",
                    issuingCountry: "Indonesia",
                    passport: "9876543210987",
                    quantity: 1,
                    seatId: "B2",
                },
            ],
        };

        const result = await parameterMidtrans(body);

        expect(result).toEqual({
            passengers: [
                {
                    id: expect.any(String),
                    title: "Mr.",
                    name: "Mr. John Doe",
                    fullName: "John Doe",
                    dob: expect.any(String),
                    passport: null,
                    validityPeriod: null,
                    type: "CHILD",
                    familyName: "Doe",
                    citizenship: "Indonesia",
                    issuingCountry: "Indonesia",
                    price: 515,
                    normalPrice: 500,
                    quantity: 1,
                    seatId: "A1",
                },
                {
                    id: expect.any(String),
                    title: "Ms.",
                    name: "Ms. Jane Doe",
                    fullName: "Jane Doe",
                    dob: expect.any(String),
                    passport: "9876543210987",
                    validityPeriod: expect.any(String),
                    type: "ADULT",
                    familyName: "Doe",
                    citizenship: "Indonesia",
                    issuingCountry: "Indonesia",
                    price: 1030,
                    normalPrice: 1000,
                    quantity: 1,
                    seatId: "B2",
                },
                {
                    id: expect.any(String),
                    title: "Ms.",
                    name: "Ms. Baby",
                    fullName: "Baby",
                    dob: expect.any(String),
                    passport: null,
                    validityPeriod: null,
                    type: "INFRANT",
                    familyName: "Doe",
                    citizenship: "Indonesia",
                    issuingCountry: "Indonesia",
                    price: 0,
                    normalPrice: 0,
                    quantity: 1,
                    seatId: "B2",
                },
            ],
            orderer: {
                first_name: "John Doe",
                last_name: "Doe",
                phone: "08123456789",
                email: "john.doe@example.com",
            },
        });
    });
});

describe("totalPrice", () => {
    it("should calculate total price correctly", async () => {
        const input = [
            { price: 1030, quantity: 1 },
            { price: 515, quantity: 1 },
        ];
        const result = await totalPrice(input);
        expect(result).toBe(1545);
    });

    it("should return zero for empty input", async () => {
        const input = [];
        const result = await totalPrice(input);
        expect(result).toBe(0);
    });
});

describe("totalNormalPrice", () => {
    it("should return the total normal price", async () => {
        const itemDetails = [
            { normalPrice: 1000, quantity: 1 },
            { normalPrice: 500, quantity: 1 },
        ];

        const result = await totalNormalPrice(itemDetails);

        expect(result).toBe(1500);
    });

    it("should handle empty itemDetails", async () => {
        const itemDetails = [];

        const result = await totalNormalPrice(itemDetails);

        expect(result).toBe(0);
    });
});
