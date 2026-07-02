import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import useAuthStore from '../../src/store/authStore';
import { colors } from '../../src/lib/theme';
import PrimaryButton from '../../src/components/PrimaryButton';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleRegister = async () => {
  if (!email || !displayName || !password) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }
  try {
    const success = await register(email, displayName, password);
    if (success) {
      router.replace('/(tabs)' as any);
    } else {
      Alert.alert('Failed', 'register() returned false');
    }
  } catch (error: any) {
    Alert.alert('Exception', error?.message || 'no message');
  }
};

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Join AlphaHawk 🌳</Text>
      <Text style={styles.subtitle}>Create your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Display Name"
        value={displayName}
        placeholderTextColor={colors.placeholder}

        onChangeText={setDisplayName}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.placeholder}

        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        placeholderTextColor={colors.placeholder}
        onChangeText={setPassword}
        secureTextEntry
      />

      <PrimaryButton title="Create Account" onPress={handleRegister} loading={isLoading} style={{ marginBottom: 16 }} />

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.white },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: colors.primary,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    color: colors.textSubtle,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  link: {
    textAlign: 'center',
    color: colors.primary,
    fontSize: 14,
  },
});