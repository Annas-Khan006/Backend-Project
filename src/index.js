import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import usersRoutes from './routes/users.routes.js';

// Initialize the Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', usersRoutes);

// Connect to MongoDB
const uri = 'YOUR_MONGODB_CONNECTION_STRING';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB Connected');
    // Start the server after successful database connection
    app.listen(8000, () => {
      console.log('Server is running at port : 8000');
    });
  })
  .catch(err => {
    console.log('Failed to connect to MongoDB', err);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(500).json({ message: err.message });
  }
  next();
});
