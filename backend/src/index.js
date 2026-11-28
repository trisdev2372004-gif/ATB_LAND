import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { connectDatabase } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import amenityRoutes from './routes/amenityRoutes.js';
import rentalRoomRoutes from './routes/rentalRoomRoutes.js';
import accommodationRoutes from './routes/accommodationRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import RoomTypeRoutes from './routes/roomTypeRoutes.js';
import RatingRoutes from './routes/ratingRoutes.js'
import mapRoutes from './routes/mapRoutes.js'

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/atb_land';

// Global Middlewares
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Docker Compose Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'atb-backend',
    dbState: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use('/api', authRoutes);
app.use('/api', amenityRoutes);
app.use('/api', rentalRoomRoutes);
app.use('/api', accommodationRoutes);
app.use('/api', roomRoutes);
app.use('/api', bookingRoutes);
app.use('/api', RoomTypeRoutes);
app.use('/api', RatingRoutes);
app.use('/api/map', mapRoutes);



// Khởi chạy kết nối MongoDB & Server
connectDatabase(MONGO_URI)
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[ATB LAND] Backend API đang chạy tại http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[ATB LAND] Lỗi kết nối MongoDB:', err.message);
    process.exit(1);
  });