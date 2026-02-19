import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoute.js';
import uploadRoutes from './routes/uploadRoute.js';
import profileRoutes from './routes/profileRoute.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // อ่าน JSON body ได้

// Connect Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.send('Game Match API is Ready! 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});