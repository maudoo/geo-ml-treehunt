import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import client from '../../src/api/client';
import useAuthStore from '../../src/store/authStore';

interface ProfileData {
  display_name: string;
  email: string;
  xp: number;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await client.get('/users/me');
        setProfile(response.data);
      } catch {
        console.error('Failed to fetch profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login' as any);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>👤 Profile</Text>

      {profile && (
        <View style={styles.card}>
          <Text style={styles.name}>{profile.display_name}</Text>
          <Text style={styles.email}>{profile.email}</Text>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>{profile.xp} XP</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b4332',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#f0faf4',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#b7e4c7',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b4332',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  xpBadge: {
    backgroundColor: '#2d6a4f',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 99,
  },
  xpText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#ff4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  },
});