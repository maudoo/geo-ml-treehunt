import { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import client from '../../src/api/client';
import useAuthStore from '../../src/store/authStore';
import { colors } from '../../src/theme';
import Card from '../../src/components/Card';
import { LEVEL_AVATARS } from '../../src/leveling';

interface ProfileData {
  display_name: string;
  email: string;
  xp: number;
  rank: number;
  total_players: number;
  level: number;
  is_max_level: boolean;
  xp_into_level: number;
  xp_for_level: number;
  progress: number;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useAuthStore();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
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
    }, [])
  );

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login' as any);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>👤 Profile</Text>

      {profile && (
        <>
          <View style={styles.avatarSection}>
            <Image source={LEVEL_AVATARS[profile.level]} style={styles.avatar} />
            <Text style={styles.name}>{profile.display_name}</Text>
            <Text style={styles.email}>{profile.email}</Text>
          </View>

          <Card style={styles.statCard}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Level {profile.level}</Text>
            </View>
            <Text style={styles.rank}>#{profile.rank} of {profile.total_players} players</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(profile.progress * 100)}%` }]} />
            </View>
            <Text style={styles.progressLabel}>
              {profile.is_max_level
                ? `Max level reached — ${profile.xp} XP`
                : `${profile.xp_into_level} / ${profile.xp_for_level} XP to Level ${profile.level + 1}`}
            </Text>
          </Card>
        </>
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
    backgroundColor: colors.white,
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
    color: colors.primaryDark,
    marginBottom: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 140,
    height: 140,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: colors.textSubtle,
  },
  statCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 99,
    marginBottom: 8,
  },
  levelBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rank: {
    fontSize: 14,
    color: colors.textSubtle,
  },
  progressTrack: {
    width: '100%',
    height: 12,
    backgroundColor: colors.cardBorder,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textFaint,
    marginTop: 8,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
});
