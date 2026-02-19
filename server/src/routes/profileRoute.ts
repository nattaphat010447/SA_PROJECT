import { Router } from 'express';
import { getMyProfile, updateProfile, updateMyGames, getAllGames } from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Route สำหรับดึงรายชื่อเกมทั้งหมด (ไม่ต้องมี Token ก็ดูได้)
router.get('/all-games', getAllGames);

// Route อื่นๆ ที่ต้องล็อกอินก่อน
router.get('/', authenticateToken, getMyProfile);
router.put('/', authenticateToken, updateProfile);
router.post('/games', authenticateToken, updateMyGames);

export default router;