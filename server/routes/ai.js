import express from 'express';
import { getWaitPrediction } from '../controllers/aiController.js';

const router = express.Router();

router.get('/predict-wait', getWaitPrediction);

export default router;
