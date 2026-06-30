import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../lib/theme';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function PrimaryButton({ title, onPress, loading, disabled, style }: Props) {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} disabled={disabled || loading}>
      {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: colors.primary, padding: 16, borderRadius: 8, alignItems: 'center' },
  text: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
