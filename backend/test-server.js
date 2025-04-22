import express from 'express';
import cors from 'cors';
import rentalsRoutes from './routes/rentalsRoutes.js';

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', rentalsRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
}); 