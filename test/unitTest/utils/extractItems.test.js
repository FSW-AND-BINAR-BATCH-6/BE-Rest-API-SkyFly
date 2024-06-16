const { extractFirstData, extractSecondData } = require('../../../utils/extractItems');

describe('extractFirstData', () => {
    it('should extract and transform keys starting with "first_"', () => {
        const input = {
            first_name: 'John',
            first_age: 30,
            second_name: 'Doe',
            random_key: 'value'
        };
        const expectedOutput = {
            name: 'John',
            age: 30
        };
        const result = extractFirstData(input);
        expect(result).toEqual(expectedOutput);
    });

    it('should return an empty object if no keys start with "first_"', () => {
        const input = {
            second_name: 'Doe',
            random_key: 'value'
        };
        const expectedOutput = {};
        const result = extractFirstData(input);
        expect(result).toEqual(expectedOutput);
    });

    it('should handle an empty input object', () => {
        const input = {};
        const expectedOutput = {};
        const result = extractFirstData(input);
        expect(result).toEqual(expectedOutput);
    });
});

describe('extractSecondData', () => {
    it('should extract and transform keys starting with "second_"', () => {
        const input = {
            second_name: 'Doe',
            second_age: 25,
            first_name: 'John',
            random_key: 'value'
        };
        const expectedOutput = {
            _name: 'Doe',
            _age: 25
        };
        const result = extractSecondData(input);
        expect(result).toEqual(expectedOutput);
    });

    it('should return an empty object if no keys start with "second_"', () => {
        const input = {
            first_name: 'John',
            random_key: 'value'
        };
        const expectedOutput = {};
        const result = extractSecondData(input);
        expect(result).toEqual(expectedOutput);
    });

    it('should handle an empty input object', () => {
        const input = {};
        const expectedOutput = {};
        const result = extractSecondData(input);
        expect(result).toEqual(expectedOutput);
    });
});
