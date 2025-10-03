import * as Location from 'expo-location';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface PickupLocation extends LocationCoordinates {
  id: string;
  name: string;
  description: string;
  address: string;
}

// 두 좌표 간 거리 계산 (km 단위)
export const calculateDistance = (
  coord1: LocationCoordinates,
  coord2: LocationCoordinates
): number => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 거리를 사용자 친화적 문자열로 변환
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

// 현재 위치 조회
export const getCurrentLocation = async (): Promise<LocationCoordinates | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Location permission denied');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

// 좌표를 주소로 변환 (Reverse Geocoding)
export const reverseGeocode = async (
  coordinates: LocationCoordinates
): Promise<string> => {
  try {
    const result = await Location.reverseGeocodeAsync(coordinates);
    if (result.length > 0) {
      const location = result[0];
      return `${location.district || location.city || ''} ${location.street || ''} ${location.name || ''}`.trim();
    }
    return '알 수 없는 위치';
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return '주소 조회 실패';
  }
};

// 샘플 수령 위치들 (실제로는 서버에서 가져올 데이터)
export const samplePickupLocations: PickupLocation[] = [
  {
    id: '1',
    name: '스타필드 하남점',
    description: '정문 앞 1층 로비',
    address: '경기도 하남시 미사대로 750',
    latitude: 37.5454,
    longitude: 127.2232,
  },
  {
    id: '2',
    name: '미사 센트럴파크',
    description: '중앙공원 정자',
    address: '경기도 하남시 미사강변한강로 85',
    latitude: 37.5510,
    longitude: 127.2180,
  },
  {
    id: '3',
    name: '미사역',
    description: '지하철 5호선 미사역 2번 출구',
    address: '경기도 하남시 미사대로 지하 750',
    latitude: 37.5576,
    longitude: 127.2186,
  },
  {
    id: '4',
    name: '미사리조트',
    description: '리조트 정문 앞',
    address: '경기도 하남시 망월동 231-2',
    latitude: 37.5610,
    longitude: 127.2380,
  },
];

// 거리 순으로 위치들 정렬
export const sortByDistance = <T extends LocationCoordinates>(
  locations: T[],
  currentLocation: LocationCoordinates
): T[] => {
  return locations.sort((a, b) => {
    const distanceA = calculateDistance(currentLocation, a);
    const distanceB = calculateDistance(currentLocation, b);
    return distanceA - distanceB;
  });
};