// 1. Import all the necessary packages
import dotenv from 'dotenv';
dotenv.config();
// 2. Now import everything else
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import aiRoutes from './routes/aiRoutes.js'; // This will now work
// 2. Load environment variables
// dotenv.config();

// 3. Initialize the Express app
const app = express();

// 4. Apply middleware
app.use(cors()); // Allows cross-origin requests (from our React app)
app.use(express.json()); // Allows the server to accept JSON in the body of requests
// Define API routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
// 5. Define a simple test route
app.get('/', (req, res) => {
  res.send('Hello from the AI Task Decomposer API!');
});

// 6. Connect to MongoDB and start the server
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
    // Start listening for requests only after the DB connection is successful
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });