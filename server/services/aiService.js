import Groq from 'groq-sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let cachedPrediction = null;
let cacheTimestamp = null;
const CACHE_DURATION_MS = 10 * 60 * 1000;

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('GROQ_API_KEY not found, using fallback');
    return null;
  }
  return new Groq({ apiKey });
};

const SYSTEM_PROMPT = `You are a smart wait-time prediction engine for Spice Garden, an Indian restaurant.
Analyze queue data and predict accurate wait times.
Rules: dinner hours (6PM-10PM) are busier, weekends are busier than weekdays,
larger parties take longer to seat, customers with pre-orders get seated 10-15% faster.
Respond ONLY with valid JSON. No explanation text, no markdown, no backticks.`;

const buildPrompt = (data) => `Predict wait times given this queue data:
- People in queue: ${data.queueLength}
- Party sizes in queue: ${JSON.stringify(data.partySizes)}
- Available tables: ${data.availableTables}
- Current time: ${data.currentTime}
- Day of week: ${data.dayOfWeek}
- Avg table turnover: 35 minutes
- Customers with pre-orders: ${data.preOrderCount}

Respond in exactly this JSON format:
{
  "estimatedWaitMinutes": <number>,
  "waitRange": "<number>-<number> minutes",
  "confidence": "high" or "medium" or "low",
  "reasoning": "<brief explanation>",
  "peakHourWarning": true or false
}`;

const getFallbackPrediction = (queueLength, availableTables) => {
  const estimatedWaitMinutes = Math.ceil((queueLength * 35) / Math.max(availableTables, 1));
  return {
    estimatedWaitMinutes,
    waitRange: `${Math.max(0, estimatedWaitMinutes - 10)}-${estimatedWaitMinutes + 10} minutes`,
    confidence: 'low',
    reasoning: 'Estimated using standard formula',
    peakHourWarning: false,
  };
};

export const predictWaitTime = async (forceRefresh = false) => {
  try {
    const now = Date.now();
    if (!forceRefresh && cachedPrediction && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION_MS)) {
      return cachedPrediction;
    }

    const customers = await prisma.customer.findMany({
      where: { status: 'WAITING' },
      orderBy: { position: 'asc' },
      include: { orders: true },
    });

    const restaurant = await prisma.restaurant.findFirst();
    const totalTables = restaurant?.totalTables || 10;
    const seatedCount = await prisma.customer.count({ where: { status: 'SEATED' } });
    const availableTables = Math.max(0, totalTables - seatedCount);
    const queueLength = customers.length;
    const partySizes = customers.map(c => c.partySize);
    const preOrderCount = customers.filter(c => c.orders && c.orders.length > 0).length;

    const currentDate = new Date();
    const currentTime = currentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

    const client = getGroqClient();

    if (!client) {
      const fallback = getFallbackPrediction(queueLength, availableTables);
      cachedPrediction = fallback;
      cacheTimestamp = now;
      return fallback;
    }

    try {
      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildPrompt({ queueLength, partySizes, availableTables, currentTime, dayOfWeek, preOrderCount }) },
        ],
        max_tokens: 300,
        temperature: 0.3,
      });

      const text = response.choices[0].message.content;
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
      const prediction = JSON.parse(cleaned);

      if (!prediction || typeof prediction.estimatedWaitMinutes !== 'number') {
        throw new Error('Invalid prediction format');
      }

      await prisma.waitPrediction.create({
        data: {
          estimatedWaitMinutes: prediction.estimatedWaitMinutes,
          waitRange: prediction.waitRange,
          confidence: prediction.confidence,
          reasoning: prediction.reasoning,
          peakHourWarning: prediction.peakHourWarning || false,
        },
      });

      cachedPrediction = prediction;
      cacheTimestamp = now;
      console.log('Groq prediction successful:', prediction.waitRange, prediction.confidence);
      return prediction;

    } catch (groqError) {
      console.error('Groq API error, using fallback:', groqError.message);
      const fallback = getFallbackPrediction(queueLength, availableTables);
      cachedPrediction = fallback;
      cacheTimestamp = now;
      return fallback;
    }
  } catch (error) {
    console.error('Error in predictWaitTime:', error);
    return getFallbackPrediction(0, 10);
  }
};

export const invalidateCache = () => {
  cachedPrediction = null;
  cacheTimestamp = null;
};