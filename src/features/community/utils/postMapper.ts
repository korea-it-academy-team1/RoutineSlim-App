/**
 * 서버 응답(PostDto·CommentDto) → 화면 타입(PartyPost·PostComment) 변환, 글쓰기 입력 → 서버 요청 변환
 * ============================================================================
 * 화면 컴포넌트는 서버 모양을 모르게 하고, 서버 DTO 가 바뀌면 이 파일만 고친다.
 * (같은 방식: src/features/payment/utils/monthlyPayments.ts, src/features/stats/utils/monthlyStats.ts)
 * 타입: PostDto·CommentDto·PostRequestDto 는 api/communityApi.ts, PartyPost·PostComment 는 types.ts,
 *       PostDraft 는 screens/WritePostScreen.tsx
 *
 * ----------------------------------------------------------------------------
 * 만들 것
 * ----------------------------------------------------------------------------
 *   (1) export function toCommunityBoardDto(board: CommunityBoard): CommunityBoardDto
 *         - 'party' → 'PARTY', 'review' → 'REVIEW', 'free' → 'FREE'
 *
 *   (2) export function toPartyPost(dto: PostDto, comments: CommentDto[] = []): PartyPost
 *         - id             : String(dto.postId)
 *         - serviceName    : dto.serviceName ?? ''
 *         - serviceLogo    : getServiceBrand(serviceName).logo
 *                            (import { getServiceBrand } from '@/features/subscription/serviceBrands')
 *         - status         : dto.recruitStatus === 'CLOSED' ? 'closed' : 'recruiting'
 *         - title          : dto.title
 *         - description    : 목록 카드(PartyPostCard)의 한두 줄 요약 → dto.content 앞부분 (예: 60자 + '…')
 *         - body           : { title: dto.title, content: dto.content }  (상세 화면 본문)
 *         - currentMembers·maxMembers·pricePerMember : PARTY 글은 서버가 항상 채워 준다. 타입 때문에 ?? 0
 *         - totalPrice·settlementDay : null 그대로 (화면이 null 이면 숨긴다)
 *         - authorName, mine, viewCount, commentCount : 서버 값 그대로
 *         - createdAt      : 서버는 시간대 없는 한국 시간 'YYYY-MM-DDTHH:mm:ss' 를 준다.
 *                            formatTimeAgo(src/utils/format.ts)가 이 형식을 어떻게 읽는지 확인할 것
 *         - comments       : comments.map(toPostComment). 서버가 이미 최신순으로 준다
 *
 *   (3) export function toPostComment(dto: CommentDto): PostComment
 *         - id: String(dto.commentId), authorName, mine, createdAt, content
 *
 *   (4) export function toCreatePostRequest(draft: PostDraft): PostRequestDto
 *         - board: toCommunityBoardDto(draft.board), title, content
 *         - draft.party 가 있으면(PARTY) serviceName, currentMembers, maxMembers, pricePerMember,
 *           totalPrice, settlementDay(null 이면 빼기) 를 넣는다
 *         - 후기·자유는 파티 값을 보내지 않는다 (보내도 서버가 무시)
 *
 *   (5) export function toCloseRecruitRequest(post: PostDto): PostRequestDto
 *         - 모집 마감용 수정 요청. 서버 PUT 은 전체를 다시 보내야 하므로 기존 값을 그대로 담고
 *           recruitStatus 만 'CLOSED' 로 바꾼다 (usePost 의 closeRecruit 에서 사용)
 *         - 그래서 usePost 는 화면 타입(PartyPost)과 별도로 마지막에 받은 PostDto 도 갖고 있어야 한다
 *
 * ----------------------------------------------------------------------------
 * 참고
 * ----------------------------------------------------------------------------
 *   - 지금 화면 타입은 파티 모집(PartyPost) 하나뿐이다. 후기·자유 게시판은 시안이 없어
 *     CommunityScreen 에서 '준비 중'으로 보인다. 시안이 나오면 types.ts 에 타입을 추가하고 여기서 변환 함수를 더한다.
 *   - 순수 함수로만 만든다 (요청·상태 없음). 그래야 테스트하기 쉽다.
 */

export {};
