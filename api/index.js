import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import requestsRouter from './routes/requests.js';
import { errorHandler } from './middleware/errorHandler.js';
import { isSupabaseConfigured } from './config/supabase.js';
import { isGeminiConfigured } from './config/gemini.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health and configuration check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: {
      supabase_configured: isSupabaseConfigured(),
      gemini_configured: isGeminiConfigured(),
      node_version: process.version,
    },
  });
});

// API Routes
app.use('/api/requests', requestsRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
