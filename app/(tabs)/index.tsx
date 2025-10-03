import React, { useState, useEffect } from 'react';
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
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import { getImageByName } from '@/utils/imageUtils';
import { 
  getCurrentLocation, 
  reverseGeocode, 
  samplePickupLocations,
  sortByDistance,
  formatDistance,
  calculateDistance,
  LocationCoordinates,
  PickupLocation 
} from '@/utils/locationUtils';
import postService, { Post } from '../../services/postService';
import { useAuth } from '../../contexts/AuthContext';

interface GroupBuyItem {
  id: string;
  name: string;
  cover?: string;
  createdBy: string;
  createdAt: Date;
  price?: number;
}

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('위치 조회 중...');
  const [nearbyPickupLocations, setNearbyPickupLocations] = useState<PickupLocation[]>([]);

  // 실제 데이터 로드 (인증된 사용자만)
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  // 화면에 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        console.log('홈 화면에 포커스 - 데이터 새로고침');
        loadPostsOnly();
      }
    }, [user])
  );

  const loadInitialData = async () => {
    if (!user) {
      console.log('인증되지 않은 사용자 - 데이터 로드 건너뜠');
      return;
    }
    
    setLoading(true);
    try {
      // 최근 게시글 로드 (최신 순)
      const postsResponse = await postService.getPosts({ 
        page: 1, 
        limit: 10,
        status: 'RECRUITING',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setRecentPosts(postsResponse.posts);
      console.log('게시글 로드 성공:', postsResponse.posts.length, '개');

      // 현재 위치 가져오기
      const location = await getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        
        // 주소 변환
        const address = await reverseGeocode(location);
        setCurrentAddress(address);
        
        // 근처 수령 위치 정렬
        const sortedLocations = sortByDistance(samplePickupLocations, location);
        setNearbyPickupLocations(sortedLocations.slice(0, 3)); // 가까운 3곳만
      } else {
        setCurrentAddress('위치 근처 범위');
        setNearbyPickupLocations(samplePickupLocations.slice(0, 3));
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      // 사용자에게 오류 알림
      setRecentPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // 게시물만 로드하는 함수 (더 빠른 새로고침용)
  const loadPostsOnly = async () => {
    if (!user) return;
    
    try {
      const postsResponse = await postService.getPosts({ 
        page: 1, 
        limit: 10,
        status: 'RECRUITING',
        sortBy: 'createdAt', // 최신 순으로 정렬
        sortOrder: 'desc'
      });
      setRecentPosts(postsResponse.posts);
      console.log('게시물 새로고침 성공:', postsResponse.posts.length, '개');
    } catch (error) {
      console.error('게시물 로드 실패:', error);
    }
  };

  // Pull-to-refresh 함수
  const onRefresh = React.useCallback(async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      console.log('Pull-to-refresh - 데이터 새로고침');
      await loadPostsOnly();
    } catch (error) {
      console.error('새로고침 실패:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  const renderRecentItem = ({ item }: { item: Post }) => (
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
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {item.status === 'RECRUITING' ? '모집중' : item.status === 'COMPLETED' ? '완료' : '취소'}
          </Text>
        </View>
      </View>
      <View style={styles.postInfo}>
        <Text style={styles.postTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.postPrice}>가격: {item.price.toLocaleString()}원</Text>
        <Text style={styles.postAuthor}>작성자: {item.author.username}</Text>
        <Text style={styles.postParticipants}>
          참여자: {item.currentPeople}/{item.maxPeople}명
        </Text>
      </View>
    </TouchableOpacity>
  );

  const sponsorPosts: GroupBuyItem[] = [
    {
      id: 'sponsor1',
      name: '족발/보쌈 하프&하프',
      cover: 'jogbal',
      createdBy: 'BaeYo',
      price: 45000,
      createdAt: new Date(),
    },
    {
      id: 'sponsor2',
      name: '보쌈 대왕세트',
      cover: 'bossam',
      createdBy: 'BaeYo',
      price: 50000,
      createdAt: new Date(),
    },
    {
      id: 'sponsor3',
      name: '후라이드 치킨 2마리',
      cover: 'chicken',
      createdBy: 'BaeYo',
      price: 18000,
      createdAt: new Date(),
    },
    {
      id: 'sponsor4',
      name: '피자 라지 2판',
      cover: 'pizza',
      createdBy: 'BaeYo',
      price: 35000,
      createdAt: new Date(),
    },
  ];

  const renderSponsorItem = ({ item }: { item: GroupBuyItem }) => (
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
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.sponsorBadge}
        >
          <Text style={styles.sponsorBadgeText}>BaeYo 이벤트</Text>
        </LinearGradient>
      </View>
      <View style={styles.postInfo}>
        <Text style={styles.postTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.sponsorDescription}>
          BaeYo가 1인분 치를 같이 내드려요! 🎉
        </Text>
        <Text style={styles.postAuthor}>주최: {item.createdBy}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#fb923c']}
            tintColor={'#fb923c'}
            title="데이터를 새로고침하는 중..."
            titleColor={'#fb923c'}
          />
        }
      >
        {/* 헤더 섹션 */}
        <LinearGradient
          colors={['#ffedd5', '#fff7ed']}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <Image
              source={getImageByName('baeyo')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headerTitle}>같이 시키면 훨씬 싸다!</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="지금 우리 동네 공동구매 찾아보기"
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="search" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* 현재 위치 섹션 */}
        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={20} color="#fb923c" />
            <Text style={styles.locationTitle}>현재 설정 위치: {currentAddress}</Text>
            <TouchableOpacity style={styles.locationRefreshButton}>
              <Ionicons name="refresh" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 근처 수령위치 지도 */}
        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>근처 수령위치</Text>
          <View style={styles.mapContainer}>
            {currentLocation && (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                {/* 현재 위치 마커 */}
                <Marker
                  coordinate={currentLocation}
                  title="내 위치"
                  pinColor="blue"
                />
                {/* 수령 위치 마커들 */}
                {nearbyPickupLocations.map((location) => (
                  <Marker
                    key={location.id}
                    coordinate={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                    }}
                    title={location.name}
                    description={location.description}
                    pinColor="red"
                  />
                ))}
              </MapView>
            )}
          </View>
          
          {/* 수령위치 리스트 */}
          <View style={styles.pickupLocationsList}>
            {nearbyPickupLocations.map((location) => (
              <TouchableOpacity key={location.id} style={styles.pickupLocationItem}>
                <View style={styles.pickupLocationInfo}>
                  <Text style={styles.pickupLocationName}>{location.name}</Text>
                  <Text style={styles.pickupLocationDescription}>{location.description}</Text>
                </View>
                {currentLocation && (
                  <Text style={styles.pickupLocationDistance}>
                    {formatDistance(calculateDistance(currentLocation, location))}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 방금 올라온 모집글 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>방금 올라온 모집 글</Text>
          <FlatList
            data={recentPosts}
            renderItem={renderRecentItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* BaeYo 스폰서 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BaeYo도 같이 먹을래</Text>
          <FlatList
            data={sponsorPosts}
            renderItem={renderSponsorItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    shadowColor: '#fb923c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    height: 40,
    width: 120,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#7c2d12',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchButton: {
    backgroundColor: '#fb923c',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 4,
    width: width * 0.7,
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
    height: 140,
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
    top: 8,
    right: 8,
    backgroundColor: '#fb923c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  postInfo: {
    padding: 16,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  postPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fb923c',
    marginBottom: 4,
  },
  postAuthor: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  postParticipants: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '500',
  },
  sponsorBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  sponsorBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  sponsorDescription: {
    fontSize: 13,
    color: '#10b981',
    marginBottom: 8,
    fontWeight: '500',
  },
  // Location Styles
  locationSection: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginLeft: 8,
  },
  locationRefreshButton: {
    padding: 4,
  },
  // Map Styles
  mapSection: {
    marginBottom: 24,
  },
  mapContainer: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    width: '100%',
    height: 200,
  },
  pickupLocationsList: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  pickupLocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pickupLocationInfo: {
    flex: 1,
  },
  pickupLocationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  pickupLocationDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  pickupLocationDistance: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fb923c',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
