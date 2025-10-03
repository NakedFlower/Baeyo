import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getImageByName } from '@/utils/imageUtils';
import { useAuth } from '../../contexts/AuthContext';
import postService, { Post } from '../../services/postService';
import { useEffect } from 'react';

interface MyPost {
  id: string;
  name: string;
  cover?: string;
  status: '모집중' | '모집완료' | '진행중';
  participants: number;
  maxParticipants: number;
  createdAt: Date;
}

export default function MyPostsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadMyPosts();
    }
  }, [isAuthenticated]);

  const loadMyPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getMyPosts();
      setPosts(response.posts);
    } catch (error) {
      console.error('내 게시글 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const samplePosts = [
    {
      id: '1',
      name: '족발/보쌈 하프&하프',
      cover: 'jogbal',
      status: '모집중',
      participants: 2,
      maxParticipants: 4,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: '2',
      name: '치킨 2마리 공동구매',
      cover: 'chicken',
      status: '모집완료',
      participants: 4,
      maxParticipants: 4,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECRUITING': case '모집중': return '#fb923c';
      case 'COMPLETED': case '모집완료': return '#10b981';
      case 'CANCELLED': case '진행중': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RECRUITING': return '모집중';
      case 'COMPLETED': return '완료';
      case 'CANCELLED': return '취소';
      default: return status;
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.postCard}>
      <View style={styles.postImageContainer}>
        {item.imageUrl ? (
          <Image
            source={{ uri: `http://112.170.204.205:3001${item.imageUrl}` }}
            style={styles.postImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.postImage, styles.placeholderImage]}>
            <Ionicons name="image" size={40} color="#d1d5db" />
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <View style={styles.postContent}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.priceInfo}>
          가격: {item.price.toLocaleString()}원
        </Text>
        <Text style={styles.participantInfo}>
          참여자: {item.currentPeople}/{item.maxPeople}명
        </Text>
        <Text style={styles.postDate}>
          {new Date(item.createdAt).toLocaleDateString('ko-KR')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 모집글</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>로드 중...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>작성한 모집글이 없습니다</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  list: {
    padding: 20,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  postImageContainer: {
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: 160,
  },
  placeholderImage: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  postContent: {
    padding: 16,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  priceInfo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fb923c',
    marginBottom: 4,
  },
  participantInfo: {
    fontSize: 14,
    color: '#10b981',
    marginBottom: 4,
  },
  postDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
});