import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { User } from '../services/authService';
import { TokenManager } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (registerData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      
      // 먼저 토큰 확인
      const token = await TokenManager.getToken();
      if (!token) {
        console.log('토큰이 없습니다.');
        setUser(null);
        setIsAuthenticated(false);
        return;
      }
      
      // 토큰이 있으면 사용자 정보 확인
      const userResponse = await authService.getMe();
      setUser(userResponse.user);
      setIsAuthenticated(true);
      console.log('인증된 사용자:', userResponse.user.username);
      
    } catch (error) {
      console.error('인증 상태 확인 실패:', error);
      // 토큰이 유효하지 않으면 제거
      await TokenManager.removeToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('로그인 시도 중...', email);
      const response = await authService.login({ email, password });
      console.log('로그인 성공:', response.user.username);
      setUser(response.user);
      setIsAuthenticated(true);
      console.log('인증 상태 변경 완료: isAuthenticated =', true);
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  };

  const register = async (registerData: any) => {
    try {
      console.log('회원가입 시도 중...', registerData.email);
      const response = await authService.register(registerData);
      console.log('회원가입 성공:', response.user.username);
      setUser(response.user);
      setIsAuthenticated(true);
      console.log('인증 상태 변경 완료: isAuthenticated =', true);
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 에러가 있어도 로컬 상태는 초기화
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshUser = async () => {
    try {
      if (isAuthenticated) {
        const userResponse = await authService.getMe();
        setUser(userResponse.user);
      }
    } catch (error) {
      console.error('사용자 정보 새로고침 실패:', error);
      // 토큰이 만료되었을 수 있으므로 로그아웃 처리
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;