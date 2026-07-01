import { View, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import { colors } from '../lib/theme';

interface SkeletonBoxProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export default function SkeletonBox({ width = '100%', height = 16, borderRadius = 6, style }: SkeletonBoxProps) {
  return <View style={[{ width, height, borderRadius, backgroundColor: colors.cardBorder }, style]} />;
}
