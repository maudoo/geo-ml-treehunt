import Animated, {
  makeMutable,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { StyleProp, ViewStyle, DimensionValue } from 'react-native';
import { colors } from '../lib/theme';

interface SkeletonBoxProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

// ponytail: module-singleton shimmer — one shared animation, not one per box
const progress = makeMutable(0);
progress.value = withRepeat(
  withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
  -1,
  true
);

export default function SkeletonBox({ width = '100%', height = 16, borderRadius = 6, style }: SkeletonBoxProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.cardBorder, colors.cardBg]),
  }));
  return <Animated.View style={[{ width, height, borderRadius }, animatedStyle, style]} />;
}
