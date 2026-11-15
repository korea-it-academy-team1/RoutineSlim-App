/**
 * 커뮤니티 API (게시글·댓글)
 * ============================================================================
 * 화면: 커뮤니티 탭 (http://localhost:8081/community), 게시글 상세 (/community/[id]), 글쓰기 (/community/write)
 * 서버: RoutineSlim-Server feat/community 브랜치 (CommunityController, Flyway V6)
 *
 * ----------------------------------------------------------------------------
 * 서버 엔드포인트 (X-Member-Id 헤더 필요, 조회수만 헤더 없이 가능)
 * ----------------------------------------------------------------------------
 *   GET    /api/v1/community/posts?board=PARTY&page=0&size=20   목록 (최신순). board 를 빼면 전체, size 1~50
 *   GET    /api/v1/community/posts/{postId}                     상세
 *   POST   /api/v1/community/posts                              작성 → 201 + PostDto
 *   PUT    /api/v1/community/posts/{postId}                     수정 (작성자만) → 200 + PostDto
 *   DELETE /api/v1/community/posts/{postId}                     삭제 (작성자만, 댓글도 함께) → 204
 *   POST   /api/v1/community/posts/{postId}/views               조회수 +1 → 204
 *   GET    /api/v1/community/posts/{postId}/comments            댓글 목록 (최신순)
 *   POST   /api/v1/community/posts/{postId}/comments            댓글 작성 {content} → 201 + CommentDto
 *   DELETE /api/v1/community/posts/{postId}/comments/{id}       댓글 삭제 (작성자만) → 204
 *
 *   오류는 전부 400 ProblemDetail 이고 detail 에 한국어 문구가 들어 있다 (그대로 화면에 보여 주면 된다).
 *     - 없는 글: "게시글을 찾을 수 없습니다."   (404 가 아니라 400)
 *     - 남의 글 수정·삭제: "본인이 쓴 게시글만 수정·삭제할 수 있습니다."
 *     - 입력값 오류: "제목을(를) 입력해 주세요.", "모집 인원은 2~10명이어야 합니다." 등
 *
 * ----------------------------------------------------------------------------
 * 작성 방법 (src/features/payment/api/paymentApi.ts 와 같은 방식)
 * ----------------------------------------------------------------------------
 *   - 요청은 authorizedRequest 로 보낸다. X-Member-Id 헤더는 자동으로 붙는다.
 *       import { authorizedRequest } from '@/features/auth/authorizedRequest';
 *       authorizedRequest<PostDto[]>('/api/v1/community/posts?board=PARTY');
 *       authorizedRequest<PostDto>('/api/v1/community/posts', { method: 'POST', body: request });
 *   - 204 응답(삭제·조회수)은 본문이 없다. src/api/client.ts 는 빈 본문을 null 로 돌려주므로
 *     await authorizedRequest<null>(path, { method: 'DELETE' }) 처럼 부르고 Promise<void> 로 끝내면 된다.
 *   - 서버 응답 모양 그대로의 타입(XxxDto)을 이 파일에 둔다.
 *     화면용 타입(types.ts 의 PartyPost)으로 바꾸는 일은 utils/postMapper.ts 에서 한다.
 *   - 서버 id 는 숫자(BIGINT)지만 화면 타입은 string 이다. 변환은 mapper 에서 String(id).
 *   - 실패하면 authorizedRequest 가 ApiError 를 throw 한다. 여기서 잡지 말고 훅에서 처리한다.
 *
 * ----------------------------------------------------------------------------
 * 만들 것 (서버 DTO 와 이름·타입을 맞춤)
 * ----------------------------------------------------------------------------
 *   (1) export type CommunityBoardDto = 'PARTY' | 'REVIEW' | 'FREE';
 *       export type RecruitStatusDto = 'RECRUITING' | 'CLOSED';
 *
 *   (2) export type PostDto = {           // 서버 PostDTO
 *         postId: number;
 *         board: CommunityBoardDto;
 *         title: string;
 *         content: string;
 *         authorName: string;          // member.name. 탈퇴 회원은 '탈퇴한 회원'
 *         mine: boolean;               // 내 글이면 true
 *         createdAt: string;           // 'YYYY-MM-DDTHH:mm:ss' (시간대 없음, 한국 시간)
 *         updatedAt: string | null;
 *         viewCount: number;
 *         commentCount: number;
 *         // 파티원 모집(PARTY) 글만 값이 있고 후기·자유 글은 null
 *         serviceName: string | null;
 *         recruitStatus: RecruitStatusDto | null;
 *         currentMembers: number | null;
 *         maxMembers: number | null;
 *         totalPrice: number | null;   // 작성자가 안 보냈으면 PARTY 여도 null
 *         pricePerMember: number | null;
 *         settlementDay: number | null; // 작성자가 안 보냈으면 PARTY 여도 null
 *       };
 *
 *   (3) export type CommentDto = {        // 서버 CommentDTO
 *         commentId: number;
 *         postId: number;
 *         authorName: string;          // V6 이전 댓글은 '알 수 없음'
 *         mine: boolean;
 *         content: string;
 *         createdAt: string;
 *       };
 *
 *   (4) export type PostRequestDto = {    // 서버 PostRequestDTO (작성·수정 공통)
 *         board: CommunityBoardDto;
 *         title: string;               // 1~200자 (앞뒤 공백은 서버가 지움)
 *         content: string;             // 1~5000자
 *         // PARTY 일 때만. 다른 게시판이면 서버가 무시한다
 *         serviceName?: string;        // 필수, 100자 이하
 *         recruitStatus?: RecruitStatusDto; // 작성 시 무시(항상 RECRUITING). 수정 시 'CLOSED' 로 모집 마감
 *         currentMembers?: number;     // 1 이상 maxMembers 이하. 빼면 1
 *         maxMembers?: number;         // 필수, 2~10
 *         totalPrice?: number;         // 선택
 *         pricePerMember?: number;     // 필수, 0~10,000,000
 *         settlementDay?: number;      // 선택, 1~31
 *       };
 *
 *   (5) 함수
 *         export async function getPosts(board: CommunityBoardDto, page = 0, size = 20): Promise<PostDto[]>
 *         export async function getPost(postId: string): Promise<PostDto>
 *         export async function createPost(request: PostRequestDto): Promise<PostDto>
 *         export async function updatePost(postId: string, request: PostRequestDto): Promise<PostDto>
 *         export async function deletePost(postId: string): Promise<void>
 *         export async function increaseViewCount(postId: string): Promise<void>
 *         export async function getComments(postId: string): Promise<CommentDto[]>
 *         export async function createComment(postId: string, content: string): Promise<CommentDto>
 *         export async function deleteComment(postId: string, commentId: string): Promise<void>
 *
 * ----------------------------------------------------------------------------
 * 확인 방법
 * ----------------------------------------------------------------------------
 *   - 서버(feat/community)를 띄우고 curl 로 먼저 확인:
 *       curl -H "X-Member-Id: 019a3c2e-0000-7000-8000-000000000101" "http://localhost:8080/api/v1/community/posts?board=PARTY"
 *   - 테스트 데이터: RoutineSlim-Server/src/main/resources/db/database/TEST_DATA.sql 12번
 *     (파티 글 3개: 넷플릭스·YouTube Premium 모집 중, 쿠팡 와우 마감 / 후기·자유 글 7개, 댓글 7개)
 */

export {};
