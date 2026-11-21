import { Pressable, StyleSheet, Text, View } from 'react-native';

import MessageCircleIcon from '@/assets/icons/message-circle.svg';
import { colors, radius, shadows, spacing, typography } from '@/theme';
import { formatTimeAgo } from '@/utils/format';

import type { GeneralPost } from '../types';

type GeneralPostCardProps = {
  post: GeneralPost;
  now?: string;
  onPress?: () => void;
};

/**
 * 후기·자유 글 카드. Figma 시안이 없어 PartyPostCard 에서 태그·인원·금액 줄을 뺀 형태.
 * 카드 모양(여백·모서리·그림자)과 글자 스타일은 PartyPostCard 와 같다.
 */
export function GeneralPostCard({ post, now, onPress }: GeneralPostCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text style={styles.title} numberOfLines={1}>
        {post.title}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {post.description}
      </Text>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>{`${post.authorName} · ${formatTimeAgo(post.createdAt, now)} · 조회 ${post.viewCount}`}</Text>
        <MessageCircleIcon width={13} height={13} />
        <Text style={styles.comments}>{` ${post.commentCount}`}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 7,
    padding: 14,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.85,
  },
  title: {
    ...typography.postTitle,
    color: colors.textTitle,
  },
  description: {
    ...typography.meta,
    color: colors.textSubtle,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meta: {
    ...typography.micro,
    flex: 1,
    color: colors.textSubtle,
    marginRight: spacing.xs,
  },
  comments: {
    ...typography.micro,
    color: colors.textSubtle,
  },
});
