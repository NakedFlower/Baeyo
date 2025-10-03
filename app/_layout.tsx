import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

export const unstable_settings = {
  initialRouteName: 'auth/login',
};

function AppNavigator() {
  const { isAuthenticated, loading, user } = useAuth();
  const colorScheme = useColorScheme();

  // 디버깅을 위한 로그
  console.log('AppNavigator 렌더링:', { isAuthenticated, loading, user: user?.username });

  if (loading) {
    console.log('로딩 중 상태 표시');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#fb923c" />
        <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 16 }}>로딩 중...</Text>
      </View>
    );
  }

  console.log('네비게이션 결정:', isAuthenticated ? '메인 화면 표시' : '로그인 화면 표시');

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/register" />
          </>
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
