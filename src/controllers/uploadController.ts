import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import path from 'path';
import fs from 'fs/promises';

// 단일 이미지 업로드
export const uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'File uploaded successfully',
      fileUrl,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 다중 이미지 업로드
export const uploadMultipleImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const uploadedFiles = files.map(file => ({
      fileUrl: `/uploads/${file.filename}`,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size
    }));
    
    res.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
      count: files.length
    });
  } catch (error) {
    console.error('Upload multiple images error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 프로필 사진 업데이트
export const updateProfileImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    // 기존 프로필 사진 정보 가져오기
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { avatar: true }
    });

    // 사용자 프로필 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatar: fileUrl },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        avatar: true
      }
    });

    // 기존 프로필 사진 파일 삭제 (기본 이미지가 아닌 경우)
    if (currentUser?.avatar && currentUser.avatar.startsWith('/uploads/')) {
      try {
        const oldFilePath = path.join(process.env.UPLOAD_DIR || 'uploads', path.basename(currentUser.avatar));
        await fs.unlink(oldFilePath);
      } catch (deleteError) {
        console.warn('Could not delete old profile image:', deleteError);
      }
    }

    res.json({
      message: 'Profile image updated successfully',
      user: updatedUser,
      fileUrl
    });
  } catch (error) {
    console.error('Update profile image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 파일 삭제
export const deleteFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      res.status(400).json({ error: 'Filename is required' });
      return;
    }

    // 파일 경로 구성
    const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', filename);
    
    try {
      await fs.unlink(filePath);
      res.json({ message: 'File deleted successfully' });
    } catch (deleteError) {
      console.error('File deletion error:', deleteError);
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 업로드된 파일 목록 조회 (관리자용)
export const getUploadedFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    
    const files = await fs.readdir(uploadDir);
    const fileInfos = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(uploadDir, filename);
        const stats = await fs.stat(filePath);
        
        return {
          filename,
          fileUrl: `/uploads/${filename}`,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        };
      })
    );

    // 최신 파일부터 정렬
    fileInfos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json({
      files: fileInfos,
      count: fileInfos.length
    });
  } catch (error) {
    console.error('Get uploaded files error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};