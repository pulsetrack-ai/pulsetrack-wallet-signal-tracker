// Logger utility for consistent logging
export class Logger {
    constructor(options = {}) {
        this.options = options;
    }

    log(level, message, ...args) {
        if (this.options.enabled) {
            console[level](`${this.options.prefix || ''}${message}`, ...args);
        }
    }

    info(message, ...args) {
        this.log('info', message, ...args);
    }

    warn(message, ...args) {
        this.log('warn', message, ...args);
    }

    error(message, ...args) {
        this.log('error', message, ...args);
    }
}

