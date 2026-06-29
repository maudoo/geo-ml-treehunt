import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import useQuestStore from '../src/store/questStore';

export default function QuestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { allQuests } = useQuestStore();

  const questIndex = allQuests.findIndex((q) => q.id === id);
  const quest = questIndex !== -1 ? allQuests[questIndex] : null;
  const questNumber = questIndex !== -1 ? allQuests.length - questIndex : null;

  if (!quest) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Quest not found</Text>
      </View>
    );
  }

  const assignedDate = new Date(quest.assigned_at).toLocaleDateString();
  const completedDate = quest.completed_at
    ? new Date(quest.completed_at).toLocaleDateString()
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.statusRow}>
        <View style={[styles.badge, quest.status === 'active' ? styles.badgeActive : styles.badgeDone]}>
          <Text style={styles.badgeText}>{quest.status === 'active' ? 'Active' : 'Completed'}</Text>
        </View>
        {quest.status === 'completed' && (
          <Text style={styles.xp}>+{quest.points_awarded} XP</Text>
        )}
      </View>

      <Text style={styles.questNumber}>Quest #{questNumber}</Text>
      <Text style={styles.treeName}>{quest.tree.common_name}</Text>
      <Text style={styles.treeScientific}>{quest.tree.scientific_name}</Text>

      <View style={styles.metaCard}>
        <Row label="Assigned" value={assignedDate} />
        {completedDate && <Row label="Completed" value={completedDate} />}
        <Row label="Coordinates" value={`${quest.tree.latitude.toFixed(5)}, ${quest.tree.longitude.toFixed(5)}`} />
      </View>

      {quest.photo_url ? (
        <View>
          <Text style={styles.sectionLabel}>Submitted Photo</Text>
          <Image source={{ uri: quest.photo_url }} style={styles.photo} />
        </View>
      ) : null}
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeActive: {
    backgroundColor: '#2d6a4f',
  },
  badgeDone: {
    backgroundColor: '#adb5bd',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  xp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d6a4f',
  },
  questNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  treeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1b4332',
    marginBottom: 4,
  },
  treeScientific: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555',
    marginBottom: 24,
  },
  metaCard: {
    backgroundColor: '#f0faf4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#b7e4c7',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d8f3dc',
  },
  rowLabel: {
    fontSize: 14,
    color: '#888',
  },
  rowValue: {
    fontSize: 14,
    color: '#1b4332',
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  photo: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
});
