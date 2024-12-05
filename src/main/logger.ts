import { getQueryParam } from './util';

const loggers: Record<string, any> = {};
const url = window.location.href;

export enum LogLevel {
    SILENT = -1 as number,
    ERROR = 0 as number,
    WARN = 1 as number,
    INFO = 2 as number,
    DEBUG = 3 as number,
    TRACE = 4 as number,
}

export const logMethods: { [key: number]: any } = {
    [LogLevel.ERROR]: console.error,
    [LogLevel.WARN]: console.warn,
    [LogLevel.INFO]: console.info,
    [LogLevel.DEBUG]: console.log,
    [LogLevel.TRACE]: console.trace,
};

class Logger {
    private msgPrefix: string;

    constructor(name: string) {
        this.msgPrefix = name ? `(${name})` : '';
    }

    private getFormattedMessage(msg: string, logLevel: LogLevel) {
        return (
            `${LogLevel[logLevel]} ${this.msgPrefix}` +
            `(${msg ? `] ${msg}` : ''})`
        );
    }

    public async logMessages(args: any, logLevel: LogLevel) {
        const newArgs = args;
        if (getQueryParam(url, 'debug') !== 'true') {
            return;
        }
        const logFn = logMethods[logLevel];
        newArgs[0] = this.getFormattedMessage(newArgs[0], logLevel);
        if (logFn) {
            logFn(...newArgs);
        }
    }

    public async trace(...args: any) {
        this.logMessages(args, LogLevel.TRACE);
    }

    /**
     * Wrapper for log.log() with debug level
     * @param msg
     */
    public async debug(...args: any) {
        this.logMessages(args, LogLevel.DEBUG);
    }

    public async log(...args: any) {
        this.debug(...args);
    }

    /**
     * Wrapper for log.info() with info level
     * @param msg
     */
    public async info(...args: any) {
        this.logMessages(args, LogLevel.INFO);
    }

    /**
     * Wrapper for log.warn() with warn level
     *
     * @param {string} msg The log message
     */
    public async warn(...args: any) {
        this.logMessages(args, LogLevel.WARN);
    }

    /**
     * Wrapper for log.error() with error level
     * Error is propagated via callback
     * @param {string}  msg  The log message
     */
    public async error(...args: any) {
        const stackTrace = this.logMessages(args, LogLevel.ERROR);
    }
}

export function create(name: string): any {
    if (!loggers[name]) {
        loggers[name] = new Logger(name);
    }
    return loggers[name];
}
