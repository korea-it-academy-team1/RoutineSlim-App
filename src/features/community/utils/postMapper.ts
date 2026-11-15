/**
 * 서버 응답(PostDto·CommentDto) → 화면 타입(PartyPost·PostComment) 변환
 * ============================================================================
 * 화면 컴포넌트는 서버 모양을 모르게 하고, 서버 DTO 가 바뀌면 이 파일만 고친다.
 * (같은 방식: src/features/payment/utils/monthlyPayments.ts, src/features/stats/utils/monthlyStats.ts)
 *
 * ----------------------------------------------------------------------------
 * 만들 것
 * ----------------------------------------------------------------------------
 *   (1) export function toCommunityBoard(dto: CommunityBoardDto): CommunityBoard
 *       export function toCommunityBoardDto(board: CommunityBoard): CommunityBoardDto
 *         - 'PARTY' ↔ 'party', 'REVIEW' ↔ 'review', 'FREE' ↔ 'free'
 *
 *   (2) export function toPartyPost(dto: PostDto, comments: CommentDto[] = []): PartyPost
 *         - id            : String(dto.postId)
 *         - serviceName   : dto.serviceName ?? ''
 *         - serviceLogo   : getServiceBrand(serviceName).logo
 *                           (import { getServiceBrand } from '@/features/subscription/serviceBrands')
 *         - status        : dto.recruitStatus === 'CLOSED' ? 'closed' : 'recruiting'
 *         - description   : 목록 카드에 보이는 한두 줄 요약. content 앞부분을 잘라 쓰거나 서버와 합의
 *         - body          : { title: dto.title, content: dto.content }  (상세 화면 본문)
 *         - currentMembers·maxMembers·totalPrice·pricePerMember·settlementDay : null 이면 0
 *         - comments      : comments.map(toPostComment), types.ts 주석대로 "최신순" 정렬
 *         - commentCount  : dto.commentCount (목록에서는 댓글을 안 받으므로 서버 값 사용)
 *
 *   (3) export function toPostComment(dto: CommentDto): PostComment
 *         - id: String(dto.commentId), authorName, createdAt, content
 *
 *   (4) export function toCreatePostRequest(draft: PostDraft, subscriptions: Subscription[]): CreatePostRequestDto
 *         - PostDraft 는 WritePostScreen.tsx 에 있다 (serviceId 는 내 구독의 id)
 *         - 서버가 serviceName 을 받기로 하면 subscriptions 에서 serviceId 로 찾아 이름을 넣는다
 *         - board 가 'party' 가 아니면 party 값(인원·분담금)은 보내지 않는다
 *
 * ----------------------------------------------------------------------------
 * 참고
 * ----------------------------------------------------------------------------
 *   - 지금 화면 타입은 파티 모집(PartyPost) 하나뿐이다. 후기·자유 게시판은 시안이 없어
 *     CommunityScreen 에서 빈 목록을 보여 준다. 시안이 나오면 types.ts 에 타입을 추가하고 여기서 변환 함수를 더한다.
 *   - 순수 함수로만 만든다 (요청·상태 없음). 그래야 테스트하기 쉽다.
 */

export {};
