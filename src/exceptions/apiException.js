export default class ApiException extends Error {
    reportToSentry = true;
    status = 500;

    constructor(message, reportToSentry = true) {
        super(message);
        this.reportToSentry = reportToSentry;
    }

    getStatus() {
        return this.status;
    }

    getBody() {
        return {
            message: this.message,
        };
    }
}

export const errorResponse = (message, type, error = null) => ({
    type,
    message,
    error,
});
