import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import useQuestStore from '../../src/store/questStore';
import { useCountdown } from '../../src/hooks/useCountdown';
import { colors } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';
import Card from '../../src/components/Card';
import TreeMap from '../../src/components/TreeMap';

export default function FindTreeScreen() {
  const { activeQuest, setPendingPhoto, dismissQuest, cancelQuest } = useQuestStore();
  const router = useRouter();
  const { display, expired } = useCountdown(activeQuest?.expires_at ?? null);

  const handleTakePhoto = async () => {
    if (expired) return;
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera access is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPendingPhoto(result.assets[0].uri);
      router.push('/camera');
    }
  };

  const handleDismiss = async () => {
    if (!activeQuest) return;
    const ok = await dismissQuest(activeQuest.id);
    if (ok) router.replace('/(tabs)/');
    else Alert.alert('Error', 'Could not dismiss quest. Try again.');
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
            if (ok) router.replace('/(tabs)/');
            else Alert.alert('Error', 'Could not cancel quest. Try again.');
          },
        },
      ]
    );
  };

  if (!activeQuest) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No active quest</Text>
        <Text style={styles.emptySubtext}>Go to Home to get assigned a tree</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <Text style={styles.heading}>Find This Tree</Text>
        {display && (
          <View style={[styles.timer, expired && styles.timerExpired]}>
            <Text style={[styles.timerText, expired && styles.timerTextExpired]}>
              {expired ? 'Expired' : display}
            </Text>
          </View>
        )}
      </View>

      <Card style={styles.treeCard}>
        <Text style={styles.treeName}>{activeQuest.tree.common_name}</Text>
        <Text style={styles.treeScientific}>{activeQuest.tree.scientific_name}</Text>
        <TreeMap
          style={styles.map}
          latitude={activeQuest.tree.latitude}
          longitude={activeQuest.tree.longitude}
          title={activeQuest.tree.common_name}
          description={activeQuest.tree.scientific_name}
        />
      </Card>

      {expired ? (
        <View>
          <View style={styles.expiredBanner}>
            <Text style={styles.expiredText}>This quest has expired</Text>
          </View>
          <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
            <Text style={styles.dismissText}>Dismiss Quest</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <PrimaryButton title="📸 Take Photo" onPress={handleTakePhoto} style={{ marginBottom: 12 }} />
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel Quest</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: colors.primaryDark, marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: colors.textSubtle, textAlign: 'center' },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  heading: { fontSize: 24, fontWeight: 'bold', color: colors.primaryDark },
  timer: {
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  timerExpired: {
    backgroundColor: colors.warningBgAlt,
    borderColor: colors.warning,
  },
  timerText: { fontSize: 16, fontWeight: 'bold', color: colors.primary, fontVariant: ['tabular-nums'] },
  timerTextExpired: { color: colors.warning },
  treeCard: {
    padding: 20,
    marginBottom: 24,
  },
  treeName: { fontSize: 24, fontWeight: 'bold', color: colors.primaryDark, marginBottom: 4 },
  treeScientific: { fontSize: 16, fontStyle: 'italic', color: colors.textMuted, marginBottom: 12 },
  map: { width: '100%', height: 220, borderRadius: 12, marginTop: 4 },
  cancelButton: { padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight },
  cancelText: { color: colors.placeholder, fontSize: 16, fontWeight: '600' },
  expiredBanner: {
    backgroundColor: colors.warningBgAlt,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  expiredText: { fontSize: 16, color: colors.warning, fontWeight: '600' },
  dismissButton: {
    borderWidth: 1,
    borderColor: colors.warning,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  dismissText: { color: colors.warning, fontSize: 16, fontWeight: '600' },
});
