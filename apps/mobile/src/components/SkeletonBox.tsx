import { Platform, View, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import { colors } from '../lib/theme';

interface SkeletonBoxProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

// Web: static placeholder — reanimated imports makeMutable at module load which
// calls requestAnimationFrame before the browser runtime is ready.
if (Platform.OS !== 'web') {
  const Reanimated = require('react-native-reanimated');
  var progress = Reanimated.makeMutable(0);
  progress.value = Reanimated.withRepeat(
    Reanimated.withTiming(1, { duration: 900, easing: Reanimated.Easing.inOut(Reanimated.Easing.ease) }),
    -1,
    true
  );
}

export default function SkeletonBox({
  width = '100%',
  height = 16,
  borderRadius = 6,
  style,
}: SkeletonBoxProps) {
  if (Platform.OS === 'web') {
    return <View style={[{ width, height, borderRadius, backgroundColor: colors.cardBorder }, style]} />;
  }

  const Reanimated = require('react-native-reanimated');
  const animatedStyle = Reanimated.useAnimatedStyle(() => ({
    backgroundColor: Reanimated.interpolateColor(
      progress.value,
      [0, 1],
      [colors.cardBorder, colors.cardBg]
    ),
  }));

  return (
    <Reanimated.default.View style={[{ width, height, borderRadius }, animatedStyle, style]} />
  );
}
