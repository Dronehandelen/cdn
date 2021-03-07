import isReady, { addCheck } from '../services/readiness.js';
import logger from '../services/logger.js';
import express from 'express';
import moment from 'moment';
import { queryBuilder } from '../services/db.js';

const { Router } = express;
const router = Router();
let lastDbSuccess = moment();

export const isLiveCheck = async () => {
    if (lastDbSuccess.isBefore(moment().subtract(20, 'seconds'))) {
        throw new Error('No contact with DB for more than 20 seconds');
    }

    return true;
};

const isReadyCheck = async () => {
    try {
        await queryBuilder.select(queryBuilder.raw('0'));
        lastDbSuccess = moment();
    } catch (e) {
        throw new Error('No db connection');
    }
};

addCheck(isReadyCheck);

router.get('/_ah/health', (req, res) => {
    const probe = req.query.probe;
    if (probe === 'liveness') {
        isLiveCheck()
            .then(() => {
                res.sendStatus(200);
            })
            .catch(() => res.sendStatus(503));
    } else if (probe === 'readiness') {
        isReady()
            .then(() => {
                res.sendStatus(200);
            })
            .catch((err) => {
                logger.error(err);
                res.sendStatus(503);
            });
    } else {
        res.status(503).send();
    }
});

export default router;
