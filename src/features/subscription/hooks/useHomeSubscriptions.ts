/*
 * ============================================================================
 * [홈 구현 6/8] 홈 데이터 불러오기 훅
 * ============================================================================
 * 서버에서 구독 목록을 받아(1번) 화면용으로 바꾸고(3번) 홈 숫자를 계산해(5번) 화면에 넘긴다.
 * 로딩·오류 상태도 여기서 들고 있는다. 화면(7번)과 라우트(8번)는 결과만 쓴다.
 *
 * ----------------------------------------------------------------------------
 * 만들 것
 * ----------------------------------------------------------------------------
 *   export function useHomeSubscriptions(): {
 *     summary: HomeSummary | null;   // 처음 불러오기 전에는 null
 *     loading: boolean;
 *     error: ApiError | null;        // ApiError 는 @/api/client
 *     reload: () => void;            // 오류 화면의 "다시 시도" 버튼, 당겨서 새로고침에 사용
 *   }
 *
 *   흐름
 *   (1) useState 로 summary, loading, error 를 둔다
 *   (2) load 함수 (async)
 *         setLoading(true); setError(null);
 *         const dtos = await getSubscriptions();                 // 1번
 *         const list = dtos.map(toSubscription);                 // 3번
 *         const today = 오늘 날짜 키 (toDateKey(년, 월, 일), src/utils/date.ts)
 *         setSummary(buildHomeSummary(list, today));            // 5번
 *       - catch 에서 error 를 ApiError 로 저장, finally 에서 setLoading(false)
 *   (3) 화면에 들어올 때마다 다시 불러오기
 *         useFocusEffect(useCallback(() => { load(); }, [])) — import { useFocusEffect } from 'expo-router'
 *       - 구독 추가 화면에서 돌아왔을 때 새 구독이 바로 보이도록 useEffect 대신 useFocusEffect 를 쓴다
 *
 *   참고: package.json 에 @tanstack/react-query 가 있지만 아직 아무 데서도 쓰지 않는다 (QueryClientProvider 없음).
 *         팀에서 react-query 로 통일하기로 하면 이 훅 안쪽만 useQuery 로 바꾸면 되고, 반환 모양은 그대로 둔다.
 *
 * ----------------------------------------------------------------------------
 * 확인 방법
 * ----------------------------------------------------------------------------
 *   8번까지 연결한 뒤: 홈 진입 → 잠깐 로딩 → 서버 데이터 표시.
 *   서버를 끄고 진입 → error.code === 'NETWORK_ERROR'
 */
import { useMemo } from 'react';

import { todayKey } from '@/utils/date';

import { buildHomeSummary } from '../utils/homeSummary';
import { useSubscriptions } from './useSubscriptions';

export function useHomeSubscriptions() {
  const { subscriptions, loading, error, reload } = useSubscriptions();
  const summary = useMemo(() => (subscriptions ? buildHomeSummary(subscriptions, todayKey()) : null), [subscriptions]);
  return { summary, loading, error, reload };
}
