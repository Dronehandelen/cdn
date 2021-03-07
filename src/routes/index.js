import express from 'express';
import privateRoutes from './private/index.js';
import healthRoutes from './health.js';
import publicRoutes from './public/index.js';

const router = express.Router();
const apiRouter = express.Router();

apiRouter.use('/private', privateRoutes);
apiRouter.use('/public', publicRoutes);

router.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to the NOR FPV CDN API',
    });
});

router.use('/api/v1', apiRouter);
router.use(healthRoutes);

export default router;
