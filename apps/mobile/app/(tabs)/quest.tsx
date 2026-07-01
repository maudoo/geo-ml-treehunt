import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useQuestStore, { Quest } from '../../src/store/questStore';
import { colors, spacing, rarityMeta } from '../../src/lib/theme';
import SkeletonBox from '../../src/components/SkeletonBox';
import Tooltip from '../../src/components/Tooltip';

export default function QuestScreen() {
  const insets = useSafeAreaInsets();
  const { allQuests, isLoading, fetchAllQuests } = useQuestStore();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchAllQuests();
    }, [])
  );

  const handlePress = (quest: Quest) => {
    if (quest.status === 'active') {
      router.push('/find-tree');
    } else {
      router.push({ pathname: '/quest-detail', params: { id: quest.id } });
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.heading}>My Quests</Text>
        <View style={styles.list}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardHeader}>
                <SkeletonBox width={160} height={18} borderRadius={6} />
                <SkeletonBox width={64} height={24} borderRadius={20} />
              </View>
              <SkeletonBox width={120} height={13} borderRadius={6} style={{ marginTop: 6, marginBottom: 6 }} />
              <SkeletonBox width={80} height={12} borderRadius={6} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <Text style={styles.heading}>My Quests</Text>
      {allQuests.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No quests yet</Text>
          <Text style={styles.emptySubtext}>Head to Home to get your first quest</Text>
        </View>
      ) : (
        <FlatList
          data={allQuests}
          keyExtractor={(q) => q.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
              <View style={styles.cardHeader}>
                <Text style={styles.treeName}>{item.tree.common_name}</Text>
                <Tooltip label={badgeHint(item.status)}>
                  <View style={[styles.badge, badgeStyle(item.status)]}>
                    <Text style={styles.badgeText}>{badgeLabel(item.status)}</Text>
                  </View>
                </Tooltip>
              </View>
              <Text style={styles.treeScientific}>{item.tree.scientific_name}</Text>
              <View style={styles.rarityRow}>
                <View style={[styles.rarityDot, { backgroundColor: rarityMeta[item.tree.rarity].color }]} />
                <Text style={[styles.rarityLabel, { color: rarityMeta[item.tree.rarity].color }]}>
                  {rarityMeta[item.tree.rarity].label}
                </Text>
              </View>
              <Text style={styles.meta}>Quest #{allQuests.length - index}</Text>
              {item.status === 'completed' && (
                <Text style={styles.meta}>+{item.points_awarded} XP</Text>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

function badgeLabel(status: string) {
  if (status === 'active') return 'Active';
  if (status === 'expired') return 'Expired';
  if (status === 'cancelled') return 'Cancelled';
  return 'Done';
}

function badgeHint(status: string) {
  if (status === 'active') return 'In progress — go find this tree before it expires';
  if (status === 'expired') return 'The timer ran out before this tree was found';
  if (status === 'cancelled') return 'You cancelled this quest; the tree went back into the pool';
  return 'Completed — you found this tree and earned XP';
}

function badgeStyle(status: string) {
  if (status === 'active') return styles.badgeActive;
  if (status === 'expired') return styles.badgeExpired;
  if (status === 'cancelled') return styles.badgeCancelled;
  return styles.badgeDone;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryDark,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSubtle,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  treeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
    flex: 1,
    marginRight: 8,
  },
  treeScientific: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.textMuted,
    marginBottom: 6,
  },
  meta: {
    fontSize: 12,
    color: colors.textFaint,
  },
  rarityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rarityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  rarityLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeActive: {
    backgroundColor: colors.primary,
  },
  badgeDone: {
    backgroundColor: colors.disabled,
  },
  badgeExpired: {
    backgroundColor: colors.warning,
  },
  badgeCancelled: {
    backgroundColor: colors.disabled,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
});
