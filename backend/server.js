import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import hotelRoutes from './routes/hotel.routes.js';
import flightRoutes from './routes/flight.routes.js';
import cruiseRoutes from './routes/cruise.routes.js';
import emailRoutes from './routes/email.routes.js';
import rentalsRoutes from './routes/rentalsRoutes.js';
// import 
// const flightRoutes =re('./routes/flights');
// Load environment variables
dotenv.config();

const app = express();

// Debugging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body) {
    console.log('Body:', { ...req.body, password: req.body.password ? '***' : undefined });
  }
  next();
});

// CORS configuration
const corsOptions = {
  origin: '*', // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    cors: {
      origin: req.headers.origin,
      allowedOrigins: corsOptions.origin.toString()
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/cruises', cruiseRoutes);
app.use('/api/email', emailRoutes);
app.use('/api', rentalsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  if (err.message.includes('Not allowed by CORS')) {
    return res.status(403).json({
      message: 'CORS error: Origin not allowed',
      allowedOrigins: corsOptions.origin.toString()
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle 404 routes
app.use((req, res) => {
  console.log('404 - Route not found:', req.path);
  res.status(404).json({ message: `Route ${req.path} not found` });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Allowed Origins:', corsOptions.origin.toString());
  console.log('API Base URL:', '/api');
}); 