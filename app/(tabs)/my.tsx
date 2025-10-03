import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  joinDate: Date;
  totalParticipations: number;
  totalSavings: number;
}

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
}

export default function MyScreen() {
  const router = useRouter();
  const [user] = useState<UserProfile>({
    name: '김배요',
    email: 'baeyo@example.com',
    joinDate: new Date('2024-01-15'),
    totalParticipations: 23,
    totalSavings: 156000,
  });

  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      title: '프로필 수정',
      icon: 'person-outline',
      type: 'navigation',
      onPress: () => router.push('/my/profile'),
    },
    {
      id: 'my-posts',
      title: '내 모집글',
      icon: 'document-text-outline',
      type: 'navigation',
      onPress: () => router.push('/my/posts'),
    },
    {
      id: 'my-participations',
      title: '참여한 공구',
      icon: 'bag-outline',
      type: 'navigation',
      onPress: () => router.push('/my/participations'),
    },
    {
      id: 'favorites',
      title: '찜한 목록',
      icon: 'heart-outline',
      type: 'navigation',
      onPress: () => router.push('/my/favorites'),
    },
  ];

  const settingsItems: MenuItem[] = [
    {
      id: 'notifications',
      title: '알림 설정',
      icon: 'notifications-outline',
      type: 'toggle',
      value: notificationEnabled,
      onPress: () => setNotificationEnabled(!notificationEnabled),
    },
    {
      id: 'location',
      title: '위치 서비스',
      icon: 'location-outline',
      type: 'toggle',
      value: locationEnabled,
      onPress: () => setLocationEnabled(!locationEnabled),
    },
    {
      id: 'privacy',
      title: '개인정보 처리방침',
      icon: 'shield-outline',
      type: 'navigation',
      onPress: () => Alert.alert('알림', '개인정보 처리방침을 확인합니다.'),
    },
    {
      id: 'terms',
      title: '이용약관',
      icon: 'document-outline',
      type: 'navigation',
      onPress: () => Alert.alert('알림', '이용약관을 확인합니다.'),
    },
    {
      id: 'help',
      title: '고객센터',
      icon: 'help-circle-outline',
      type: 'navigation',
      onPress: () => Alert.alert('알림', '고객센터로 이동합니다.'),
    },
  ];

  const renderMenuItem = (item: MenuItem, isLast: boolean = false) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, isLast && styles.lastMenuItem]}
      onPress={item.onPress}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={item.icon as any} size={24} color="#6b7280" />
        <Text style={styles.menuItemText}>{item.title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onPress}
            trackColor={{ false: '#d1d5db', true: '#fb923c' }}
            thumbColor={'#fff'}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        )}
      </View>
    </TouchableOpacity>
  );

  const formatJoinDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}년 ${month}월 가입`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 프로필 섹션 */}
        <LinearGradient
          colors={['#fb923c', '#ea580c']}
          style={styles.profileSection}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Ionicons name="person" size={36} color="#fff" />
                </View>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.joinDate}>
              {formatJoinDate(user.joinDate)}
            </Text>
          </View>
          </View>

          {/* 통계 섹션 */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.totalParticipations}</Text>
              <Text style={styles.statLabel}>참여한 공구</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {(user.totalSavings / 10000).toFixed(0)}만원
              </Text>
              <Text style={styles.statLabel}>절약한 금액</Text>
            </View>
          </View>
        </LinearGradient>

        {/* 메뉴 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내 활동</Text>
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) =>
              renderMenuItem(item, index === menuItems.length - 1)
            )}
          </View>
        </View>

        {/* 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>설정</Text>
          <View style={styles.menuContainer}>
            {settingsItems.map((item, index) =>
              renderMenuItem(item, index === settingsItems.length - 1)
            )}
          </View>
        </View>

        {/* 로그아웃 버튼 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() =>
              Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
                { text: '취소', style: 'cancel' },
                { text: '로그아웃', style: 'destructive' },
              ])
            }
          >
            <Text style={styles.logoutButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>BaeYo v1.0.0</Text>
          <Text style={styles.footerText}>
            © 2024 공동구매 플랫폼. All rights reserved.
          </Text>
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
  // Profile Section
  profileSection: {
    padding: 24,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#fff',
  },
  defaultAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  joinDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 20,
  },
  // Menu Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  menuItemRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Logout Button
  logoutButton: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
});