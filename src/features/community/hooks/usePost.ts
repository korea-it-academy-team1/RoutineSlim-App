/**
 * 게시글 상세 훅 (게시글 + 댓글)
 * ============================================================================
 * 사용하는 곳: src/app/community/[id].tsx → PartyPostDetailScreen 의 post
 *
 * ----------------------------------------------------------------------------
 * 만들 것
 * ----------------------------------------------------------------------------
 *   export function usePost(postId: string) {
 *     ...
 *     return { post, error, reload, addComment, removeComment };
 *   }
 *
 *   - post          : PartyPost | null        불러오는 중이면 null
 *   - error         : ApiError | null         404 면 "게시글을 찾을 수 없어요" (지금 [id].tsx 의 화면 재사용)
 *   - reload        : () => void
 *   - addComment    : (content: string) => Promise<void>   작성 후 댓글 목록 다시 불러오기
 *   - removeComment : (commentId: string) => Promise<void>
 *
 * ----------------------------------------------------------------------------
 * 구현 순서
 * ----------------------------------------------------------------------------
 *   1. useEffect 에서 getPost(postId) 와 getComments(postId) 를 Promise.all 로 같이 요청
 *   2. toPartyPost(postDto, commentDtos) 로 바꿔 state 에 저장
 *   3. 조회수: 화면에 처음 들어올 때 increaseViewCount(postId) 를 1번만 호출
 *        - 실패해도 화면은 그대로 보여 준다 (catch 에서 무시)
 *        - useFocusEffect 에 넣으면 뒤로 왔다 갈 때마다 올라가니 useEffect([postId]) 에 넣는다
 *   4. 댓글 작성·삭제 중 실패는 throw 해서 route 쪽에서 안내 문구를 띄운다
 *        (src/app/my/subscriptions/[id].tsx 의 run() 패턴 참고)
 *   5. cancelled 플래그로 화면을 나간 뒤 늦게 온 응답은 무시한다
 */

export {};
