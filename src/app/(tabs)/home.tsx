import { router } from 'expo-router';

import { HomeScreen } from '@/features/subscription/screens/HomeScreen';

export default function HomeRoute() {
  return <HomeScreen onPressComparison={() => router.push('/usage')} />;
}
