import { Router } from 'express';
import { getAvailability, createBooking, getBookings } from '../controllers/bookingController.js';
import { optionalAuth, authenticate } from '../middlewares/Auth.js';

const router = Router();

router.get('/bookings/availability', getAvailability);
router.post('/bookings', optionalAuth, createBooking);
router.get('/bookings', optionalAuth, getBookings);

export default router;