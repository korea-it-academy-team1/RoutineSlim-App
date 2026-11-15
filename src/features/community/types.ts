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

export type PartyPost = {
  id: string;
  /** 구독 서비스 이름 (태그로 표시) */
  serviceName: string;
  serviceLogo: ServiceLogo;
  status: 'recruiting' | 'closed';
  title: string;
  description: string;
  currentMembers: number;
  maxMembers: number;
  /** 서비스 전체 월 요금. 작성자가 안 적었으면 null */
  totalPrice: number | null;
  /** 1인당 월 분담금 */
  pricePerMember: number;
  /** 매월 정산일. 작성자가 안 적었으면 null */
  settlementDay: number | null;
  authorName: string;
  /** 내가 쓴 글이면 더보기(삭제)·모집 마감 버튼을 보여 준다 */
  mine: boolean;
  /** ISO 8601 */
  createdAt: string;
  viewCount: number;
  commentCount: number;
  body: { title: string; content: string };
  /** 최신순 */
  comments: PostComment[];
};
