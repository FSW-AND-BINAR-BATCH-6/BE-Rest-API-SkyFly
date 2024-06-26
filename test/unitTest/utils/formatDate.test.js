const { formatDate, formatTime, formatMonthAndYear, toWib } = require('../../../utils/formatDate');

describe('Date and Time Formatting Utilities', () => {
    describe('formatDate', () => {
        it('should format date to YYYY-MM-DD', () => {
            expect(formatDate('2030-01-01T12:00:00Z')).toBe('2030-01-01');
        });
    });

    describe('formatMonthAndYear', () => {
        it('should format date to "Month Year"', () => {
            expect(formatMonthAndYear('2030-01-01T12:00:00Z')).toBe('Januari 2030');
        });

        it('should handle different months correctly', () => {
            expect(formatMonthAndYear('2030-02-01T12:00:00Z')).toBe('Februari 2030');
            expect(formatMonthAndYear('2030-12-01T12:00:00Z')).toBe('Desember 2030');
        });
    });

    describe('formatTime', () => {
        it('should format time to HH:MM', () => {
            expect(formatTime('2030-01-01T12:34:56Z')).toBe('12:34');
        });

        it('should handle different times correctly', () => {
            expect(formatTime('2030-01-01T23:45:00Z')).toBe('23:45');
            expect(formatTime('2030-01-01T00:00:00Z')).toBe('00:00');
        });
    });

    describe('toWib', () => {
        it('should convert date to WIB timezone', () => {
            expect(toWib('2030-01-01T00:00:00Z')).toBe('2030-01-01T07:00:00.000Z');
        });

        it('should handle different times correctly', () => {
            expect(toWib('2030-01-01T12:00:00Z')).toBe('2030-01-01T19:00:00.000Z');
            expect(toWib('2030-01-01T23:59:59Z')).toBe('2030-01-02T06:59:59.000Z');
        });
    });
});
