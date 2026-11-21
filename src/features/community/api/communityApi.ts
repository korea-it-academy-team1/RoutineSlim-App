/**
 * 커뮤니티 API (게시글·댓글)
 * 서버: RoutineSlim-Server CommunityController (/api/v1/community/posts, Flyway V6)
 *
 * - 요청은 authorizedRequest 로 보낸다 (X-Member-Id 헤더 자동).
 * - 오류는 전부 400 ProblemDetail 이고 detail 에 한국어 문구가 있다. 없는 글도 404 가 아니라 400.
 * - 서버 응답 모양 그대로의 타입(XxxDto)만 둔다. 화면 타입으로 바꾸는 일은 utils/postMapper.ts.
 * - 실패하면 authorizedRequest 가 ApiError 를 throw 한다. 여기서 잡지 않고 훅에서 처리한다.
 */
import { authorizedRequest } from '@/features/auth/authorizedRequest';

const BASE = '/api/v1/community/posts';

export type CommunityBoardDto = 'PARTY' | 'REVIEW' | 'FREE';
export type RecruitStatusDto = 'RECRUITING' | 'CLOSED';

/** 서버 PostDTO */
export type PostDto = {
  postId: number;
  board: CommunityBoardDto;
  title: string;
  content: string;
  /** member.name. 탈퇴 회원은 '탈퇴한 회원' */
  authorName: string;
  /** 내 글이면 true */
  mine: boolean;
  /** 'YYYY-MM-DDTHH:mm:ss' (시간대 없음, 한국 시간) */
  createdAt: string;
  updatedAt: string | null;
  viewCount: number;
  commentCount: number;
  // 파티원 모집(PARTY) 글만 값이 있고 후기·자유 글은 null
  serviceName: string | null;
  recruitStatus: RecruitStatusDto | null;
  currentMembers: number | null;
  maxMembers: number | null;
  /** 작성자가 안 보냈으면 PARTY 여도 null */
  totalPrice: number | null;
  pricePerMember: number | null;
  /** 작성자가 안 보냈으면 PARTY 여도 null */
  settlementDay: number | null;
};

/** 서버 CommentDTO */
export type CommentDto = {
  commentId: number;
  postId: number;
  /** V6 이전 댓글은 '알 수 없음' */
  authorName: string;
  mine: boolean;
  content: string;
  /** 'YYYY-MM-DDTHH:mm:ss' (시간대 없음, 한국 시간) */
  createdAt: string;
};

/** 서버 PostRequestDTO (작성·수정 공통) */
export type PostRequestDto = {
  board: CommunityBoardDto;
  /** 1~200자 (앞뒤 공백은 서버가 지움) */
  title: string;
  /** 1~5000자 */
  content: string;
  // PARTY 일 때만. 다른 게시판이면 서버가 무시한다
  /** 필수, 100자 이하 */
  serviceName?: string;
  /** 작성 시 무시(항상 RECRUITING). 수정 시 'CLOSED' 로 모집 마감 */
  recruitStatus?: RecruitStatusDto;
  /** 1 이상 maxMembers 이하. 빼면 1 */
  currentMembers?: number;
  /** 필수, 2~10 */
  maxMembers?: number;
  /** 선택 */
  totalPrice?: number;
  /** 필수, 0~10,000,000 */
  pricePerMember?: number;
  /** 선택, 1~31 */
  settlementDay?: number;
};

/** 게시판 글 목록 (최신순). size 1~50 */
export async function getPosts(board: CommunityBoardDto, page = 0, size = 20): Promise<PostDto[]> {
  return authorizedRequest<PostDto[]>(`${BASE}?board=${board}&page=${page}&size=${size}`);
}

export async function getPost(postId: string): Promise<PostDto> {
  return authorizedRequest<PostDto>(`${BASE}/${postId}`);
}

export async function createPost(request: PostRequestDto): Promise<PostDto> {
  return authorizedRequest<PostDto>(BASE, { method: 'POST', body: request });
}

/** 작성자만. PUT 이라 전체 값을 다시 보낸다 */
export async function updatePost(postId: string, request: PostRequestDto): Promise<PostDto> {
  return authorizedRequest<PostDto>(`${BASE}/${postId}`, { method: 'PUT', body: request });
}

/** 작성자만. 댓글도 서버가 함께 지운다 (204) */
export async function deletePost(postId: string): Promise<void> {
  await authorizedRequest<null>(`${BASE}/${postId}`, { method: 'DELETE' });
}

/** 조회수 +1 (204) */
export async function increaseViewCount(postId: string): Promise<void> {
  await authorizedRequest<null>(`${BASE}/${postId}/views`, { method: 'POST' });
}

/** 댓글 목록 (최신순) */
export async function getComments(postId: string): Promise<CommentDto[]> {
  return authorizedRequest<CommentDto[]>(`${BASE}/${postId}/comments`);
}

export async function createComment(postId: string, content: string): Promise<CommentDto> {
  return authorizedRequest<CommentDto>(`${BASE}/${postId}/comments`, { method: 'POST', body: { content } });
}

/** 작성자만 (204) */
export async function deleteComment(postId: string, commentId: string): Promise<void> {
  await authorizedRequest<null>(`${BASE}/${postId}/comments/${commentId}`, { method: 'DELETE' });
}
