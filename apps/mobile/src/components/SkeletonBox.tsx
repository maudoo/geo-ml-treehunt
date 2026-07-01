import { StyleProp, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  makeMutable,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../lib/theme';

// One shared progress value, created once at module load and reused by every
// SkeletonBox instance — not one animation per box. The repeat loop is kicked
// off a single time here. ponytail: module-singleton shimmer, intentional.
const progress = makeMutable(0);
progress.value = withRepeat(
  withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
  -1,
  true
);

interface SkeletonBoxProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export default function SkeletonBox({
  width = '100%',
  height = 16,
  borderRadius = 6,
  style,
}: SkeletonBoxProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.cardBorder, colors.cardBg]
    ),
  }));

  return (
    <Animated.View style={[{ width, height, borderRadius }, animatedStyle, style]} />
  );
}
