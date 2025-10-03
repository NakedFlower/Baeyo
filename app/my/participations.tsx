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

interface Participation {
  id: string;
  name: string;
  cover?: string;
  createdBy: string;
  status: '참여중' | '완료' | '취소';
  joinedAt: Date;
}

export default function ParticipationsScreen() {
  const router = useRouter();
  const [participations] = useState<Participation[]>([
    {
      id: '1',
      name: '마라탕 4인분 모음',
      cover: 'ddbbii',
      createdBy: '마라탕매니아',
      status: '참여중',
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
    {
      id: '2',
      name: '수제버거 세트',
      cover: 'hamburger',
      createdBy: '버거킹',
      status: '완료',
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
    {
      id: '3',
      name: '피자 라지 2판',
      cover: 'pizza',
      createdBy: '피자마니아',
      status: '완료',
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '참여중': return '#3b82f6';
      case '완료': return '#10b981';
      case '취소': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderParticipation = ({ item }: { item: Participation }) => (
    <TouchableOpacity style={styles.participationCard}>
      <View style={styles.imageContainer}>
        {item.cover && getImageByName(item.cover) ? (
          <Image
            source={getImageByName(item.cover)}
            style={styles.participationImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.participationImage, styles.placeholderImage]}>
            <Ionicons name="image" size={32} color="#d1d5db" />
          </View>
        )}
      </View>
      <View style={styles.participationContent}>
        <Text style={styles.participationTitle}>{item.name}</Text>
        <Text style={styles.createdBy}>작성자: {item.createdBy}</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <Text style={styles.joinDate}>
            {item.joinedAt.toLocaleDateString('ko-KR')} 참여
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>참여한 공구</Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={participations}
        renderItem={renderParticipation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bag-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>참여한 공동구매가 없습니다</Text>
          </View>
        }
      />
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
  participationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    marginRight: 12,
  },
  participationImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participationContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  participationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  createdBy: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  joinDate: {
    fontSize: 12,
    color: '#9ca3af',
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