import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { ApiError } from '@/api/client';

import { getSubscriptions } from '../api/subscriptionApi';
import type { Subscription } from '../types';
import { toSubscription } from '../utils/toSubscription';

/**
 * 로그인한 회원의 구독 목록 (서버 DB).
 * 화면에 들어올 때마다 다시 불러온다 (구독 추가 화면에서 돌아오면 바로 반영되도록).
 * subscriptions 는 처음 불러오기 전에는 null, DB 에 없으면 빈 배열.
 */
export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dtos = await getSubscriptions();
      setSubscriptions(dtos.map(toSubscription));
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError('UNKNOWN', '구독 목록을 불러오지 못했어요.', 0));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return { subscriptions, loading, error, reload: load };
}

/** 지금 이용 중인 구독만 (해지·일시정지 제외). 캘린더·통계·사용량 점검에서 쓴다 */
export function useActiveSubscriptions() {
  const { subscriptions, ...rest } = useSubscriptions();
  const active = useMemo(
    () => (subscriptions ?? []).filter((s) => s.status === 'ACTIVE' || s.status === 'TRIAL'),
    [subscriptions],
  );
  return { subscriptions: active, loaded: subscriptions !== null, ...rest };
}
