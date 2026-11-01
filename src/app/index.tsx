import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { hasSeenOnboarding } from '@/features/onboarding/onboardingStorage';

export default function Index() {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    hasSeenOnboarding().then(setSeen);
  }, []);

  // 저장소를 읽는 동안은 아무것도 그리지 않는다 (아주 짧은 순간)
  if (seen === null) return null;

  return <Redirect href={seen ? '/login' : '/onboarding'} />;
}
