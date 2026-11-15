/**
 * 커뮤니티 게시글 목록 훅
 * ============================================================================
 * 사용하는 곳: src/app/(tabs)/community.tsx → CommunityScreen 의 partyPosts
 *
 * ----------------------------------------------------------------------------
 * 만들 것
 * ----------------------------------------------------------------------------
 *   export function useCommunityPosts(board: CommunityBoard) {
 *     ...
 *     return { posts, error, reload };
 *   }
 *
 *   - posts  : PartyPost[] | null   불러오는 중이면 null (화면에서 로딩 표시)
 *   - error  : ApiError | null      실패하면 화면에서 "다시 시도" 표시
 *   - reload : () => void           다시 시도 버튼, 글 작성 후 새로고침
 *
 * ----------------------------------------------------------------------------
 * 구현 순서 (src/features/payment/hooks/useMonthlyPayments.ts 를 그대로 참고)
 * ----------------------------------------------------------------------------
 *   1. useFocusEffect(useCallback(...)) 안에서 getPosts(toCommunityBoardDto(board)) 호출
 *        - 탭에 다시 들어오거나 글쓰기에서 돌아오면 자동으로 새로 불러온다
 *   2. 응답을 toPartyPost 로 바꿔 state 에 저장 (utils/postMapper.ts)
 *   3. 게시판을 빠르게 바꾸면 이전 요청의 늦은 응답이 덮어쓸 수 있다
 *        → cleanup 에서 cancelled = true, 응답 받을 때 cancelled 면 무시
 *        → state 에 board 를 key 로 같이 저장해서 현재 board 와 다르면 null 로 취급
 *   4. 에러는 e instanceof ApiError ? e : new ApiError('UNKNOWN', '게시글을 불러오지 못했어요.', 0)
 *   5. attempt 숫자 state 를 의존성에 넣고 reload 에서 +1 → 다시 요청
 *
 * ----------------------------------------------------------------------------
 * 나중에 (지금은 하지 않아도 됨)
 * ----------------------------------------------------------------------------
 *   - 페이지네이션: FlatList onEndReached 에서 다음 page 요청, 결과를 이어 붙이기
 *   - 서비스 필터·정렬: CommunityScreen 의 onPressServiceFilter / onPressSort 와 연결해 쿼리 파라미터로 전달
 */

export {};
