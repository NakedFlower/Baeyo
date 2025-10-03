import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 베이스 URL (개발용 - 실제 환경에서는 환경변수로 관리)
const API_BASE_URL = 'http://112.170.204.205:3001/api'; // 로컬 IP 주소
// const API_BASE_URL = 'http://10.0.2.2:3001/api'; // Android 에뮤레이터용
// const API_BASE_URL = 'http://localhost:3001/api'; // iOS 시뮤레이터용

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 관리
export const TokenManager = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('토큰 가져오기 실패:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('토큰 저장 실패:', error);
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('토큰 삭제 실패:', error);
    }
  }
};

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
  async (config) => {
    const token = await TokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 401 에러 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 또는 인증 실패
      await TokenManager.removeToken();
      // 로그인 화면으로 리다이렉트 필요
    }
    return Promise.reject(error);
  }
);

export default api;