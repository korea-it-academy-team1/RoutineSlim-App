import type { ServiceLogo } from '@/features/subscription/types';

export type CommunityBoard = 'party' | 'review' | 'free';

export type PostComment = {
  id: string;
  authorName: string;
  /** 내가 쓴 댓글이면 삭제 버튼을 보여 준다 */
  mine: boolean;
  /** ISO 8601 */
  createdAt: string;
  content: string;
};

/** 모든 게시판 글에 공통인 값 */
type PostBase = {
  id: string;
  title: string;
  /** 목록 카드의 본문 요약 */
  description: string;
  authorName: string;
  /** 내가 쓴 글이면 더보기(삭제) 버튼을 보여 준다 */
  mine: boolean;
  /** ISO 8601 */
  createdAt: string;
  viewCount: number;
  commentCount: number;
  body: { title: string; content: string };
  /** 최신순 */
  comments: PostComment[];
};

/** 파티원 모집 글 */
export type PartyPost = PostBase & {
  board: 'party';
  /** 구독 서비스 이름 (태그로 표시) */
  serviceName: string;
  serviceLogo: ServiceLogo;
  status: 'recruiting' | 'closed';
  currentMembers: number;
  maxMembers: number;
  /** 서비스 전체 월 요금. 작성자가 안 적었으면 null */
  totalPrice: number | null;
  /** 1인당 월 분담금 */
  pricePerMember: number;
  /** 매월 정산일. 작성자가 안 적었으면 null */
  settlementDay: number | null;
};

/** 후기·자유 글 (파티 정보 없음). Figma 시안이 없어 파티 카드에서 모집 정보를 뺀 형태로 보여 준다 */
export type GeneralPost = PostBase & {
  board: 'review' | 'free';
};

export type CommunityPost = PartyPost | GeneralPost;
