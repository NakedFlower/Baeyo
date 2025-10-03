import { Router } from 'express';
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  joinPost,
  leavePost,
  getMyPosts,
  getMyParticipations
} from '../controllers/postController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 모든 라우트에 인증 필요
router.use(authenticateToken);

// 게시글 목록 및 생성
router.get('/', getPosts);
router.post('/', createPost);

// 내가 작성한/참여한 게시글
router.get('/my-posts', getMyPosts);
router.get('/my-participations', getMyParticipations);

// 특정 게시글 조회, 수정, 삭제
router.get('/:id', getPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

// 게시글 참여/탈퇴
router.post('/:id/join', joinPost);
router.delete('/:id/leave', leavePost);

export default router;