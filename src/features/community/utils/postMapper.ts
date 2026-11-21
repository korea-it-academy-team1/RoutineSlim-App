/**
 * 서버 응답(PostDto·CommentDto) → 화면 타입(PartyPost·PostComment), 글쓰기 입력 → 서버 요청 변환.
 * 화면 컴포넌트는 서버 모양을 모르게 하고, 서버 DTO 가 바뀌면 이 파일만 고친다. 순수 함수만 둔다.
 *
 * 파티원 모집 글은 PartyPost, 후기·자유 글은 GeneralPost 로 바꾼다 (toCommunityPost 가 게시판으로 고른다).
 */
import { getServiceBrand } from '@/features/subscription/serviceBrands';

import type { CommentDto, CommunityBoardDto, PostDto, PostRequestDto } from '../api/communityApi';
import type { PostDraft } from '../screens/WritePostScreen';
import type { CommunityBoard, CommunityPost, GeneralPost, PartyPost, PostComment } from '../types';

/** 목록 카드에 보여 줄 본문 요약 길이 */
const DESCRIPTION_MAX_LENGTH = 60;

const BOARD_TO_DTO: Record<CommunityBoard, CommunityBoardDto> = {
  party: 'PARTY',
  review: 'REVIEW',
  free: 'FREE',
};

export function toCommunityBoardDto(board: CommunityBoard): CommunityBoardDto {
  return BOARD_TO_DTO[board];
}

/**
 * 서버 시각은 시간대 없는 한국 시간('YYYY-MM-DDTHH:mm:ss')이다.
 * 그대로 new Date() 에 넣으면 기기 시간대로 읽히므로 +09:00 을 붙여 ISO 8601 로 만든다.
 */
function toIsoKst(dateTime: string) {
  return /(Z|[+-]\d{2}:?\d{2})$/.test(dateTime) ? dateTime : `${dateTime}+09:00`;
}

function summarize(content: string) {
  const oneLine = content.replace(/\s+/g, ' ').trim();
  return oneLine.length > DESCRIPTION_MAX_LENGTH ? `${oneLine.slice(0, DESCRIPTION_MAX_LENGTH)}…` : oneLine;
}

export function toPostComment(dto: CommentDto): PostComment {
  return {
    id: String(dto.commentId),
    authorName: dto.authorName,
    mine: dto.mine,
    createdAt: toIsoKst(dto.createdAt),
    content: dto.content,
  };
}

/** 게시판과 상관없는 공통 값 */
function toPostBase(dto: PostDto, comments: CommentDto[]) {
  return {
    id: String(dto.postId),
    title: dto.title,
    description: summarize(dto.content),
    authorName: dto.authorName,
    mine: dto.mine,
    createdAt: toIsoKst(dto.createdAt),
    viewCount: dto.viewCount,
    commentCount: dto.commentCount,
    body: { title: dto.title, content: dto.content },
    // 서버가 이미 최신순으로 준다
    comments: comments.map(toPostComment),
  };
}

export function toPartyPost(dto: PostDto, comments: CommentDto[] = []): PartyPost {
  const serviceName = dto.serviceName ?? '';
  return {
    ...toPostBase(dto, comments),
    board: 'party',
    serviceName,
    serviceLogo: getServiceBrand(serviceName).logo,
    status: dto.recruitStatus === 'CLOSED' ? 'closed' : 'recruiting',
    // PARTY 글은 서버가 항상 채워 준다. 타입 때문에 ?? 0
    currentMembers: dto.currentMembers ?? 0,
    maxMembers: dto.maxMembers ?? 0,
    totalPrice: dto.totalPrice,
    pricePerMember: dto.pricePerMember ?? 0,
    settlementDay: dto.settlementDay,
  };
}

export function toGeneralPost(dto: PostDto, comments: CommentDto[] = []): GeneralPost {
  return {
    ...toPostBase(dto, comments),
    board: dto.board === 'REVIEW' ? 'review' : 'free',
  };
}

/** 게시판에 맞는 화면 타입으로 바꾼다 */
export function toCommunityPost(dto: PostDto, comments: CommentDto[] = []): CommunityPost {
  return dto.board === 'PARTY' ? toPartyPost(dto, comments) : toGeneralPost(dto, comments);
}

export function toCreatePostRequest(draft: PostDraft): PostRequestDto {
  const request: PostRequestDto = {
    board: toCommunityBoardDto(draft.board),
    title: draft.title,
    content: draft.content,
  };
  // 후기·자유는 파티 값을 보내지 않는다
  if (draft.board !== 'party' || !draft.party) return request;

  const { currentMembers, maxMembers, pricePerMember, totalPrice, settlementDay } = draft.party;
  return {
    ...request,
    serviceName: draft.serviceName ?? undefined,
    currentMembers,
    maxMembers,
    pricePerMember,
    totalPrice,
    ...(settlementDay !== null ? { settlementDay } : {}),
  };
}

/** 모집 마감용 수정 요청. PUT 은 전체를 다시 보내야 하므로 기존 값을 담고 recruitStatus 만 'CLOSED' */
export function toCloseRecruitRequest(post: PostDto): PostRequestDto {
  return {
    board: post.board,
    title: post.title,
    content: post.content,
    serviceName: post.serviceName ?? undefined,
    recruitStatus: 'CLOSED',
    currentMembers: post.currentMembers ?? undefined,
    maxMembers: post.maxMembers ?? undefined,
    totalPrice: post.totalPrice ?? undefined,
    pricePerMember: post.pricePerMember ?? undefined,
    settlementDay: post.settlementDay ?? undefined,
  };
}
