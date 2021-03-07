import ApiException, { errorResponse } from './apiException.js';

export const validationTypes = {
    INVALID_PARAMETER: 1,
    ALREADY_EXISTS: 2,
    NOT_FOUND: 3,
};

export default class Validation extends ApiException {
    errors;

    constructor(errors = []) {
        super('The request is not valid');
        this.reportToSentry = false;

        if (Array.isArray(errors)) {
            this.errors = errors;
        } else {
            this.errors = [errors];
        }
    }

    getStatus() {
        return 422;
    }

    getBody() {
        return errorResponse(this.message, 'validation', {
            messages: this.errors,
        });
    }
}

export const validationError = (
    key,
    message,
    uid = validationTypes.INVALID_PARAMETER
) => ({
    key,
    message,
    uid,
});
