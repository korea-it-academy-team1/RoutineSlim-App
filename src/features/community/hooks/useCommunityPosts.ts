/**
 * 커뮤니티 게시글 목록 훅
 * ============================================================================
 * 사용하는 곳: src/app/(tabs)/community.tsx
 *   지금은 그 파일의 communityPostsPlaceholder(board) 가 빈 목록을 돌려준다.
 *   이 훅을 구현하면 placeholder 함수를 지우고 `useCommunityPosts(board)` 로 바꾼다 (반환 모양 동일).
 *
 * ----------------------------------------------------------------------------
 * 만들 것
 * ----------------------------------------------------------------------------
 *   export function useCommunityPosts(board: CommunityBoard): {
 *     posts: PartyPost[] | null;   // 불러오는 중이면 null (화면이 로딩 표시)
 *     error: ApiError | null;      // 실패하면 화면이 error.message 와 '다시 시도' 표시
 *     reload: () => void;          // 다시 시도 버튼
 *   }
 *
 * ----------------------------------------------------------------------------
 * 구현 순서 (src/features/payment/hooks/useMonthlyPayments.ts 를 그대로 참고)
 * ----------------------------------------------------------------------------
 *   1. 후기·자유 게시판은 화면이 '준비 중'만 보여 주므로 board !== 'party' 면 요청하지 않고 [] 를 돌려준다
 *      (useMonthlyPayments 의 enabled 처리와 같은 방식)
 *   2. useFocusEffect(useCallback(...)) 안에서 getPosts(toCommunityBoardDto(board)) 호출
 *        - 탭에 다시 들어오거나 글쓰기·상세에서 돌아오면 자동으로 새로 불러온다
 *          (글 작성·삭제 후 목록 갱신이 따로 필요 없다)
 *   3. 응답을 dto => toPartyPost(dto) 로 바꿔 state 에 저장 (utils/postMapper.ts)
 *   4. 게시판을 빠르게 바꾸면 이전 요청의 늦은 응답이 덮어쓸 수 있다
 *        → cleanup 에서 cancelled = true, 응답 받을 때 cancelled 면 무시
 *        → state 에 board 를 key 로 같이 저장해서 현재 board 와 다르면 null 로 취급
 *   5. 에러는 e instanceof ApiError ? e : new ApiError('UNKNOWN', '게시글을 불러오지 못했어요.', 0)
 *   6. attempt 숫자 state 를 의존성에 넣고 reload 에서 +1 → 다시 요청
 *
 * ----------------------------------------------------------------------------
 * 나중에 (지금은 하지 않아도 됨)
 * ----------------------------------------------------------------------------
 *   - 페이지네이션: 서버는 page·size(최대 50)를 받는다. FlatList onEndReached 에서 다음 page 를 요청해 이어 붙이기
 *   - 서비스 필터·정렬: 서버에 아직 파라미터가 없다. CommunityScreen 의 onPressServiceFilter / onPressSort 는 비어 있음
 */

export {};
