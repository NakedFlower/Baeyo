import api, { TokenManager } from './api';

export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  fullName?: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ProfileUpdateRequest {
  fullName?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  // 로그인
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', loginData);
    
    // 토큰 저장
    if (response.data.token) {
      await TokenManager.setToken(response.data.token);
    }
    
    return response.data;
  }

  // 회원가입
  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', registerData);
    
    // 토큰 저장
    if (response.data.token) {
      await TokenManager.setToken(response.data.token);
    }
    
    return response.data;
  }

  // 현재 사용자 정보 조회
  async getMe(): Promise<{ user: User }> {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  }

  // 프로필 업데이트
  async updateProfile(updateData: ProfileUpdateRequest): Promise<{ message: string; user: User }> {
    const response = await api.put<{ message: string; user: User }>('/auth/profile', updateData);
    return response.data;
  }

  // 비밀번호 변경
  async changePassword(passwordData: PasswordChangeRequest): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>('/auth/password', passwordData);
    return response.data;
  }

  // 로그아웃
  async logout(): Promise<void> {
    await TokenManager.removeToken();
  }

  // 인증 상태 확인
  async isAuthenticated(): Promise<boolean> {
    const token = await TokenManager.getToken();
    if (!token) return false;

    try {
      await this.getMe();
      return true;
    } catch (error) {
      await TokenManager.removeToken();
      return false;
    }
  }
}

export default new AuthService();