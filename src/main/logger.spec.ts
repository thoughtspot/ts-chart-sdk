import { create, LogLevel, logMethods } from './logger';

jest.mock('./util', () => ({
    getQueryParam: jest.fn().mockReturnValue('true'),
}));

describe('Logger', () => {
    let originalConsole: Record<string, any>;
    let logger: any;

    beforeAll(() => {
        // Save original console methods
        originalConsole = {
            error: console.error,
            warn: console.warn,
            info: console.info,
            log: console.log,
            trace: console.trace,
        };
        // Mock console methods
        const error = jest.fn();
        const warn = jest.fn();
        const info = jest.fn();
        const log = jest.fn();
        const trace = jest.fn();
        logMethods[LogLevel.ERROR] = error;
        logMethods[LogLevel.WARN] = warn;
        logMethods[LogLevel.INFO] = info;
        logMethods[LogLevel.DEBUG] = log;
        logMethods[LogLevel.TRACE] = trace;
        console.error = error;
        console.warn = warn;
        console.info = info;
        console.log = log;
        console.trace = trace;
    });

    afterAll(() => {
        // Restore original console methods
        logMethods[LogLevel.ERROR] = originalConsole.error;
        logMethods[LogLevel.WARN] = originalConsole.warn;
        logMethods[LogLevel.INFO] = originalConsole.info;
        logMethods[LogLevel.DEBUG] = originalConsole.log;
        logMethods[LogLevel.TRACE] = originalConsole.trace;
        console.error = originalConsole.error;
        console.warn = originalConsole.warn;
        console.info = originalConsole.info;
        console.log = originalConsole.log;
        console.trace = originalConsole.trace;
    });

    beforeEach(() => {
        // Set debug to 'true' to enable logging
        (global as any).window = {
            location: { href: 'https://example.com/?debug=true' },
        };
        logger = create('TestLogger');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('logMessages', () => {
        it('should log messages with appropriate prefixes for DEBUG level', async () => {
            await logger.debug('Debug message');
            expect(console.log).toHaveBeenCalledWith(
                'DEBUG (TestLogger)(] Debug message)',
            );
        });

        it('should log messages with appropriate prefixes for INFO level', async () => {
            await logger.info('Info message');
            expect(console.info).toHaveBeenCalledWith(
                'INFO (TestLogger)(] Info message)',
            );
        });

        it('should log messages with appropriate prefixes for WARN level', async () => {
            await logger.warn('Warn message');
            expect(console.warn).toHaveBeenCalledWith(
                'WARN (TestLogger)(] Warn message)',
            );
        });

        it('should log messages with appropriate prefixes for ERROR level', async () => {
            await logger.error('Error message');
            expect(console.error).toHaveBeenCalledWith(
                'ERROR (TestLogger)(] Error message)',
            );
        });

        it('should log messages with appropriate prefixes for TRACE level', async () => {
            await logger.trace('Trace message');
            expect(console.trace).toHaveBeenCalledWith(
                'TRACE (TestLogger)(] Trace message)',
            );
        });
    });

    describe('create function', () => {
        it('should create a new logger instance if one does not exist', () => {
            const newLogger = create('NewLogger');
            expect(newLogger).not.toBe(undefined);
            expect(newLogger).toBeInstanceOf(Object);
        });

        it('should return the same logger instance if it already exists', () => {
            const logger1 = create('SharedLogger');
            const logger2 = create('SharedLogger');
            expect(logger1).toBe(logger2);
        });
    });
});
