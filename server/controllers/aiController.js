import { predictWaitTime } from '../services/aiService.js';

export const getWaitPrediction = async (req, res) => {
  try {
    const prediction = await predictWaitTime();
    res.json({ success: true, data: prediction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to get prediction' });
  }
};