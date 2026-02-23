import { Router } from 'express';
import { getAllUsers, banUser, addGame } from '../controllers/adminController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// (ต้องมี Token และ Token นั้นต้องมี isAdmin = true)
router.use(authenticateToken, authorizeAdmin);

router.get('/users', getAllUsers);
router.post('/ban/:userId', banUser);
router.post('/games', addGame);

export default router;