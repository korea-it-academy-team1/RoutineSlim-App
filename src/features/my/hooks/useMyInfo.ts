import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { ApiError } from '@/api/client';

import { getMyInfo, type MyInfoDto } from '../api/userApi';

/**
 * 내 정보 불러오기.
 * 화면에 들어올 때마다 다시 불러온다 (프로필·알림 수정 화면에서 돌아오면 바로 반영되도록).
 */
export function useMyInfo() {
  const [info, setInfo] = useState<MyInfoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setInfo(await getMyInfo());
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError('UNKNOWN', '내 정보를 불러오지 못했어요.', 0));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return { info, loading, error, reload: load };
}
