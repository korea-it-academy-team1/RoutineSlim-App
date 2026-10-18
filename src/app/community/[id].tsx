import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { MOCK_NOW, findPartyPost } from '@/features/community/data/mockPosts';
import { PartyPostDetailScreen } from '@/features/community/screens/PartyPostDetailScreen';
import { colors, typography } from '@/theme';

export default function PartyPostDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = id ? findPartyPost(id) : undefined;
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/community'));

  if (!post) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>게시글을 찾을 수 없어요</Text>
        <Text style={styles.link} onPress={goBack}>
          목록으로
        </Text>
      </View>
    );
  }

  // TODO: 참여 요청 API 연동
  return <PartyPostDetailScreen post={post} now={MOCK_NOW} onBack={goBack} />;
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.backgroundMuted,
  },
  notFoundText: {
    ...typography.caption,
    color: colors.textSubtle,
  },
  link: {
    ...typography.captionSmBold,
    color: colors.primary,
  },
});
