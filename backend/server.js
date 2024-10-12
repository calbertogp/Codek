const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const houseRoutes = require('./routes/houses');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users'); // Add this line

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes); // Add this line

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Not Found middleware
app.use((req, res, next) => {
  res.status(404).json({ message: 'Sorry, that route does not exist.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

const PORT = process.env.PORT || 3001;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Improved server startup
const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is already in use. Trying port ${PORT + 1}`);
      PORT++;
      startServer();
    } else {
      console.error('Error starting server:', err);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  });
};

startServer();