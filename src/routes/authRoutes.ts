import { Router } from 'express';
import { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  changePassword 
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 공개 라우트 (인증 불필요)
router.post('/register', register);
router.post('/login', login);

// 보호된 라우트 (인증 필요)
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.put('/password', authenticateToken, changePassword);

export default router;