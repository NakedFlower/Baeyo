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
import { Ionicons } from '@expo/vector-icons';
import { getImageByName } from '@/utils/imageUtils';
import { useRouter } from 'expo-router';

interface ChatRoom {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  participants: number;
  cover?: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const [chatRooms] = useState<ChatRoom[]>([
    {
      id: '1',
      name: '후라이드 치킨 2마리 공구방',
      lastMessage: '언제 주문하시나요?',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30분 전
      unreadCount: 2,
      participants: 4,
      cover: 'chicken',
    },
    {
      id: '2',
      name: '마라탕 4인분 모음',
      lastMessage: '매운 정도 어떻게 하실까요?',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2시간 전
      unreadCount: 0,
      participants: 3,
      cover: 'ddbbii',
    },
    {
      id: '3',
      name: '수제버거 세트',
      lastMessage: '주문 완료했습니다!',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5시간 전
      unreadCount: 1,
      participants: 2,
      cover: 'hamburger',
    },
  ]);

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}시간 전`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}일 전`;
    }
  };

  const renderChatRoom = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity 
      style={styles.chatRoomItem}
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <View style={styles.chatRoomAvatar}>
        {item.cover && getImageByName(item.cover) ? (
          <Image
            source={getImageByName(item.cover)}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.defaultAvatar}>
            <Ionicons name="restaurant" size={24} color="#9ca3af" />
          </View>
        )}
        {item.participants > 1 && (
          <View style={styles.participantsBadge}>
            <Text style={styles.participantsText}>{item.participants}</Text>
          </View>
        )}
      </View>

      <View style={styles.chatRoomContent}>
        <View style={styles.chatRoomHeader}>
          <Text style={styles.chatRoomName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.lastMessageTime}>
            {formatTime(item.lastMessageTime)}
          </Text>
        </View>
        <View style={styles.chatRoomFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>아직 채팅방이 없어요</Text>
      <Text style={styles.emptySubtitle}>
        공동구매에 참여하시면{'\n'}채팅방이 생성됩니다
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => router.push('/(tabs)/groupbuy')}
      >
        <Text style={styles.emptyButtonText}>공동구매 둘러보기</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>채팅</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="search" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {chatRooms.length > 0 ? (
        <FlatList
          data={chatRooms}
          renderItem={renderChatRoom}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <EmptyState />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerButton: {
    padding: 8,
  },
  list: {
    backgroundColor: '#fff',
  },
  chatRoomItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  chatRoomAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantsBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fb923c',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  participantsText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  chatRoomContent: {
    flex: 1,
  },
  chatRoomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatRoomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  lastMessageTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  chatRoomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 78,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#fb923c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});