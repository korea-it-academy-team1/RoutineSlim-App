import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { ApiError } from '@/api/client';

import { getUsageChecks, saveUsageCheck, type UsageCheckDto, type UsageLevelDto } from '../api/usageApi';

/**
 * 사용량 체크 (서버 DB). 화면에 들어올 때마다 다시 불러온다.
 * save 는 화면을 먼저 바꾸고(낙관적 업데이트) 실패하면 되돌린다.
 * checks 는 처음 불러오기 전에는 null.
 */
export function useUsageChecks() {
  const [checks, setChecks] = useState<UsageCheckDto[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [saveError, setSaveError] = useState<string>();

  const load = useCallback(async () => {
    setError(null);
    try {
      setChecks(await getUsageChecks());
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError('UNKNOWN', '사용량 체크를 불러오지 못했어요.', 0));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const save = async (subscriptionId: string, usageLevel: UsageLevelDto, today: string) => {
    const previous = checks;
    const optimistic: UsageCheckDto = { subscriptionId, usageLevel, checkedOn: today };
    setChecks((current) => [...(current ?? []).filter((c) => c.subscriptionId !== subscriptionId), optimistic]);
    setSaveError(undefined);
    try {
      const saved = await saveUsageCheck(subscriptionId, usageLevel);
      setChecks((current) => [...(current ?? []).filter((c) => c.subscriptionId !== subscriptionId), saved]);
    } catch (e) {
      setChecks(previous);
      setSaveError(e instanceof Error ? e.message : '저장하지 못했어요.');
    }
  };

  return { checks, error, saveError, reload: load, save };
}
