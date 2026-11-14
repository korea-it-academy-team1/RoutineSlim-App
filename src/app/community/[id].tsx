import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/theme';

// 커뮤니티 API 가 아직 없어 어떤 게시글도 찾을 수 없다.
// API 가 생기면 id 로 게시글을 불러와 PartyPostDetailScreen 에 넘긴다.
export default function PartyPostDetailRoute() {
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/community'));

  return (
    <View style={styles.notFound}>
      <Text style={styles.notFoundText}>게시글을 찾을 수 없어요</Text>
      <Text style={styles.link} onPress={goBack}>
        목록으로
      </Text>
    </View>
  );
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
