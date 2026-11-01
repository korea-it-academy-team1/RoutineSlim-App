import { Tabs } from 'expo-router';
import type { FC } from 'react';
import type { ColorValue } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import CalendarIcon from '@/assets/icons/tabs/calendar.svg';
import CommunityIcon from '@/assets/icons/tabs/community.svg';
import MyIcon from '@/assets/icons/tabs/my.svg';
import StatsIcon from '@/assets/icons/tabs/stats.svg';
import SubscriptionsIcon from '@/assets/icons/tabs/subscriptions.svg';
import { BottomTabBar } from '@/components/common/BottomTabBar';

const tabIcon =
  (Icon: FC<SvgProps>) =>
  ({ color, size }: { color: ColorValue; size: number }) => <Icon width={size} height={size} color={color} />;

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <BottomTabBar {...props} />}>
      <Tabs.Screen name="home" options={{ title: '구독 목록', tabBarIcon: tabIcon(SubscriptionsIcon) }} />
      <Tabs.Screen name="calendar" options={{ title: '캘린더', tabBarIcon: tabIcon(CalendarIcon) }} />
      <Tabs.Screen name="stats" options={{ title: '통계', tabBarIcon: tabIcon(StatsIcon) }} />
      <Tabs.Screen name="community" options={{ title: '커뮤니티', tabBarIcon: tabIcon(CommunityIcon) }} />
      <Tabs.Screen name="my" options={{ title: '마이', tabBarIcon: tabIcon(MyIcon) }} />
    </Tabs>
  );
}
