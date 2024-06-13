const { dataCustomerDetail, dataItemDetail, totalPrice } = require('../../../utils/parameterMidtrans');
const { randomUUID } = require('crypto');
const { extractSecondData } = require('../../../utils/extractItems');

jest.mock('crypto', () => ({
    randomUUID: jest.fn(() => 'mocked-uuid'),
}));

jest.mock('../../../utils/extractItems', () => ({
    extractSecondData: jest.fn(),
}));

describe('dataCustomerDetail', () => {
    it('should return customer details correctly', async () => {
        const input = {
            fullName: 'Abdur Rohim',
            familyName: 'Rohim',
            phoneNumber: '1234567890',
            email: 'rohimjoinrahmat@example.com',
        };
        const result = await dataCustomerDetail(input);
        expect(result).toEqual({
            first_name: 'Abdur Rohim',
            last_name: 'Rohim',
            phone: '1234567890',
            email: 'rohimjoinrahmat@example.com',
            bookingDate: expect.any(String),
        });
    });
});

describe('dataItemDetail', () => {
    it('should return item details with one set of data correctly', async () => {
        extractSecondData.mockReturnValue({});
        const input = {
            first_dob: '2022-01-01',
            first_validityPeriod: '2024-01-01',
            first_title: 'Mr.',
            first_fullName: 'Abdur Rohim',
            first_familyName: 'Rohim',
            flightId: 'flight-123',
            first_citizenship: 'WAKANDA',
            first_issuingCountry: 'WAKANDA',
            first_price: 100,
            first_quantity: 2,
            first_seatId: 'seat-123',
        };
        const result = await dataItemDetail(input);
        expect(result).toEqual([
            {
                id: 'mocked-uuid',
                name: 'Mr. Abdur Rohim',
                dob: '2022-01-01T07:00:00.000Z',
                validityPeriod: '2024-01-01T07:00:00.000Z',
                familyName: 'Rohim',
                flightId: 'flight-123',
                citizenship: 'WAKANDA',
                issuingCountry: 'WAKANDA',
                price: 100,
                quantity: 2,
                seatId: 'seat-123',
            },
        ]);
    });

    it('should return item details with two sets of data correctly', async () => {
        extractSecondData.mockReturnValue({
            second_dob: '2023-01-01',
            second_validityPeriod: '2025-01-01',
        });
        const input = {
            first_dob: '2022-01-01',
            first_validityPeriod: '2024-01-01',
            first_title: 'Mr.',
            first_fullName: 'Abdur Rohim',
            first_familyName: 'Rohim',
            flightId: 'flight-123',
            first_citizenship: 'WAKANDA',
            first_issuingCountry: 'WAKANDA',
            first_price: 100,
            first_quantity: 2,
            first_seatId: 'seat-123',
            second_dob: '2023-01-01',
            second_validityPeriod: '2025-01-01',
            second_title: 'Ms.',
            second_fullName: 'Jane Rohim',
            second_familyName: 'Rohim',
            second_citizenship: 'Canada',
            second_issuingCountry: 'Canada',
            second_price: 150,
            second_quantity: 1,
            second_seatId: 'seat-456',
        };
        const result = await dataItemDetail(input);
        expect(result).toEqual([
            {
                id: 'mocked-uuid',
                name: 'Mr. Abdur Rohim',
                dob: '2022-01-01T07:00:00.000Z',
                validityPeriod: '2024-01-01T07:00:00.000Z',
                familyName: 'Rohim',
                flightId: 'flight-123',
                citizenship: 'WAKANDA',
                issuingCountry: 'WAKANDA',
                price: 100,
                quantity: 2,
                seatId: 'seat-123',
            },
            {
                id: 'mocked-uuid',
                name: 'Ms. Jane Rohim',
                dob: '2023-01-01T07:00:00.000Z',
                validityPeriod: '2025-01-01T07:00:00.000Z',
                familyName: 'Rohim',
                flightId: 'flight-123',
                citizenship: 'Canada',
                issuingCountry: 'Canada',
                price: 150,
                quantity: 1,
                seatId: 'seat-456',
            },
        ]);
    });
});

describe('totalPrice', () => {
    it('should calculate total price correctly', async () => {
        const input = [
            { price: 100, quantity: 2 },
            { price: 150, quantity: 1 },
        ];
        const result = await totalPrice(input);
        expect(result).toBe(350);
    });

    it('should return zero for empty input', async () => {
        const input = [];
        const result = await totalPrice(input);
        expect(result).toBe(0);
    });
});
