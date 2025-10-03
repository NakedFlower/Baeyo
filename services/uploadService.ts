import api from './api';

export interface UploadResponse {
  message: string;
  fileUrl: string;
  filename: string;
  originalname: string;
  size: number;
}

export interface ProfileImageResponse {
  message: string;
  user: {
    id: string;
    username: string;
    fullName?: string;
    email: string;
    avatar?: string;
  };
  fileUrl: string;
}

class UploadService {
  // 단일 이미지 업로드
  async uploadImage(file: File | FormData): Promise<UploadResponse> {
    const formData = new FormData();
    
    if (file instanceof FormData) {
      // 이미 FormData인 경우
      const response = await api.post<UploadResponse>('/upload/image', file, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // File 객체인 경우
      formData.append('image', file);
      const response = await api.post<UploadResponse>('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
  }

  // React Native용 이미지 업로드
  async uploadImageFromUri(uri: string, filename?: string): Promise<UploadResponse> {
    const formData = new FormData();
    
    const fileExtension = uri.split('.').pop() || 'jpg';
    const fileName = filename || `image_${Date.now()}.${fileExtension}`;
    
    // React Native에서 FormData에 이미지 추가
    formData.append('image', {
      uri,
      type: `image/${fileExtension}`,
      name: fileName,
    } as any);

    const response = await api.post<UploadResponse>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  // 프로필 이미지 업데이트
  async updateProfileImage(uri: string, filename?: string): Promise<ProfileImageResponse> {
    const formData = new FormData();
    
    const fileExtension = uri.split('.').pop() || 'jpg';
    const fileName = filename || `profile_${Date.now()}.${fileExtension}`;
    
    formData.append('image', {
      uri,
      type: `image/${fileExtension}`,
      name: fileName,
    } as any);

    const response = await api.post<ProfileImageResponse>('/upload/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  // 파일 삭제
  async deleteFile(filename: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/upload/${filename}`);
    return response.data;
  }
}

export default new UploadService();