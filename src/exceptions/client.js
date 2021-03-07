import ApiException, { errorResponse } from './apiException.js';

export default class Client extends ApiException {
    error;
    key;

    constructor(message, key, error = {}) {
        super(message);
        this.key = key;
        this.error = error;
        this.reportToSentry = false;
    }

    getStatus() {
        return 400;
    }

    getBody() {
        return errorResponse(this.message, this.key, this.error);
    }
}
