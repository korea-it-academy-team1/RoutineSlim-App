import { Fragment } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/common/Card';
import { Badge } from '@/components/ui/Badge';
import { colors, radius, spacing, typography } from '@/theme';
import { formatTimeAgo } from '@/utils/format';

import type { PartyRequest } from '../types';

type PartyRequestListProps = {
  requests: PartyRequest[];
  now?: string;
  busy?: boolean;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
};

/** 내 파티 글의 참여 요청. 요청 중인 건만 수락·거절 버튼이 있다 */
export function PartyRequestList({ requests, now, busy = false, onAccept, onReject }: PartyRequestListProps) {
  const pending = requests.filter((r) => r.status === 'requested').length;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>
        {'참여 요청 '}
        <Text style={styles.count}>{pending}</Text>
      </Text>

      {requests.length === 0 ? (
        <Text style={styles.empty}>아직 참여 요청이 없어요.</Text>
      ) : (
        <Card style={styles.card}>
          {requests.map((request, index) => (
            <Fragment key={request.id}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.row}>
                <View style={styles.texts}>
                  <Text style={styles.name}>{request.memberName}</Text>
                  <Text style={styles.time}>{formatTimeAgo(request.createdAt, now)}</Text>
                </View>
                {request.status === 'requested' ? (
                  <View style={styles.actions}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${request.memberName} 거절`}
                      disabled={busy}
                      onPress={() => onReject(request.id)}
                      style={({ pressed }) => [styles.reject, (pressed || busy) && styles.dimmed]}
                    >
                      <Text style={styles.rejectText}>거절</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${request.memberName} 수락`}
                      disabled={busy}
                      onPress={() => onAccept(request.id)}
                      style={({ pressed }) => [styles.accept, (pressed || busy) && styles.dimmed]}
                    >
                      <Text style={styles.acceptText}>수락</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Badge
                    label={request.status === 'accepted' ? '파티원' : '거절함'}
                    tone={request.status === 'accepted' ? 'positive' : 'neutral'}
                  />
                )}
              </View>
            </Fragment>
          ))}
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  heading: {
    ...typography.sectionTitleTight,
    color: colors.textTitle,
  },
  count: {
    color: colors.primary,
  },
  empty: {
    ...typography.body13,
    color: colors.textSubtle,
  },
  card: {
    gap: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  texts: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...typography.listTitleLg,
    color: colors.textPrimary,
  },
  time: {
    ...typography.caption12,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  reject: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.segmentBackground,
  },
  rejectText: {
    ...typography.label,
    color: colors.textSubtle,
  },
  accept: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  acceptText: {
    ...typography.label,
    color: colors.white,
  },
  dimmed: {
    opacity: 0.6,
  },
});
