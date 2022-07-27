class ApplicationError extends Error {
    constructor(message, status) {
        super();

        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;

        this.message = message || 'Internal Server Error.';

        this.status = status || 500;
    }
}

class CustomError extends ApplicationError {
    constructor(message, status) {
        super(message || 'Internal Server Error.', status || 500);
    }
}

module.exports = { CustomError }