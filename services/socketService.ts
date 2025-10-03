import { io, Socket } from 'socket.io-client';
import { TokenManager } from './api';
import { Message } from './chatService';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  // Socket.IO 연결
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    const token = await TokenManager.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    // 로컬 IP 주소 사용
    const SOCKET_URL = 'http://112.170.204.205:3001';
    // Android 에뮤레이터용 URL
    // const SOCKET_URL = 'http://10.0.2.2:3001';
    // iOS 시뮤레이터용 URL
    // const SOCKET_URL = 'http://localhost:3001';

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    return new Promise((resolve, reject) => {
      this.socket!.on('connect', () => {
        console.log('Socket.IO 연결됨');
        this.isConnected = true;
        resolve();
      });

      this.socket!.on('connect_error', (error) => {
        console.error('Socket.IO 연결 실패:', error);
        this.isConnected = false;
        reject(error);
      });

      this.socket!.on('disconnect', () => {
        console.log('Socket.IO 연결 해제됨');
        this.isConnected = false;
      });
    });
  }

  // Socket.IO 연결 해제
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // 채팅방 입장
  joinRoom(chatRoomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('소켓이 연결되어 있지 않습니다.'));
        return;
      }

      this.socket.emit('join-room', { chatRoomId });

      this.socket.once('joined-room', () => {
        console.log(`채팅방 ${chatRoomId}에 입장했습니다.`);
        resolve();
      });

      this.socket.once('error', (error) => {
        console.error('채팅방 입장 실패:', error);
        reject(error);
      });
    });
  }

  // 채팅방 나가기
  leaveRoom(chatRoomId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-room', { chatRoomId });
    }
  }

  // 메시지 전송
  sendMessage(chatRoomId: string, content: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('send-message', { chatRoomId, content });
    }
  }

  // 새 메시지 수신 이벤트 리스너
  onNewMessage(callback: (message: Message) => void): void {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  // 새 메시지 수신 이벤트 리스너 제거
  offNewMessage(): void {
    if (this.socket) {
      this.socket.off('new-message');
    }
  }

  // 타이핑 시작
  startTyping(chatRoomId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing-start', { chatRoomId });
    }
  }

  // 타이핑 종료
  stopTyping(chatRoomId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing-stop', { chatRoomId });
    }
  }

  // 타이핑 상태 수신 이벤트 리스너
  onUserTyping(callback: (data: { userId: string; chatRoomId: string }) => void): void {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  // 타이핑 종료 수신 이벤트 리스너
  onUserStopTyping(callback: (data: { userId: string; chatRoomId: string }) => void): void {
    if (this.socket) {
      this.socket.on('user-stop-typing', callback);
    }
  }

  // 연결 상태 확인
  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // 에러 이벤트 리스너
  onError(callback: (error: any) => void): void {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }
}

export default new SocketService();