import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import useAuthStore from '../src/store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/lib/theme';

export default function RootLayout() {
  const { token, loadToken } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadToken().then(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login' as any);
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [token, segments, isReady]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}