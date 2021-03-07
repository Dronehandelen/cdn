import PG from 'pg';
import dbConfig from '../config/db.js';
import knex from 'knex';
import chalk from 'chalk';
import moment from 'moment';
import path from 'path';
import logger from './logger.js';

const pool = new PG.Pool({
    user: dbConfig.user,
    host: dbConfig.host,
    database: dbConfig.database,
    password: dbConfig.password,
    port: dbConfig.port,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const queryBuilder = knex({
    client: 'pg',
    connection: {
        user: dbConfig.user,
        host: dbConfig.host,
        database: dbConfig.database,
        password: dbConfig.password,
        port: dbConfig.port,
    },
    pool: { min: 0, max: 10 },
    migrations: {
        directory: path.resolve('./src/migrations'),
        tableName: 'migrations',
        loadExtensions: ['.cjs'],
    },
});

const times = {};

queryBuilder
    .on('query', (query) => {
        times[query.__knexQueryUid] = moment();
    })
    .on('query-response', (response, query, builder) => {
        if (times[query.__knexQueryUid]) {
            const sql = builder.toString();
            logger.debug(
                chalk.blue(
                    `DB query - ${moment().diff(
                        times[query.__knexQueryUid],
                        'ms'
                    )}ms - ${sql}`
                )
            );

            delete times[query.__knexQueryUid];
        }
    });

export default {
    query: async (text, params) => {
        const start = Date.now();
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        logger.debug(chalk.blue(`DB query - ${duration}ms - ${text}`));
        return res;
    },
};
