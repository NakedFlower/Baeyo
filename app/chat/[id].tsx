import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getImageByName } from '@/utils/imageUtils';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isMe: boolean;
}

interface ChatRoomInfo {
  id: string;
  name: string;
  participants: number;
  cover?: string;
}

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [roomInfo, setRoomInfo] = useState<ChatRoomInfo | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // 샘플 데이터
  useEffect(() => {
    // 채팅방 정보 설정
    const roomData = {
      '1': {
        id: '1',
        name: '후라이드 치킨 2마리 공구방',
        participants: 4,
        cover: 'chicken',
      },
      '2': {
        id: '2',
        name: '마라탕 4인분 모음',
        participants: 3,
        cover: 'ddbbii',
      },
      '3': {
        id: '3',
        name: '수제버거 세트',
        participants: 2,
        cover: 'hamburger',
      },
    };

    setRoomInfo(roomData[id as keyof typeof roomData] || null);

    // 샘플 메시지
    const sampleMessages: Message[] = [
      {
        id: '1',
        text: '안녕하세요! 치킨 공동구매에 관심 있어서 들어왔습니다.',
        senderId: 'user1',
        senderName: '김치킨',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        isMe: false,
      },
      {
        id: '2',
        text: '어서오세요! 현재 3명 모였어요.',
        senderId: 'creator',
        senderName: '치킨러버123',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 30000),
        isMe: false,
      },
      {
        id: '3',
        text: '저도 참여하고 싶습니다!',
        senderId: 'me',
        senderName: '나',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        isMe: true,
      },
      {
        id: '4',
        text: '좋아요! 그럼 4명 다 모였네요. 언제 주문하실까요?',
        senderId: 'creator',
        senderName: '치킨러버123',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isMe: false,
      },
      {
        id: '5',
        text: '저는 언제든 괜찮아요!',
        senderId: 'user1',
        senderName: '김치킨',
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        isMe: false,
      },
    ];

    setMessages(sampleMessages);
  }, [id]);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      senderId: 'me',
      senderName: '나',
      timestamp: new Date(),
      isMe: true,
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // 새 메시지가 추가되면 맨 아래로 스크롤
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const hour12 = hours % 12 || 12;
    return `${ampm} ${hour12}:${minutes.toString().padStart(2, '0')}`;
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isMe ? styles.myMessageContainer : styles.otherMessageContainer
    ]}>
      {!item.isMe && (
        <Text style={styles.senderName}>{item.senderName}</Text>
      )}
      <View style={[
        styles.messageBubble,
        item.isMe ? styles.myMessageBubble : styles.otherMessageBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.isMe ? styles.myMessageText : styles.otherMessageText
        ]}>
          {item.text}
        </Text>
      </View>
      <Text style={[
        styles.messageTime,
        item.isMe ? styles.myMessageTime : styles.otherMessageTime
      ]}>
        {formatTime(item.timestamp)}
      </Text>
    </View>
  );

  if (!roomInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>채팅방을 찾을 수 없습니다</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          {roomInfo.cover && (
            <Image
              source={getImageByName(roomInfo.cover)}
              style={styles.headerImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.headerText}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {roomInfo.name}
            </Text>
            <Text style={styles.headerSubtitle}>
              참여자 {roomInfo.participants}명
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* 메시지 리스트 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* 입력 영역 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="메시지를 입력하세요..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() ? '#fff' : '#9ca3af'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuButton: {
    padding: 4,
    marginLeft: 8,
  },
  // Messages
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    marginLeft: 4,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '100%',
  },
  myMessageBubble: {
    backgroundColor: '#fb923c',
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#1f2937',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: '#9ca3af',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#9ca3af',
    textAlign: 'left',
  },
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#f9fafb',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#fb923c',
  },
  sendButtonInactive: {
    backgroundColor: '#f3f4f6',
  },
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
  },
});