/**
 * 커뮤니티 API (게시글·댓글)
 * ============================================================================
 * 화면: 커뮤니티 탭 (http://localhost:8081/community), 게시글 상세 (/community/[id]), 글쓰기 (/community/write)
 *
 * ----------------------------------------------------------------------------
 * 먼저 확인할 것: 서버에 커뮤니티 API 가 아직 없다 (2026-11-15 dev 기준)
 * ----------------------------------------------------------------------------
 *   - DB 에는 V1__init.sql 의 post, comment 테이블만 있다.
 *       post    : post_id(BIGINT), member_id, title, content, created_at, updated_at
 *       comment : comment_id(BIGINT), post_id, content, created_at, updated_at
 *   - 앱 화면(PartyPostCard·PartyPostDetailScreen·WritePostScreen)이 쓰는 값 중 DB 에 없는 것:
 *       게시판 구분(party/review/free), 구독 서비스, 모집 상태, 현재/최대 인원,
 *       전체 요금·1인당 분담금, 정산일, 조회수
 *   - comment 테이블에 member_id 가 없어서 "댓글 작성자"를 알 수 없다.
 *   → 서버 담당과 먼저 API 모양을 정하고, 서버에서 Flyway V6 이후 버전으로 컬럼을 추가해야 한다.
 *     (V4·V5 는 Server PR #20 이 사용 중)
 *
 * ----------------------------------------------------------------------------
 * 제안하는 엔드포인트 (서버와 합의 후 확정)
 * ----------------------------------------------------------------------------
 *   웹(RoutineSlim-Web/src/api/communityApi.js)이 이미 /api/v1/community/posts 주소를 쓰고 있어서
 *   같은 주소로 맞추면 웹·앱이 한 API 를 같이 쓸 수 있다.
 *
 *   GET    /api/v1/community/posts?board=party&page=0&size=20   게시글 목록 (최신순)
 *   GET    /api/v1/community/posts/{postId}                     게시글 상세
 *   POST   /api/v1/community/posts                              게시글 작성
 *   PUT    /api/v1/community/posts/{postId}                     게시글 수정 (본인만)
 *   DELETE /api/v1/community/posts/{postId}                     게시글 삭제 (본인만)
 *   POST   /api/v1/community/posts/{postId}/views               조회수 +1 (상세 들어갈 때 1번)
 *   GET    /api/v1/community/posts/{postId}/comments            댓글 목록
 *   POST   /api/v1/community/posts/{postId}/comments            댓글 작성
 *   DELETE /api/v1/community/posts/{postId}/comments/{id}       댓글 삭제 (본인만)
 *
 * ----------------------------------------------------------------------------
 * 작성 방법 (src/features/payment/api/paymentApi.ts 와 같은 방식)
 * ----------------------------------------------------------------------------
 *   - 요청은 authorizedRequest 로 보낸다. X-Member-Id 헤더는 자동으로 붙는다.
 *       import { authorizedRequest } from '@/features/auth/authorizedRequest';
 *       authorizedRequest<PostDto[]>('/api/v1/community/posts?board=party');
 *       authorizedRequest<PostDto>('/api/v1/community/posts', { method: 'POST', body: request });
 *   - 서버 응답 모양 그대로의 타입(XxxDto)을 이 파일에 둔다.
 *     화면용 타입(types.ts 의 PartyPost)으로 바꾸는 일은 utils/postMapper.ts 에서 한다.
 *   - 서버 id 는 숫자(BIGINT)지만 화면 타입은 string 이다. 변환은 mapper 에서 String(id).
 *   - 실패하면 authorizedRequest 가 ApiError 를 throw 한다. 여기서 잡지 말고 훅에서 처리한다.
 *
 * ----------------------------------------------------------------------------
 * 만들 것
 * ----------------------------------------------------------------------------
 *   (1) export type CommunityBoardDto = 'PARTY' | 'REVIEW' | 'FREE';
 *         - 앱 CommunityBoard('party'|'review'|'free')와 대문자/소문자 변환은 mapper 에서
 *
 *   (2) export type PostDto = {
 *         postId: number;
 *         board: CommunityBoardDto;
 *         title: string;
 *         content: string;
 *         authorName: string;          // member.member_nickname 등, 서버와 합의
 *         mine: boolean;               // 내 글이면 수정·삭제 메뉴 노출
 *         createdAt: string;           // ISO 8601
 *         viewCount: number;
 *         commentCount: number;
 *         // 파티원 모집(PARTY)일 때만 값이 있고 나머지 게시판은 null
 *         serviceName: string | null;  // 로고는 getServiceBrand(serviceName) 으로 앱에서 만든다
 *         recruitStatus: 'RECRUITING' | 'CLOSED' | null;
 *         currentMembers: number | null;
 *         maxMembers: number | null;
 *         totalPrice: number | null;
 *         pricePerMember: number | null;
 *         settlementDay: number | null;
 *       };
 *
 *   (3) export type CommentDto = {
 *         commentId: number;
 *         authorName: string;   // comment.member_id 컬럼이 생겨야 줄 수 있다
 *         mine: boolean;
 *         content: string;
 *         createdAt: string;
 *       };
 *
 *   (4) export type CreatePostRequestDto
 *         - WritePostScreen 의 PostDraft 를 서버 요청 모양으로 바꾼 것
 *         - { board, serviceId(구독 id → 서버에서 이름 조회 or serviceName 직접), title, content,
 *             currentMembers?, maxMembers?, pricePerMember? }
 *
 *   (5) 함수
 *         export async function getPosts(board: CommunityBoardDto): Promise<PostDto[]>
 *         export async function getPost(postId: string): Promise<PostDto>
 *         export async function createPost(request: CreatePostRequestDto): Promise<PostDto>
 *         export async function deletePost(postId: string): Promise<void>
 *         export async function increaseViewCount(postId: string): Promise<void>
 *         export async function getComments(postId: string): Promise<CommentDto[]>
 *         export async function createComment(postId: string, content: string): Promise<CommentDto>
 *         export async function deleteComment(postId: string, commentId: string): Promise<void>
 *
 * ----------------------------------------------------------------------------
 * 확인 방법
 * ----------------------------------------------------------------------------
 *   - 서버를 띄우고 curl 로 먼저 확인:
 *       curl -H "X-Member-Id: 019a3c2e-0000-7000-8000-000000000101" http://localhost:8080/api/v1/community/posts
 *   - 테스트 데이터: RoutineSlim-Server/src/main/resources/db/database/TEST_DATA.sql 12번 (post / comment)
 */

export {};
