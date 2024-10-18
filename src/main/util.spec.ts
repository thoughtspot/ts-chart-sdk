import { timeout } from './util';

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
