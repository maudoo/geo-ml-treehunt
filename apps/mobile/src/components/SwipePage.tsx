import { useRef } from 'react';
import { Animated, PanResponder, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const VELOCITY_THRESHOLD = 0.5;

const TABS = [
  '/(tabs)/',
  '/(tabs)/quest',
  '/(tabs)/leaderboard',
  '/(tabs)/profile',
] as const;

export function SwipePage({ children, index }: { children: React.ReactNode; index: number }) {
  const router = useRouter();
  const translateX = useRef(new Animated.Value(0)).current;

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 10,
      onPanResponderMove: (_, g) => {
        const atStart = index === 0 && g.dx > 0;
        const atEnd = index === TABS.length - 1 && g.dx < 0;
        if (atStart || atEnd) {
          // rubber-band: resist at edges
          translateX.setValue(g.dx * 0.2);
        } else {
          translateX.setValue(g.dx);
        }
      },
      onPanResponderRelease: (_, g) => {
        const isSwipeLeft = g.dx < -SWIPE_THRESHOLD || g.vx < -VELOCITY_THRESHOLD;
        const isSwipeRight = g.dx > SWIPE_THRESHOLD || g.vx > VELOCITY_THRESHOLD;
        const nextIndex = isSwipeLeft ? index + 1 : isSwipeRight ? index - 1 : null;

        if (nextIndex !== null && nextIndex >= 0 && nextIndex < TABS.length) {
          translateX.setValue(0);
          router.navigate(TABS[nextIndex] as any);
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 60,
            friction: 10,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={{ flex: 1, transform: [{ translateX }] }}
      {...pan.panHandlers}
    >
      {children}
    </Animated.View>
  );
}
