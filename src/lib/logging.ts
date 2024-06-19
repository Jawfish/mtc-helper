/* eslint-disable no-console */

enum LogLevel {
    LOG = 'log',
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error'
}

class Logger {
    private static prefix = '%c[MTC Helper]';

    private static defaultStyle = 'color: blue; font-weight: bold;';

    private static logToConsole(level: LogLevel, args: unknown[]) {
        switch (level) {
            case LogLevel.DEBUG:
                console.debug(this.prefix, 'color: black; font-weight: bold;', ...args);
                break;
            case LogLevel.INFO:
                console.info(this.prefix, this.defaultStyle, ...args);
                break;
            case LogLevel.WARN:
                console.warn(this.prefix, 'color: orange; font-weight: bold;', ...args);
                break;
            case LogLevel.ERROR:
                console.error(this.prefix, 'color: red; font-weight: bold;', ...args);
                break;
            default:
                console.log(this.prefix, this.defaultStyle, ...args);
                break;
        }
    }

    static log(...args: unknown[]) {
        this.logToConsole(LogLevel.LOG, args);
    }

    static debug(...args: unknown[]) {
        this.logToConsole(LogLevel.DEBUG, args);
    }

    static info(...args: unknown[]) {
        this.logToConsole(LogLevel.INFO, args);
    }

    static warn(...args: unknown[]) {
        this.logToConsole(LogLevel.WARN, args);
    }

    static error(...args: unknown[]) {
        this.logToConsole(LogLevel.ERROR, args);
    }
}

export default Logger;
