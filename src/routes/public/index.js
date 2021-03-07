import express from 'express';
import imageRoutes from './image.js';
import fileRoutes from './file.js';

const router = express.Router();

router.use(imageRoutes);
router.use(fileRoutes);

export default router;
