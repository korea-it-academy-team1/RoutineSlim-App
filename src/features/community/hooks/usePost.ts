/**
 * 게시글 상세 훅 (게시글 + 댓글 + 상세 화면의 동작)
 * ============================================================================
 * 사용하는 곳: src/app/community/[id].tsx
 *   지금은 그 파일의 postPlaceholder(id) 가 항상 '찾을 수 없음' 오류를 돌려준다.
 *   이 훅을 구현하면 placeholder 함수를 지우고 `usePost(id)` 로 바꾼다 (반환 모양 동일).
 *   확인 대화상자, 요청 중 표시, 실패 문구, 삭제 후 뒤로 가기는 route 에 이미 있다.
 *   이 훅의 함수들은 실패하면 throw 만 하면 된다 (route 의 run() 이 잡아서 actionError 로 보여 준다).
 *
 * ----------------------------------------------------------------------------
 * 만들 것
 * ----------------------------------------------------------------------------
 *   export function usePost(postId: string): {
 *     post: PartyPost | null;                            // 불러오는 중이면 null
 *     error: ApiError | null;                            // 없는 글은 서버가 400 (route 가 '찾을 수 없어요' 로 표시)
 *     reload: () => void;                                // 다시 시도
 *     addComment: (content: string) => Promise<void>;    // 작성 후 댓글 다시 불러오기
 *     removeComment: (commentId: string) => Promise<void>;
 *     closeRecruit: () => Promise<void>;                 // 내 글 모집 마감
 *     removePost: () => Promise<void>;                   // 내 글 삭제 (댓글도 서버가 함께 삭제)
 *   }
 *
 * ----------------------------------------------------------------------------
 * 구현 순서
 * ----------------------------------------------------------------------------
 *   1. useEffect([postId, attempt]) 에서 getPost(postId) 와 getComments(postId) 를 Promise.all 로 같이 요청
 *   2. toPartyPost(postDto, commentDtos) 로 바꿔 state 에 저장
 *        - 모집 마감 요청에 원래 값이 필요하니 postDto 도 따로 저장해 둔다 (toCloseRecruitRequest)
 *   3. 조회수: 처음 들어올 때 increaseViewCount(postId) 를 1번만 호출
 *        - 상세 요청보다 먼저 보내야 화면에 올라간 조회수가 보인다 (await 후 getPost)
 *        - 실패해도 화면은 그대로 보여 준다 (catch 에서 무시)
 *        - reload(다시 시도) 때는 다시 올리지 않는다 → attempt 와 분리된 useEffect([postId]) 또는 ref 플래그
 *   4. addComment / removeComment
 *        - createComment(postId, content) / deleteComment(postId, commentId) 후 getComments 를 다시 불러
 *          post 의 comments 와 commentCount(= 댓글 수) 를 갱신
 *   5. closeRecruit
 *        - updatePost(postId, toCloseRecruitRequest(postDto)) → 응답 PostDto 로 post 를 다시 만든다 (댓글은 유지)
 *   6. removePost
 *        - deletePost(postId) 만 하면 된다. 뒤로 가기는 route 가 한다
 *   7. cancelled 플래그로 화면을 나간 뒤 늦게 온 응답은 무시한다
 */

export {};
