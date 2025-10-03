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
} from 'react-native';
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

interface GroupBuyItem {
  id: string;
  name: string;
  cover?: string;
  createdBy: string;
  createdAt: Date;
}

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const [recentPosts, setRecentPosts] = useState<GroupBuyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('위치 조회 중...');
  const [nearbyPickupLocations, setNearbyPickupLocations] = useState<PickupLocation[]>([]);

  // 샘플 데이터 생성 및 위치 정보 로드
  useEffect(() => {
    const loadData = async () => {
      // 샘플 데이터 설정
      const sampleData: GroupBuyItem[] = [
        {
          id: '1',
          name: '후라이드 치킨 2마리',
          cover: 'chicken',
          createdBy: '치킨러버123',
          createdAt: new Date(),
        },
        {
          id: '2',
          name: '마라탕 4인분 모음',
          cover: 'ddbbii',
          createdBy: '마라탕매니아',
          createdAt: new Date(),
        },
        {
          id: '3',
          name: '수제버거 세트',
          cover: 'hamburger',
          createdBy: '버거킹',
          createdAt: new Date(),
        },
        {
          id: '4',
          name: '피자 라지 2판',
          cover: 'pizza',
          createdBy: '피자마니아',
          createdAt: new Date(),
        },
      ];
      setRecentPosts(sampleData);

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
    };
    
    loadData();
  }, []);

  const renderRecentItem = ({ item }: { item: GroupBuyItem }) => (
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
      <View style={styles.postInfo}>
        <Text style={styles.postTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.postAuthor}>작성자: {item.createdBy}</Text>
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
  postAuthor: {
    fontSize: 14,
    color: '#6b7280',
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
