import { StyleSheet, Text, View } from 'react-native';

import UserRoundIcon from '@/assets/icons/user-round.svg';
import { colors, typography } from '@/theme';
import { formatTimeAgo } from '@/utils/format';

type PostAuthorRowProps = {
  authorName: string;
  createdAt: string;
  viewCount: number;
  now?: string;
};

/** 게시글 상세의 작성자 줄 (아바타 · 이름 · 작성 시각 · 조회수). 모든 게시판이 같이 쓴다 */
export function PostAuthorRow({ authorName, createdAt, viewCount, now }: PostAuthorRowProps) {
  return (
    <View style={styles.author}>
      <View style={styles.avatar}>
        <UserRoundIcon width={18} height={18} />
      </View>
      <Text style={styles.authorName}>{authorName}</Text>
      <Text style={styles.meta}>{`${formatTimeAgo(createdAt, now)} · 조회 ${viewCount}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  authorName: {
    ...typography.captionSmBold,
    flex: 1,
    color: colors.textTitle,
  },
  meta: {
    ...typography.micro,
    color: colors.textSubtle,
  },
});
