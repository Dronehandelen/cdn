import ApiException, { errorResponse } from './apiException.js';

export default class NotLoggedIn extends ApiException {
    constructor() {
        super('You are not logged in');
        this.reportToSentry = false;
    }

    getStatus() {
        return 401;
    }

    getBody() {
        return errorResponse(this.message, 'not_logged_in');
    }
}
