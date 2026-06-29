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
import useQuestStore from '../src/store/questStore';
import { useCountdown } from '../src/hooks/useCountdown';
import MapView, { Marker } from 'react-native-maps';

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

      <View style={styles.treeCard}>
        <Text style={styles.treeName}>{activeQuest.tree.common_name}</Text>
        <Text style={styles.treeScientific}>{activeQuest.tree.scientific_name}</Text>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: activeQuest.tree.latitude,
            longitude: activeQuest.tree.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          }}
        >
          <Marker
            coordinate={{
              latitude: activeQuest.tree.latitude,
              longitude: activeQuest.tree.longitude,
            }}
            title={activeQuest.tree.common_name}
            description={activeQuest.tree.scientific_name}
          />
        </MapView>
      </View>

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
          <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
            <Text style={styles.buttonText}>📸 Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel Quest</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: '#1b4332', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#666', textAlign: 'center' },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#1b4332' },
  timer: {
    backgroundColor: '#f0faf4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#b7e4c7',
  },
  timerExpired: {
    backgroundColor: '#fff3e0',
    borderColor: '#ff9800',
  },
  timerText: { fontSize: 16, fontWeight: 'bold', color: '#2d6a4f', fontVariant: ['tabular-nums'] },
  timerTextExpired: { color: '#ff9800' },
  treeCard: {
    backgroundColor: '#f0faf4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#b7e4c7',
  },
  treeName: { fontSize: 24, fontWeight: 'bold', color: '#1b4332', marginBottom: 4 },
  treeScientific: { fontSize: 16, fontStyle: 'italic', color: '#555', marginBottom: 12 },
  map: { width: '100%', height: 220, borderRadius: 12, marginTop: 4 },
  button: { backgroundColor: '#2d6a4f', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  cancelButton: { padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ccc' },
  cancelText: { color: '#999', fontSize: 16, fontWeight: '600' },
  expiredBanner: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  expiredText: { fontSize: 16, color: '#ff9800', fontWeight: '600' },
  dismissButton: {
    borderWidth: 1,
    borderColor: '#ff9800',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  dismissText: { color: '#ff9800', fontSize: 16, fontWeight: '600' },
});
