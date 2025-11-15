import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRouter from './routes/users';
import jobsRouter from './routes/jobs';
import fraudRouter from './routes/fraud-detection';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'JobVerify API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      jobs: '/api/jobs',
      fraudDetection: '/api/fraud-detection',
      health: '/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/users', usersRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/fraud-detection', fraudRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`JobVerify backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

