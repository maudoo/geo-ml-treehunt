import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import useQuestStore, { Quest } from '../../src/store/questStore';

export default function QuestScreen() {
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
                <View style={[styles.badge, badgeStyle(item.status)]}>
                  <Text style={styles.badgeText}>{badgeLabel(item.status)}</Text>
                </View>
              </View>
              <Text style={styles.treeScientific}>{item.tree.scientific_name}</Text>
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

function badgeStyle(status: string) {
  if (status === 'active') return styles.badgeActive;
  if (status === 'expired') return styles.badgeExpired;
  if (status === 'cancelled') return styles.badgeCancelled;
  return styles.badgeDone;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
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
    color: '#1b4332',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b4332',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#f0faf4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#b7e4c7',
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
    color: '#1b4332',
    flex: 1,
    marginRight: 8,
  },
  treeScientific: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#555',
    marginBottom: 6,
  },
  meta: {
    fontSize: 12,
    color: '#888',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeActive: {
    backgroundColor: '#2d6a4f',
  },
  badgeDone: {
    backgroundColor: '#adb5bd',
  },
  badgeExpired: {
    backgroundColor: '#ff9800',
  },
  badgeCancelled: {
    backgroundColor: '#adb5bd',
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
});
