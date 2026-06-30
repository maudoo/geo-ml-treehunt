import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import useQuestStore from '../../src/store/questStore';
import client from '../../src/api/client';
import { colors } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';
import Card from '../../src/components/Card';

export default function CameraScreen() {
  const { activeQuest, submitQuest, fetchAllQuests, pendingPhoto, setPendingPhoto } = useQuestStore();
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!pendingPhoto || !activeQuest) return;
    setUploading(true);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setUploading(false);
      Alert.alert('Permission needed', 'Location access is required to verify you are at the tree.');
      return;
    }

    let photoUrl: string;
    try {
      const { data } = await client.post('/quests/upload-url', {});
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', data.upload_url);
        xhr.setRequestHeader('Content-Type', 'image/jpeg');
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`GCS ${xhr.status}`)));
        xhr.onerror = reject;
        xhr.send({ uri: pendingPhoto, type: 'image/jpeg', name: 'photo.jpg' } as any);
      });
      photoUrl = data.photo_url;
    } catch (e: any) {
      setUploading(false);
      console.log('UPLOAD ERROR:', e?.response?.data?.detail ?? e?.message ?? String(e), e);
      Alert.alert('Upload failed', 'Could not upload photo. Try again.');
      return;
    }

    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const result = await submitQuest(
      activeQuest.id,
      photoUrl,
      location.coords.latitude,
      location.coords.longitude,
    );

    setUploading(false);

    if (result === 'success') {
      await fetchAllQuests();
      Alert.alert('Quest Complete!', 'You earned 100 XP!');
      router.push('/(tabs)/quest');
    } else if (result === 'too_far') {
      Alert.alert('Not close enough', 'You need to be closer to the tree to submit.');
    } else if (result === 'expired') {
      Alert.alert('Quest expired', 'Your time ran out. Dismiss the quest and get a new one.');
      router.replace('/find-tree');
    } else {
      Alert.alert('Error', 'Could not submit quest. Try again.');
    }
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
      <Text style={styles.heading}>Submit Photo</Text>

      <Card style={styles.treeCard}>
        <Text style={styles.treeLabel}>Current Quest</Text>
        <Text style={styles.treeName}>{activeQuest.tree.common_name}</Text>
        <Text style={styles.treeScientific}>{activeQuest.tree.scientific_name}</Text>
      </Card>

      {pendingPhoto ? (
        <View>
          <Image source={{ uri: pendingPhoto }} style={styles.preview} />
          <PrimaryButton title="Submit Photo ✓" onPress={handleSubmit} loading={uploading} style={{ marginBottom: 12 }} />
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => { setPendingPhoto(null); router.back(); }}
          >
            <Text style={styles.secondaryText}>Retake Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No photo yet</Text>
          <Text style={styles.emptySubtext}>Go back and tap Take Photo</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
    padding: 24,
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
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 24,
  },
  treeCard: {
    padding: 20,
    marginBottom: 24,
  },
  treeLabel: {
    fontSize: 12,
    color: colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  treeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 2,
  },
  treeScientific: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.textMuted,
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  secondaryButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
