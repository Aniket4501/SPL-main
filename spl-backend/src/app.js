const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import routes
const apiRoutes = require('./routes');

const app = express();

// Middleware
app.use(helmet());
// CORS - Allow all origins (update with specific frontend URL in production if needed)
app.use(cors({
  origin: '*', // Allow all origins - update with specific frontend domain for production
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root endpoint - API info
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SPL Backend API',
    version: '1.0.0',
    health: '/health',
    api: '/api',
    endpoints: {
      health: '/health',
      leaderboard: '/api/leaderboard',
      upload: '/api/upload',
      admin: '/api/admin'
    }
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const prisma = require('./prisma/prismaClient');
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'OK',
      message: 'Server is running',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Server is running but database is not connected',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;

