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

interface FavoriteItem {
  id: string;
  name: string;
  cover?: string;
  createdBy: string;
  price: number;
  addedAt: Date;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([
    {
      id: '1',
      name: '보쌈 대왕세트',
      cover: 'bossam',
      createdBy: '보쌈킬러',
      price: 50000,
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
    {
      id: '2',
      name: '피자 라지 2판',
      cover: 'pizza',
      createdBy: '피자마니아',
      price: 35000,
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ]);

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };

  const renderFavorite = ({ item }: { item: FavoriteItem }) => (
    <View style={styles.favoriteCard}>
      <TouchableOpacity style={styles.favoriteContent}>
        <View style={styles.imageContainer}>
          {item.cover && getImageByName(item.cover) ? (
            <Image
              source={getImageByName(item.cover)}
              style={styles.favoriteImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.favoriteImage, styles.placeholderImage]}>
              <Ionicons name="image" size={32} color="#d1d5db" />
            </View>
          )}
        </View>
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteTitle}>{item.name}</Text>
          <Text style={styles.createdBy}>작성자: {item.createdBy}</Text>
          <Text style={styles.favoritePrice}>
            예상 단가: {item.price.toLocaleString()}원
          </Text>
          <Text style={styles.addedDate}>
            {item.addedAt.toLocaleDateString('ko-KR')} 찜
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeFavorite(item.id)}
      >
        <Ionicons name="heart" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>찜한 목록</Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={favorites}
        renderItem={renderFavorite}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>찜한 모집글이 없습니다</Text>
            <Text style={styles.emptySubtext}>마음에 드는 공동구매를 찜해보세요</Text>
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
  favoriteCard: {
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
    alignItems: 'center',
  },
  favoriteContent: {
    flexDirection: 'row',
    flex: 1,
  },
  imageContainer: {
    marginRight: 12,
  },
  favoriteImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  favoriteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  createdBy: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  favoritePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fb923c',
    marginBottom: 4,
  },
  addedDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
  },
});