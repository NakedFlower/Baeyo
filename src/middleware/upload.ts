import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// 저장소 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_DIR || 'uploads';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 파일명: timestamp_원본파일명
    const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// 파일 필터 (이미지만 허용)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
  }
};

// Multer 설정
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB 기본값
    files: 5 // 최대 5개 파일
  }
});

// 단일 파일 업로드 (프로필 사진, 게시글 이미지 등)
export const uploadSingle = upload.single('image');

// 다중 파일 업로드 (게시글 여러 이미지)
export const uploadMultiple = upload.array('images', 5);

// 에러 핸들링 미들웨어
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ error: 'File too large' });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ error: 'Too many files' });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ error: 'Unexpected field name' });
      default:
        return res.status(400).json({ error: 'Upload error' });
    }
  }
  
  if (error.message) {
    return res.status(400).json({ error: error.message });
  }
  
  next(error);
};