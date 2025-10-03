import { Router } from 'express';
import {
  getChatRooms,
  getChatRoom,
  getChatMessages,
  sendMessage,
  leaveChatRoom
} from '../controllers/chatController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 모든 라우트에 인증 필요
router.use(authenticateToken);

// 채팅방 목록 조회
router.get('/', getChatRooms);

// 특정 채팅방 정보 조회
router.get('/:id', getChatRoom);

// 채팅방 메시지 조회
router.get('/:id/messages', getChatMessages);

// 메시지 전송 (REST API)
router.post('/:id/messages', sendMessage);

// 채팅방 나가기
router.delete('/:id/leave', leaveChatRoom);

export default router;