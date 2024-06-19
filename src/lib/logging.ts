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

    private static logToConsole(level: LogLevel, message: string) {
        switch (level) {
            case LogLevel.DEBUG:
                // eslint-disable-next-line no-console
                console.debug(this.prefix, 'color: black; font-weight: bold;', message);
                break;
            case LogLevel.INFO:
                // eslint-disable-next-line no-console
                console.info(this.prefix, this.defaultStyle, message);
                break;
            case LogLevel.WARN:
                // eslint-disable-next-line no-console
                console.warn(this.prefix, 'color: orange; font-weight: bold;', message);
                break;
            case LogLevel.ERROR:
                // eslint-disable-next-line no-console
                console.error(this.prefix, 'color: red; font-weight: bold;', message);
                break;
            default:
                // eslint-disable-next-line no-console
                console.log(this.prefix, this.defaultStyle, message);
                break;
        }
    }

    static log(message: string) {
        this.logToConsole(LogLevel.LOG, message);
    }

    static debug(message: string) {
        this.logToConsole(LogLevel.DEBUG, message);
    }

    static info(message: string) {
        this.logToConsole(LogLevel.INFO, message);
    }

    static warn(message: string) {
        this.logToConsole(LogLevel.WARN, message);
    }

    static error(message: string) {
        this.logToConsole(LogLevel.ERROR, message);
    }
}

export default Logger;
