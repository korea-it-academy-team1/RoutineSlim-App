import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { ApiError } from '@/api/client';

import { getMonthlyPayments, type PaymentDto } from '../api/paymentApi';

type Loaded = { key: string; payments: PaymentDto[] | null; error: ApiError | null };

/**
 * 고른 달의 청구 기록 (서버 DB).
 * 달을 바꾸거나 화면에 다시 들어올 때마다 불러온다. 앞선 달의 늦은 응답은 버린다.
 * enabled 가 false 면(다음 달 이후) 부르지 않고 빈 배열을 돌려준다.
 * payments 는 불러오는 중이면 null.
 */
export function useMonthlyPayments(year: number, month: number, enabled: boolean) {
  const key = `${year}-${month}`;
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [attempt, setAttempt] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      let cancelled = false;
      getMonthlyPayments(year, month)
        .then((dto) => {
          if (!cancelled) setLoaded({ key, payments: dto.payments, error: null });
        })
        .catch((e: unknown) => {
          if (cancelled) return;
          const error = e instanceof ApiError ? e : new ApiError('UNKNOWN', '결제 기록을 불러오지 못했어요.', 0);
          setLoaded({ key, payments: null, error });
        });
      return () => {
        cancelled = true;
      };
      // attempt: 다시 시도 버튼
    }, [year, month, enabled, key, attempt]),
  );

  const current = loaded?.key === key ? loaded : null;
  return {
    payments: enabled ? (current?.payments ?? null) : [],
    error: enabled ? (current?.error ?? null) : null,
    reload: () => setAttempt((n) => n + 1),
  };
}
