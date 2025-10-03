import api from './api';

export interface ChatRoom {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  post: {
    id: string;
    title: string;
    status: string;
    author: {
      id: string;
      username: string;
      avatar?: string;
    };
  };
  members: {
    id: string;
    joinedAt: string;
    user: {
      id: string;
      username: string;
      avatar?: string;
    };
  }[];
  messages?: Message[];
  _count: {
    messages: number;
    members: number;
  };
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    fullName?: string;
    avatar?: string;
  };
}

export interface ChatRoomsResponse {
  chatRooms: ChatRoom[];
}

export interface ChatRoomResponse {
  chatRoom: ChatRoom;
}

export interface MessagesResponse {
  messages: Message[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface SendMessageResponse {
  message: string;
  data: Message;
}

class ChatService {
  // 채팅방 목록 조회
  async getChatRooms(): Promise<ChatRoomsResponse> {
    const response = await api.get<ChatRoomsResponse>('/chat');
    return response.data;
  }

  // 특정 채팅방 정보 조회
  async getChatRoom(chatRoomId: string): Promise<ChatRoomResponse> {
    const response = await api.get<ChatRoomResponse>(`/chat/${chatRoomId}`);
    return response.data;
  }

  // 채팅방 메시지 조회
  async getChatMessages(
    chatRoomId: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<MessagesResponse> {
    const response = await api.get<MessagesResponse>(
      `/chat/${chatRoomId}/messages?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  // 메시지 전송 (REST API)
  async sendMessage(chatRoomId: string, content: string): Promise<SendMessageResponse> {
    const response = await api.post<SendMessageResponse>(
      `/chat/${chatRoomId}/messages`,
      { content }
    );
    return response.data;
  }

  // 채팅방 나가기
  async leaveChatRoom(chatRoomId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/chat/${chatRoomId}/leave`);
    return response.data;
  }
}

export default new ChatService();