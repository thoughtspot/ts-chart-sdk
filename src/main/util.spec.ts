import { getQueryParam, handleMissingValue, timeout } from './util';

describe('timeout function', () => {
    jest.useFakeTimers();

    it('should resolve with the original promise result if it completes before timeout', async () => {
        const promise = Promise.resolve('success');
        const result = timeout(promise, 1000);

        await expect(result).resolves.toBe('success');
    });

    it('should reject with a timeout error if the promise takes too long', async () => {
        const promise = new Promise((resolve) => {
            setTimeout(resolve, 2000);
        });
        const result = timeout(promise, 1000);

        jest.advanceTimersByTime(1000);

        await expect(result).rejects.toThrow('Operation timed out.');
    });

    it('should use the custom error message when provided', async () => {
        const promise = new Promise((resolve) => {
            setTimeout(resolve, 2000);
        });
        const result = timeout(promise, 1000, 'Custom timeout message');

        jest.advanceTimersByTime(1000);

        await expect(result).rejects.toThrow('Custom timeout message');
    });

    it('should reject with the original promise error if it rejects before timeout', async () => {
        const promise = Promise.reject(new Error('Original error'));
        const result = timeout(promise, 1000);

        await expect(result).rejects.toThrow('Original error');
    });
});

describe('getQueryParam', () => {
    it('should return the value of a query parameter if it exists', () => {
        const url = 'https://example.com/?key=value';
        expect(getQueryParam(url, 'key')).toBe('value');
    });

    it('should return an empty string if the query parameter does not exist', () => {
        const url = 'https://example.com/';
        expect(getQueryParam(url, 'missingKey')).toBe('');
    });

    it('should return "false" if the query parameter is "debug" and it is not present', () => {
        const url = 'https://example.com/';
        expect(getQueryParam(url, 'debug')).toBe('false');
    });

    it('should return the default value "false" if the query parameter is "debug" and is set to an empty value', () => {
        const url = 'https://example.com/?debug=';
        expect(getQueryParam(url, 'debug')).toBe('');
    });

    it('should handle complex URLs with multiple parameters correctly', () => {
        const url = 'https://example.com/?key1=value1&key2=value2';
        expect(getQueryParam(url, 'key2')).toBe('value2');
    });
});

describe('handleMissingValue', () => {
    it('should return "false" if paramKey is "debug" and paramValue is undefined', () => {
        expect(handleMissingValue('debug', undefined)).toBe('false');
    });

    it('should return "false" if paramKey is "debug" and paramValue is null', () => {
        expect(handleMissingValue('debug', null)).toBe('false');
    });

    it('should return an empty string if paramValue is undefined and paramKey is not "debug"', () => {
        expect(handleMissingValue('param', undefined)).toBe('');
    });

    it('should return an empty string if paramValue is null and paramKey is not "debug"', () => {
        expect(handleMissingValue('param', null)).toBe('');
    });

    it('should return the paramValue if paramValue is defined and not null', () => {
        expect(handleMissingValue('param', 'value')).toBe('value');
    });

    it('should return the paramValue even if paramKey is "debug" and paramValue is defined', () => {
        expect(handleMissingValue('debug', 'true')).toBe('true');
    });
});
