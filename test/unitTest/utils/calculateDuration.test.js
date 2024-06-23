const {
    calculateFlightDuration,
    formatPrice,
} = require("../../../utils/calculateDuration");

describe("calculateFlightDuration", () => {
    it("handles edge case where arrival time is before departure time", () => {
        const departureDate = "2024-06-20T22:00:00Z";
        const arrivalDate = "2024-06-21T19:30:00Z";

        const duration = calculateFlightDuration(departureDate, arrivalDate);

        expect(duration).toBe("21h 30m");
    });
});

const formatPriceTest = (description, price, value) => {
    it(description, () => {
        const formattedPrice = formatPrice(price);
        expect(formattedPrice).toBe(value);
    });
};

describe("formatPrice", () => {
    beforeAll(() => {
        Number.prototype.toLocaleString = jest.fn(function (options) {
            const parts = this.toFixed(options.minimumFractionDigits).split(
                "."
            );
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return `IDR ${parts.join(".")}`;
        });
    });

    const priceTest = [
        {
            description: "formats price with decimal values correctly",
            price: 1234.56,
            value: "IDR 1,235"
        },
        {
            description: "formats whole number price correctly",
            price: 500,
            value: "IDR 500"
        },
        {
            description: "formats large number with commas correctly",
            price: 1234567890,
            value: "IDR 1,234,567,890"
        },
        {
            description: "handles NaN gracefully",
            price: NaN,
            value: null
        },
        {
            description: "formats zero correctly",
            price: 0,
            value: null
        },
    ]

    priceTest.forEach((test) => {
        formatPriceTest(
            test.description,
            test.price,
            test.value
        )
    })
});
