const {
    totalPrice,
    parameterMidtrans,
} = require("../../../utils/parameterMidtrans");

jest.mock("crypto", () => ({
    randomUUID: jest.fn(),
}));

describe("parameterMidtrans function", () => {
    it("should create passenger objects with correct pricing based on type", async () => {
        const data = {
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
                    dob: "2020-01-01",
                    passport: "12345678",
                    validityPeriod: "2025-01-01",
                    type: "CHILD",
                    price: 1000,
                    quantity: 1,
                    seatId: "A1",
                },
                {
                    title: "Ms.",
                    fullName: "Bob Johnson",
                    dob: "2010-01-01",
                    passport: "87654321",
                    validityPeriod: "2030-01-01",
                    type: "ADULT",
                    price: 1000,
                    quantity: 2,
                    seatId: "B2",
                },
                {
                    title: "Ms.",
                    fullName: "Jane Miller",
                    dob: "2018-01-01",
                    passport: "98765432",
                    validityPeriod: "2035-01-01",
                    type: "INFANT",
                    price: 1000,
                    quantity: 1,
                    seatId: "C3",
                },
            ],
        };

        const result = await parameterMidtrans(data);

        expect(result.passengers.length).toBe(3); // Check number of passengers

        expect(result.passengers[0].price).toBe(500); // Discounted price for child
        expect(result.passengers[1].price).toBe(1000); // Full price for adult
        expect(result.passengers[2].price).toBe(0); // Free for infant

        expect(result.orderer).toEqual({
            first_name: "John",
            last_name: "Doe",
            phone: "+1234567890",
            email: "john.doe@example.com",
        });
    });

    it("should handle unexpected passenger types", async () => {
        const body = {
            passengers: [{ type: "UNKNOWN" }],
        };

        const result = await parameterMidtrans(body);

        expect(result.passengers[0].price).toBe(body.passengers[0].price); // No change for unknown types
    });

    it("should handle missing or invalid DOB and validityPeriod values", async () => {
        const body = {
            passengers: [
                { type: "ADULT", price: 100, quantity: 1, seatId: "A1" }, // Missing DOB and validityPeriod
                {
                    type: "CHILD",
                    price: 150,
                    quantity: 1,
                    seatId: "B2",
                    dob: "invalid-date",
                }, // Invalid DOB
                {
                    type: "INFANT",
                    price: 0,
                    quantity: 1,
                    seatId: "C3",
                    validityPeriod: "not-a-date",
                }, // Invalid validityPeriod
            ],
        };

        // Expect no errors to be thrown, but log warnings for missing/invalid values
        jest.spyOn(console, "warn").mockImplementationOnce(() => {}); // Mock console.warn for testing

        const result = await parameterMidtrans(body);

        expect(result.passengers.length).toBe(3); // All passengers should be processed

        expect(console.warn).toHaveBeenCalledTimes(2); // Expect warnings for invalid DOB and validityPeriod
        expect(console.warn.mock.calls[0][0]).toContain(
            "Passenger has missing or invalid DOB"
        );
        expect(console.warn.mock.calls[1][0]).toContain(
            "Passenger has missing or invalid validityPeriod"
        );
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
