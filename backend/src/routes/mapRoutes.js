// routes/mapRoutes.js
import { Router } from 'express';
import { getNearbyPlaces } from '../controllers/mapController.js';

const router = Router();
router.get('/nearby', getNearbyPlaces);
export default router;

