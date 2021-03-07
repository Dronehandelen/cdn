import express from 'express';
import fileRoutes from './file.js';
import imageRoutes from './image.js';

const router = express.Router();

router.use(fileRoutes);
router.use(imageRoutes);

export default router;
