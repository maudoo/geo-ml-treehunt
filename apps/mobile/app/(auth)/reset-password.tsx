import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/lib/theme';
import PrimaryButton from '../../src/components/PrimaryButton';
import client from '../../src/api/client';

export default function ResetPasswordScreen() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!token || !newPassword) { Alert.alert('Error', 'Fill in all fields'); return; }
    if (newPassword.length < 8) { Alert.alert('Error', 'Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await client.post('/auth/reset-password', { token, new_password: newPassword });
      Alert.alert('Success', 'Password reset. Please log in.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login' as any) }
      ]);
    } catch {
      Alert.alert('Error', 'Invalid or expired reset code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter the code from your email and your new password.</Text>

      <TextInput
        style={styles.input}
        placeholder="Reset code"
        placeholderTextColor={colors.placeholder}
        value={token}
        onChangeText={setToken}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="New password"
        placeholderTextColor={colors.placeholder}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <PrimaryButton title="Reset Password" onPress={handleSubmit} loading={loading} style={{ marginBottom: 16 }} />

      <Text style={styles.link} onPress={() => router.replace('/(auth)/login' as any)}>Back to Login</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.white },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.primaryDark, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textSubtle, marginBottom: 32 },
  input: { borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 16 },
  link: { textAlign: 'center', color: colors.primary, fontSize: 14 },
});
