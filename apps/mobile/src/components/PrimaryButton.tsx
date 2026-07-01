import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../lib/theme';

type Variant = 'primary' | 'secondary' | 'danger';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
};

export default function PrimaryButton({ title, onPress, loading, disabled, variant = 'primary', style }: Props) {
  const isDisabled = disabled || loading;
  const spinnerColor = variant === 'primary' ? colors.white : colors.textMuted;
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { padding: 16, borderRadius: 8, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borderLight },
  danger: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.danger },
  text: { fontSize: 16, fontWeight: '600' },
  primaryText: { color: colors.white },
  secondaryText: { color: colors.textMuted },
  dangerText: { color: colors.danger },
});
