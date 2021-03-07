import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import appConfig from './config/app.js';
import logger from './services/logger.js';
import routes from './routes/index.js';

const app = express();
app.enable('trust proxy');
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
app.use(routes);

const server = app.listen(appConfig.port, () =>
    logger.info(`NOR FPV CDN listening on ${appConfig.port}`)
);
