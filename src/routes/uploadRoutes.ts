import { Router } from 'express';
import {
  uploadImage,
  uploadMultipleImages,
  updateProfileImage,
  deleteFile,
  getUploadedFiles
} from '../controllers/uploadController';
import { authenticateToken } from '../middleware/auth';
import { uploadSingle, uploadMultiple, handleUploadError } from '../middleware/upload';

const router = Router();

// 모든 라우트에 인증 필요
router.use(authenticateToken);

// 단일 이미지 업로드
router.post('/image', uploadSingle, handleUploadError, uploadImage);

// 다중 이미지 업로드
router.post('/images', uploadMultiple, handleUploadError, uploadMultipleImages);

// 프로필 사진 업데이트
router.post('/profile-image', uploadSingle, handleUploadError, updateProfileImage);

// 파일 삭제
router.delete('/:filename', deleteFile);

// 업로드된 파일 목록 조회
router.get('/files', getUploadedFiles);

export default router;