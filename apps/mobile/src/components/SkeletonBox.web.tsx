import { useRef, useEffect } from 'react';
import { Animated, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import { colors } from '../lib/theme';

interface SkeletonBoxProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export default function SkeletonBox({ width = '100%', height = 16, borderRadius = 6, style }: SkeletonBoxProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    ).start();
  }, [anim]);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.cardBorder, colors.cardBg],
  });

  return <Animated.View style={[{ width, height, borderRadius, backgroundColor }, style]} />;
}
