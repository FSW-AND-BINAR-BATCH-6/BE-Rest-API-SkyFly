const { calculateFlightDuration, formatPrice } = require('../../../utils/calculateDuration');

describe('calculateFlightDuration', () => {
    it('handles edge case where arrival time is before departure time', () => {
        const departureDate = '2024-06-20T22:00:00Z';
        const arrivalDate = '2024-06-21T19:30:00Z';

        const duration = calculateFlightDuration(departureDate, arrivalDate);

        expect(duration).toBe('21h 30m');
    });
});

describe('formatPrice', () => {
    it('formats price with decimal values correctly', () => {
        const price = 1234.56;
        const formattedPrice = formatPrice(price);
        expect(formattedPrice).toBe('1,235');
    });

    it('formats whole number price correctly', () => {
        const price = 500;
        const formattedPrice = formatPrice(price);
        expect(formattedPrice).toBe('500');
    });

    it('formats large number with commas correctly', () => {
        const price = 1234567890;
        const formattedPrice = formatPrice(price);
        expect(formattedPrice).toBe('1,234,567,890');
    });

    it('formats zero correctly', () => {
        const price = 0;
        const formattedPrice = formatPrice(price);
        expect(formattedPrice).toBe('0');
    });

    it('formats negative number correctly', () => {
        const price = -500.75;
        const formattedPrice = formatPrice(price);
        expect(formattedPrice).toBe('-501');
    });

    it('handles NaN gracefully', () => {
        const price = NaN;
        const formattedPrice = formatPrice(price);
        expect(formattedPrice).toBe('NaN');
    });
});