import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import useAuthStore from '../../src/store/authStore';
import { colors } from '../../src/lib/theme';
import PrimaryButton from '../../src/components/PrimaryButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const success = await login(email, password);
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'Invalid email or password');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AlphaHawk 🌳</Text>
      <Text style={styles.subtitle}>Campus Tree Hunt</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        placeholderTextColor={colors.placeholder}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.placeholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <PrimaryButton title="Login" onPress={handleLogin} loading={isLoading} style={{ marginBottom: 16 }} />

      <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.white,
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