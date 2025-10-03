import api from './api';
import { User } from './authService';

export interface Post {
  id: string;
  title: string;
  description: string;
  price: number;
  minPeople: number;
  maxPeople: number;
  currentPeople: number;
  imageUrl?: string;
  pickupLocation: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  deadline: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  participations?: {
    userId: string;
    user: {
      id: string;
      username: string;
      avatar?: string;
    };
  }[];
  chatRoom?: {
    id: string;
  };
  _count?: {
    participations: number;
  };
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CreatePostRequest {
  title: string;
  description: string;
  price: number;
  minPeople: number;
  maxPeople: number;
  pickupLocation: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  deadline: string;
  imageUrl?: string;
}

export interface UpdatePostRequest {
  title?: string;
  description?: string;
  price?: number;
  minPeople?: number;
  maxPeople?: number;
  pickupLocation?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  deadline?: string;
  imageUrl?: string;
  status?: string;
}

export interface PostFilters {
  page?: number;
  limit?: number;
  status?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class PostService {
  // 게시글 목록 조회
  async getPosts(filters: PostFilters = {}): Promise<PostsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get<PostsResponse>(`/posts?${params.toString()}`);
    return response.data;
  }

  // 게시글 상세 조회
  async getPost(id: string): Promise<{ post: Post }> {
    const response = await api.get<{ post: Post }>(`/posts/${id}`);
    return response.data;
  }

  // 게시글 생성
  async createPost(postData: CreatePostRequest): Promise<{ message: string; post: Post }> {
    const response = await api.post<{ message: string; post: Post }>('/posts', postData);
    return response.data;
  }

  // 게시글 수정
  async updatePost(id: string, updateData: UpdatePostRequest): Promise<{ message: string; post: Post }> {
    const response = await api.put<{ message: string; post: Post }>(`/posts/${id}`, updateData);
    return response.data;
  }

  // 게시글 삭제
  async deletePost(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/posts/${id}`);
    return response.data;
  }

  // 게시글 참여
  async joinPost(id: string): Promise<{ message: string; participation: any }> {
    const response = await api.post<{ message: string; participation: any }>(`/posts/${id}/join`);
    return response.data;
  }

  // 게시글 참여 취소
  async leavePost(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/posts/${id}/leave`);
    return response.data;
  }

  // 내가 작성한 게시글 조회
  async getMyPosts(filters: PostFilters = {}): Promise<PostsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get<PostsResponse>(`/posts/my-posts?${params.toString()}`);
    return response.data;
  }

  // 내가 참여한 게시글 조회
  async getMyParticipations(filters: PostFilters = {}): Promise<PostsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get<PostsResponse>(`/posts/my-participations?${params.toString()}`);
    return response.data;
  }
}

export default new PostService();