import { Router } from 'express';
import {
  createRating,
  getRatings,
  replyToRating,
  deleteOrHideRating,
} from '../controllers/ratingController.js';
import { authenticate, authorize } from '../middlewares/Auth.js';

const router = Router();

// Public: Xem danh sách đánh giá + thống kê sao theo accommodationId / roomId / rentalRoomId
router.get('/ratings', getRatings);

// Authenticated: Người dùng gửi đánh giá
router.post('/ratings', authenticate, createRating);

// Host / Admin: Phản hồi đánh giá của khách
router.post('/ratings/:id/reply', authenticate, authorize('HOST', 'ADMIN'), replyToRating);

// Chủ đánh giá xóa hoặc Admin ẩn đánh giá vi phạm
router.delete('/ratings/:id', authenticate, deleteOrHideRating);

export default router;