import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { colors } from '../../src/lib/theme';

const { Navigator } = createMaterialTopTabNavigator();
const Tabs = withLayoutContext(Navigator);

export default function TabsLayout() {
  return (
    <Tabs
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.placeholder,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          height: 60,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          textTransform: 'none',
          marginTop: 0,
        },
        tabBarIndicatorStyle: {
          backgroundColor: colors.primary,
          height: 2,
          top: 0,
        },
        tabBarPressColor: 'transparent',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="quest" options={{ title: 'Quest' }} />
      <Tabs.Screen name="leaderboard" options={{ title: 'Leaderboard' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
