import { useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import useQuestStore from '../../src/store/questStore';
import useAuthStore from '../../src/store/authStore';
import { useCountdown } from '../../src/hooks/useCountdown';

export default function HomeScreen() {
  const { activeQuest, isLoading, fetchQuest, assignQuest, dismissQuest, cancelQuest } = useQuestStore();
  const { logout } = useAuthStore();
  const router = useRouter();
  const { display, expired } = useCountdown(activeQuest?.expires_at ?? null);

  useFocusEffect(
    useCallback(() => {
      fetchQuest();
    }, [])
  );

  const handleAssign = async () => {
    const success = await assignQuest();
    if (success) {
      router.push('/find-tree');
    } else {
      Alert.alert('Error', 'Could not assign a quest. You may have completed all trees!');
    }
  };

  const handleDismiss = async () => {
    if (!activeQuest) return;
    const ok = await dismissQuest(activeQuest.id);
    if (!ok) Alert.alert('Error', 'Could not dismiss quest. Try again.');
  };

  const handleCancel = () => {
    if (!activeQuest) return;
    Alert.alert(
      'Cancel Quest',
      'Are you sure? This tree will go back into the pool.',
      [
        { text: 'Keep Quest', style: 'cancel' },
        {
          text: 'Cancel Quest',
          style: 'destructive',
          onPress: async () => {
            const ok = await cancelQuest(activeQuest.id);
            if (!ok) Alert.alert('Error', 'Could not cancel quest. Try again.');
          },
        },
      ]
    );
  };

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
      <View style={styles.header}>
        <Text style={styles.title}>AlphaHawk 🌳</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      {activeQuest ? (
        <View style={[styles.questCard, expired && styles.questCardExpired]}>
          <View style={styles.questTitleRow}>
            <Text style={[styles.questTitle, expired && styles.questTitleExpired]}>
              {expired ? 'Quest Expired' : 'Active Quest'}
            </Text>
            {display && (
              <Text style={[styles.timer, expired && styles.timerExpired]}>
                {expired ? 'Expired' : display}
              </Text>
            )}
          </View>
          <Text style={styles.treeName}>{activeQuest.tree.common_name}</Text>
          <Text style={styles.treeScientific}>{activeQuest.tree.scientific_name}</Text>

          {expired ? (
            <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
              <Text style={styles.dismissText}>Dismiss Quest</Text>
            </TouchableOpacity>
          ) : (
            <View>
              <TouchableOpacity style={styles.button} onPress={() => router.push('/find-tree')}>
                <Text style={styles.buttonText}>Go Find It →</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelText}>Cancel Quest</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No active quest</Text>
          <Text style={styles.emptySubtext}>Ready to find a tree?</Text>
          <TouchableOpacity style={styles.button} onPress={handleAssign}>
            <Text style={styles.buttonText}>Find a Quest 🌿</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 60 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2d6a4f' },
  logout: { color: '#999', fontSize: 14 },
  questCard: {
    backgroundColor: '#f0faf4',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#b7e4c7',
  },
  questCardExpired: {
    backgroundColor: '#fff8f0',
    borderColor: '#ff9800',
  },
  questTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  questTitle: { fontSize: 12, fontWeight: '600', color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: 1 },
  questTitleExpired: { color: '#ff9800' },
  timer: { fontSize: 14, fontWeight: 'bold', color: '#2d6a4f', fontVariant: ['tabular-nums'] },
  timerExpired: { color: '#ff9800' },
  treeName: { fontSize: 28, fontWeight: 'bold', color: '#1b4332', marginBottom: 4 },
  treeScientific: { fontSize: 16, color: '#666', fontStyle: 'italic', marginBottom: 24 },
  button: { backgroundColor: '#2d6a4f', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  cancelButton: { padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ccc' },
  cancelText: { color: '#999', fontSize: 16, fontWeight: '600' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  dismissButton: { borderWidth: 1, borderColor: '#ff9800', padding: 16, borderRadius: 8, alignItems: 'center' },
  dismissText: { color: '#ff9800', fontSize: 16, fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 24, fontWeight: 'bold', color: '#1b4332', marginBottom: 8 },
  emptySubtext: { fontSize: 16, color: '#666', marginBottom: 32 },
});
