import { useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useQuestStore from '../../src/store/questStore';
import SkeletonBox from '../../src/components/SkeletonBox';
import Tooltip from '../../src/components/Tooltip';
import useAuthStore from '../../src/store/authStore';
import { useCountdown } from '../../src/hooks/useCountdown';
import { colors, spacing } from '../../src/lib/theme';
import PrimaryButton from '../../src/components/PrimaryButton';
import Card from '../../src/components/Card';
import { confirmDestructive } from '../../src/lib/confirm';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
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

  const handleCancel = async () => {
    if (!activeQuest) return;
    const confirmed = await confirmDestructive(
      'Cancel Quest',
      'Are you sure? This tree will go back into the pool.',
      'Cancel Quest',
      'Keep Quest'
    );
    if (!confirmed) return;
    const ok = await cancelQuest(activeQuest.id);
    if (!ok) Alert.alert('Error', 'Could not cancel quest. Try again.');
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login' as any);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.header}>
          <Text style={styles.title}>AlphaHawk 🌳</Text>
        </View>
        <Card>
          <View style={styles.questTitleRow}>
            <SkeletonBox width={90} height={12} borderRadius={6} />
            <SkeletonBox width={60} height={14} borderRadius={6} />
          </View>
          <SkeletonBox width="80%" height={28} borderRadius={6} style={{ marginBottom: 8 }} />
          <SkeletonBox width="60%" height={16} borderRadius={6} style={{ marginBottom: 24 }} />
          <SkeletonBox width="100%" height={48} borderRadius={8} />
        </Card>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Text style={styles.title}>AlphaHawk 🌳</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      {activeQuest ? (
        <Card style={expired && styles.questCardExpired}>
          <View style={styles.questTitleRow}>
            <Text style={[styles.questTitle, expired && styles.questTitleExpired]}>
              {expired ? 'Quest Expired' : 'Active Quest'}
            </Text>
            {display && (
              <Tooltip label={expired ? 'This quest has expired' : 'Time left to find this tree'}>
                <Text style={[styles.timer, expired && styles.timerExpired]}>
                  {expired ? 'Expired' : display}
                </Text>
              </Tooltip>
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
              <PrimaryButton title="Go Find It →" onPress={() => router.push('/find-tree')} style={{ marginBottom: 12 }} />
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelText}>Cancel Quest</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No active quest</Text>
          <Text style={styles.emptySubtext}>Ready to find a tree?</Text>
          <PrimaryButton title="Find a Quest 🌿" onPress={handleAssign} style={{ marginBottom: 12 }} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.primary },
  logout: { color: colors.placeholder, fontSize: 14 },
  questCardExpired: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warning,
  },
  questTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  questTitle: { fontSize: 12, fontWeight: '600', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  questTitleExpired: { color: colors.warning },
  timer: { fontSize: 14, fontWeight: 'bold', color: colors.primary, fontVariant: ['tabular-nums'] },
  timerExpired: { color: colors.warning },
  treeName: { fontSize: 28, fontWeight: 'bold', color: colors.primaryDark, marginBottom: 4 },
  treeScientific: { fontSize: 16, color: colors.textSubtle, fontStyle: 'italic', marginBottom: 24 },
  cancelButton: { padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight },
  cancelText: { color: colors.placeholder, fontSize: 16, fontWeight: '600' },
  dismissButton: { borderWidth: 1, borderColor: colors.warning, padding: 16, borderRadius: 8, alignItems: 'center' },
  dismissText: { color: colors.warning, fontSize: 16, fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 24, fontWeight: 'bold', color: colors.primaryDark, marginBottom: 8 },
  emptySubtext: { fontSize: 16, color: colors.textSubtle, marginBottom: 32 },
});
