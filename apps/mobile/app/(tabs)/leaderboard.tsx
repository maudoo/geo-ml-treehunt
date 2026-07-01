import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import client from '../../src/api/client';
import { colors, spacing } from '../../src/lib/theme';
import SkeletonBox from '../../src/components/SkeletonBox';
import Tooltip from '../../src/components/Tooltip';

interface LeaderboardPlayer {
  display_name: string;
  xp: number;
}

// Top-3 get a colored medal badge; everyone else a plain rank number.
const MEDALS: Record<number, { emoji: string; bg: string }> = {
  0: { emoji: '🥇', bg: colors.medalGold },
  1: { emoji: '🥈', bg: colors.medalSilver },
  2: { emoji: '🥉', bg: colors.medalBronze },
};

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchLeaderboard = async () => {
        try {
          const response = await client.get('/quests/leaderboard');
          setPlayers(response.data);
        } catch {
          console.error('Failed to fetch leaderboard');
        } finally {
          setIsLoading(false);
        }
      };
      fetchLeaderboard();
    }, [])
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.heading}>🏆 Leaderboard</Text>
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={i} style={styles.row}>
            <SkeletonBox width={28} height={18} style={{ width: 40 }} />
            <SkeletonBox width={140} height={18} style={{ flex: 1, marginRight: spacing.md }} />
            <SkeletonBox width={56} height={18} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <Text style={styles.heading}>🏆 Leaderboard</Text>
      <FlatList
        data={players}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => {
          const medal = MEDALS[index];
          return (
          <View style={[styles.row, medal && styles.topRow]}>
            {medal ? (
              <View style={[styles.medal, { backgroundColor: medal.bg }]}>
                <Text style={styles.medalEmoji}>{medal.emoji}</Text>
              </View>
            ) : (
              <Text style={styles.rank}>#{index + 1}</Text>
            )}
            <Text style={[styles.name, medal && styles.topName]}>{item.display_name}</Text>
            <Tooltip label={`${item.xp.toLocaleString()} experience points`}>
              <Text style={styles.xp}>{item.xp} XP</Text>
            </Tooltip>
          </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  separator: {
    height: 1,
    backgroundColor: colors.divider,
  },
  topRow: {
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    width: 40,
  },
  medal: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  medalEmoji: {
    fontSize: 20,
  },
  topName: {
    fontWeight: '700',
  },
  name: {
    flex: 1,
    fontSize: 16,
    color: colors.primaryDark,
  },
  xp: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});