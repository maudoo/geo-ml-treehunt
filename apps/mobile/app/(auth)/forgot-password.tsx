import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/lib/theme';
import PrimaryButton from '../../src/components/PrimaryButton';
import client from '../../src/api/client';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email) { Alert.alert('Error', 'Enter your email'); return; }
    setLoading(true);
    try {
      await client.post('/auth/forgot-password', { email });
      Alert.alert(
        'Reset code sent',
        `If ${email} has an account, a reset code is on its way. Check your inbox and spam folder, then enter the code on the next screen.`,
        [{ text: 'Enter code', onPress: () => router.push('/(auth)/reset-password' as any) }]
      );
    } catch (err: any) {
      const msg = err?.response
        ? 'The server had a problem sending your email. Please try again in a moment.'
        : "Can't reach the server. Check your internet connection and try again.";
      Alert.alert("Couldn't send reset code", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your email and we'll send you a reset code.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.placeholder}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <PrimaryButton title="Send Reset Code" onPress={handleSubmit} loading={loading} style={{ marginBottom: 16 }} />

      <Text style={styles.link} onPress={() => router.back()}>Back to Login</Text>
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
