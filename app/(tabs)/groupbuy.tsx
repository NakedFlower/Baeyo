import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getImageByName } from '@/utils/imageUtils';
import { 
  getCurrentLocation, 
  calculateDistance,
  formatDistance,
  samplePickupLocations,
  LocationCoordinates,
  PickupLocation 
} from '@/utils/locationUtils';

interface GroupBuyItem {
  id: string;
  name: string;
  cover?: string;
  createdBy: string;
  originalPrice?: number; // 1인분 원가
  expectedPrice?: number; // 예상 공구 단가
  deadline?: Date;
  description?: string;
  pickupLocation?: PickupLocation;
  createdAt: Date;
}

const { width } = Dimensions.get('window');

export default function GroupBuyScreen() {
  const [posts, setPosts] = useState<GroupBuyItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);

  // 샘플 데이터 및 위치 로드
  useEffect(() => {
    const loadData = async () => {
      // 현재 위치 가져오기
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      
    const sampleData: GroupBuyItem[] = [
      {
        id: '1',
        name: '후라이드 치킨 2마리',
        cover: 'chicken',
        createdBy: '치킨러버123',
        originalPrice: 24000, // 1인분 원가
        expectedPrice: 18000, // 공구 예상 단가
        description: '교촌치킨 후라이드 2마리 같이 시킬 분 구해요! 배달비 나눠내요~',
        pickupLocation: samplePickupLocations[0],
        createdAt: new Date(),
      },
      {
        id: '2',
        name: '마라탕 4인분 모음',
        cover: 'ddbbii',
        createdBy: '마라탕매니아',
        originalPrice: 42000,
        expectedPrice: 32000,
        description: '염염한 마라탕 4인분! 같이 매운맛 도전하실 분!',
        pickupLocation: samplePickupLocations[1],
        createdAt: new Date(),
      },
      {
        id: '3',
        name: '수제버거 세트',
        cover: 'hamburger',
        createdBy: '버거킹',
        originalPrice: 30000,
        expectedPrice: 24000,
        description: '맛있는 수제버거 세트 공구해요. 감자튀김도 포함!',
        pickupLocation: samplePickupLocations[2],
        createdAt: new Date(),
      },
      {
        id: '4',
        name: '피자 라지 2판',
        cover: 'pizza',
        createdBy: '피자마니아',
        originalPrice: 45000,
        expectedPrice: 35000,
        description: '도미노피자 라지 2판 나눠먹을 사람 구합니다!',
        pickupLocation: samplePickupLocations[3],
        createdAt: new Date(),
      },
      {
        id: '5',
        name: '족발/보쌈 하프&하프',
        cover: 'jogbal',
        createdBy: '족발마스터',
        originalPrice: 58000,
        expectedPrice: 45000,
        description: '족밝보쌈 하프앤하프로 같이 드실분 찾아요~',
        pickupLocation: samplePickupLocations[0],
        createdAt: new Date(),
      },
      {
        id: '6',
        name: '보쌈 대왕세트',
        cover: 'bossam',
        createdBy: '보쌈킬러',
        originalPrice: 65000,
        expectedPrice: 50000,
        description: '보쌈 대왕세트! 많이 드시는 분들과 함께해요',
        pickupLocation: samplePickupLocations[1],
        createdAt: new Date(),
      },
    ];
    setPosts(sampleData);
    };
    
    loadData();
  }, []);

  const filteredPosts = useMemo(() => {
    let filtered = posts.filter((post) =>
      post.name.toLowerCase().includes(searchText.toLowerCase())
    );
    
    // 거리순 정렬
    if (sortByDistance && currentLocation) {
      filtered = filtered.sort((a, b) => {
        if (!a.pickupLocation || !b.pickupLocation) return 0;
        const distanceA = calculateDistance(currentLocation, a.pickupLocation);
        const distanceB = calculateDistance(currentLocation, b.pickupLocation);
        return distanceA - distanceB;
      });
    }
    
    return filtered;
  }, [posts, searchText, sortByDistance, currentLocation]);

  const renderPostItem = ({ item }: { item: GroupBuyItem }) => (
    <TouchableOpacity style={styles.postCard}>
      <View style={styles.postImageContainer}>
        {item.cover && getImageByName(item.cover) ? (
          <Image
            source={getImageByName(item.cover)}
            style={styles.postImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.postImage, styles.placeholderImage]}>
            <Ionicons name="image" size={40} color="#d1d5db" />
          </View>
        )}
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>모집중</Text>
        </View>
      </View>
      <View style={styles.postContent}>
        <Text style={styles.postTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.priceContainer}>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>
              1인분 단가: {item.originalPrice.toLocaleString()}원
            </Text>
          )}
          {item.expectedPrice && (
            <Text style={styles.expectedPrice}>
              예상 단가: {item.expectedPrice.toLocaleString()}원
            </Text>
          )}
          {item.originalPrice && item.expectedPrice && (
            <Text style={styles.discountBadge}>
              {Math.round((1 - item.expectedPrice / item.originalPrice) * 100)}% 절약
            </Text>
          )}
        </View>
        {item.description && (
          <Text style={styles.postDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        {/* 수령 위치 정보 */}
        {item.pickupLocation && (
          <View style={styles.pickupLocationSection}>
            <View style={styles.pickupLocationHeader}>
              <Ionicons name="location" size={16} color="#fb923c" />
              <Text style={styles.pickupLocationTitle}>{item.pickupLocation.name}</Text>
              {currentLocation && (
                <Text style={styles.pickupLocationDistance}>
                  {formatDistance(calculateDistance(currentLocation, item.pickupLocation))}
                </Text>
              )}
            </View>
            <Text style={styles.pickupLocationDesc}>{item.pickupLocation.description}</Text>
          </View>
        )}
        
        <View style={styles.postFooter}>
          <Text style={styles.postAuthor}>작성자: {item.createdBy}</Text>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>참여하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const CreatePostModal = () => {
    const [title, setTitle] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [expectedPrice, setExpectedPrice] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPickupLocation, setSelectedPickupLocation] = useState<PickupLocation | null>(samplePickupLocations[0]);

    const handleSubmit = () => {
      if (!title.trim()) {
        Alert.alert('알림', '제목을 입력해주세요.');
        return;
      }

      const newPost: GroupBuyItem = {
        id: Date.now().toString(),
        name: title,
        createdBy: '나',
        originalPrice: originalPrice ? parseInt(originalPrice) : undefined,
        expectedPrice: expectedPrice ? parseInt(expectedPrice) : undefined,
        description: description,
        pickupLocation: selectedPickupLocation,
        createdAt: new Date(),
      };

      setPosts([newPost, ...posts]);
      setModalVisible(false);
      setTitle('');
      setOriginalPrice('');
      setExpectedPrice('');
      setDescription('');
      Alert.alert('성공', '모집글이 등록되었습니다!');
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>모집글 작성</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>제목 *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="예: 치킨 공동구매 모집"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>1인분 단가</Text>
                <TextInput
                  style={styles.input}
                  placeholder="24000"
                  value={originalPrice}
                  onChangeText={setOriginalPrice}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>예상 공구 단가</Text>
                <TextInput
                  style={styles.input}
                  placeholder="18000"
                  value={expectedPrice}
                  onChangeText={setExpectedPrice}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>설명</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="상세 정보, 참여 조건 등을 적어주세요"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>수령 위치</Text>
                <View style={styles.pickupLocationSelector}>
                  {samplePickupLocations.map((location) => (
                    <TouchableOpacity
                      key={location.id}
                      style={[
                        styles.pickupOption,
                        selectedPickupLocation?.id === location.id && styles.pickupOptionSelected
                      ]}
                      onPress={() => setSelectedPickupLocation(location)}
                    >
                      <View style={styles.pickupOptionContent}>
                        <Text style={[
                          styles.pickupOptionName,
                          selectedPickupLocation?.id === location.id && styles.pickupOptionSelectedText
                        ]}>
                          {location.name}
                        </Text>
                        <Text style={[
                          styles.pickupOptionDesc,
                          selectedPickupLocation?.id === location.id && styles.pickupOptionSelectedText
                        ]}>
                          {location.description}
                        </Text>
                      </View>
                      {selectedPickupLocation?.id === location.id && (
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>등록하기</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>공동구매</Text>
        <View style={styles.headerActions}>
          {currentLocation && (
            <TouchableOpacity
              style={[styles.locationButton, sortByDistance && styles.locationButtonActive]}
              onPress={() => setSortByDistance(!sortByDistance)}
            >
              <Ionicons 
                name="location" 
                size={20} 
                color={sortByDistance ? "#fff" : "#fb923c"} 
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="검색: 제목, 키워드"
          value={searchText}
          onChangeText={setSearchText}
        />
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
      </View>

      <FlatList
        data={filteredPosts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>모집글이 없습니다</Text>
          </View>
        }
      />

      <CreatePostModal />
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
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#fb923c',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButtonActive: {
    backgroundColor: '#fb923c',
    borderColor: '#fb923c',
  },
  addButton: {
    backgroundColor: '#fb923c',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  searchIcon: {
    marginLeft: 8,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postImageContainer: {
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
    backgroundColor: '#fb923c',
    paddingHorizontal: 12,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  priceContainer: {
    marginBottom: 12,
  },
  originalPrice: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
    textDecorationLine: 'line-through',
  },
  expectedPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fb923c',
    marginBottom: 4,
  },
  discountBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    backgroundColor: '#d1fae5',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  // Pickup Location Styles
  pickupLocationSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  pickupLocationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pickupLocationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginLeft: 6,
  },
  pickupLocationDistance: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fb923c',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pickupLocationDesc: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 22,
  },
  postDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postAuthor: {
    fontSize: 14,
    color: '#9ca3af',
  },
  joinButton: {
    backgroundColor: '#fb923c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  modalForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#fb923c',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Pickup Location Selector
  pickupLocationSelector: {
    gap: 8,
  },
  pickupOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
  pickupOptionSelected: {
    backgroundColor: '#fb923c',
    borderColor: '#fb923c',
  },
  pickupOptionContent: {
    flex: 1,
  },
  pickupOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  pickupOptionDesc: {
    fontSize: 12,
    color: '#6b7280',
  },
  pickupOptionSelectedText: {
    color: '#fff',
  },
});
