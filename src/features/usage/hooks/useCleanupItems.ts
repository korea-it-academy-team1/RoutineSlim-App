import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { ApiError } from '@/api/client';
import { changeSubscriptionStatus } from '@/features/subscription/api/subscriptionApi';

import { deleteCleanupItem, getCleanupItems, type CleanupItemDto } from '../api/cleanupApi';

/**
 * 정리 목록 (서버 DB). 화면에 들어올 때마다 다시 불러온다. items 는 처음 불러오기 전에는 null.
 * - markCanceled: 서비스에서 직접 해지한 뒤 누른다 → 구독 상태를 CANCELED 로 바꾸면 서버 목록에서 빠진다
 * - remove: 정리하지 않기로 하고 목록에서 뺀다
 */
export function useCleanupItems() {
  const [items, setItems] = useState<CleanupItemDto[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [actionError, setActionError] = useState<string>();
  /** 처리 중인 구독 id (버튼 막기용) */
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems(await getCleanupItems());
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError('UNKNOWN', '정리 목록을 불러오지 못했어요.', 0));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const run = async (subscriptionId: string, task: () => Promise<unknown>) => {
    setPendingId(subscriptionId);
    setActionError(undefined);
    try {
      await task();
      setItems((current) => (current ?? []).filter((item) => item.subscriptionId !== subscriptionId));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : '처리하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setPendingId(null);
    }
  };

  const markCanceled = (subscriptionId: string) =>
    run(subscriptionId, () => changeSubscriptionStatus(subscriptionId, 'CANCELED'));
  const remove = (subscriptionId: string) => run(subscriptionId, () => deleteCleanupItem(subscriptionId));

  return { items, error, actionError, pendingId, reload: load, markCanceled, remove };
}
