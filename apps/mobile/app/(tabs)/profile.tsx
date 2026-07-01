import { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import client from '../../src/api/client';
import useAuthStore from '../../src/store/authStore';
import { colors, spacing } from '../../src/lib/theme';
import Card from '../../src/components/Card';
import { LEVEL_AVATARS } from '../../src/lib/leveling';
import SkeletonBox from '../../src/components/SkeletonBox';
import Tooltip from '../../src/components/Tooltip';

interface ProfileData {
  display_name: string;
  email: string;
  xp: number;
  rank: number;
  total_players: number;
  trees_found: number;
  level: number;
  is_max_level: boolean;
  xp_into_level: number;
  xp_for_level: number;
  progress: number;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
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
      <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.heading}>👤 Profile</Text>
        <View style={styles.avatarSection}>
          <SkeletonBox width={140} height={140} borderRadius={70} style={{ marginBottom: 12 }} />
          <SkeletonBox width={160} height={24} borderRadius={6} style={{ marginBottom: 8 }} />
          <SkeletonBox width={200} height={14} borderRadius={6} />
        </View>
        <Card style={styles.statCard}>
          <SkeletonBox width={90} height={28} borderRadius={99} style={{ marginBottom: 8 }} />
          <SkeletonBox width={160} height={14} borderRadius={6} />
        </Card>
        <Card style={styles.statCard}>
          <SkeletonBox width="100%" height={12} borderRadius={6} />
          <SkeletonBox width={180} height={12} borderRadius={6} style={{ marginTop: 8 }} />
        </Card>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <Text style={styles.heading}>👤 Profile</Text>

      {profile && (
        <>
          <View style={styles.avatarSection}>
            <Image source={LEVEL_AVATARS[profile.level]} style={styles.avatar} />
            <Text style={styles.name}>{profile.display_name}</Text>
            <Text style={styles.email} numberOfLines={1} ellipsizeMode="tail">{profile.email}</Text>
          </View>

          <Card style={styles.statCard}>
            <Tooltip
              rich
              label={
                profile.is_max_level
                  ? 'Max level reached'
                  : `${profile.xp_into_level} / ${profile.xp_for_level} XP to Level ${profile.level + 1}`
              }
            >
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>Level {profile.level}</Text>
              </View>
            </Tooltip>
            <Text style={styles.rank}>#{profile.rank} of {profile.total_players} players</Text>
            <View style={styles.treesFoundRow}>
              <Text style={styles.treesFoundCount}>🌳 {profile.trees_found}</Text>
              <Text style={styles.treesFoundLabel}>
                {profile.trees_found === 1 ? 'tree found' : 'trees found'}
              </Text>
            </View>
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
  treesFoundRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
  },
  treesFoundCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginRight: 6,
  },
  treesFoundLabel: {
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
