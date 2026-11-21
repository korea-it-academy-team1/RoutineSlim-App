import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ChevronLeft from '@/assets/icons/chevron-left-muted.svg';
import ChevronRight from '@/assets/icons/chevron-right-muted.svg';
import { buildMonthGrid, type CalendarDay } from '@/features/calendar/utils/buildMonthGrid';
import { colors, radius, spacing, typography } from '@/theme';
import { parseDateKey, shiftMonth, todayKey, type DateKey, type YearMonth } from '@/utils/date';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

type DatePickerSheetProps = {
  title: string;
  /** 지금 입력된 날짜. 없으면 오늘이 있는 달을 보여 준다 */
  value: DateKey | null;
  onSelect: (date: DateKey) => void;
  onClose: () => void;
};

/**
 * 화면 아래에서 올라오는 날짜 선택 달력. 날짜를 누르면 고르고 닫힌다.
 * 열 때마다 value 의 달로 시작하도록, 부모가 열려 있을 때만 그린다: {open && <DatePickerSheet … />}
 * 모양은 OptionSheet(시트)·MonthCalendar(날짜 칸)와 같다.
 */
export function DatePickerSheet({ title, value, onSelect, onClose }: DatePickerSheetProps) {
  const insets = useSafeAreaInsets();
  const today = todayKey();
  const [view, setView] = useState<YearMonth>(() => {
    const { year, month } = parseDateKey(value ?? today);
    return { year, month };
  });
  const weeks = useMemo(() => buildMonthGrid(view.year, view.month), [view]);

  const select = (date: DateKey) => {
    onSelect(date);
    onClose();
  };

  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable accessibilityLabel="닫기" style={styles.scrim} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.handleArea}>
          <View style={styles.handle} />
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => select(today)}>
            <Text style={styles.todayButton}>오늘</Text>
          </Pressable>
        </View>

        <View style={styles.calendar}>
          <View style={styles.monthSelector}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="이전 달"
              hitSlop={10}
              onPress={() => setView((v) => shiftMonth(v, -1))}
            >
              <ChevronLeft width={20} height={20} />
            </Pressable>
            <Text style={styles.monthTitle}>{`${view.year}년 ${view.month}월`}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="다음 달"
              hitSlop={10}
              onPress={() => setView((v) => shiftMonth(v, 1))}
            >
              <ChevronRight width={20} height={20} />
            </Pressable>
          </View>

          <View style={styles.row}>
            {WEEKDAYS.map((label, index) => (
              <Text key={label} style={[styles.weekday, index === 0 && styles.sunday]}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.weeks}>
            {weeks.map((week) => (
              <View key={week[0].key} style={styles.row}>
                {week.map((day) => (
                  <DayCell
                    key={day.key}
                    day={day}
                    isToday={day.key === today}
                    isSelected={day.key === value}
                    onPress={select}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

type DayCellProps = {
  day: CalendarDay;
  isToday: boolean;
  isSelected: boolean;
  onPress: (date: DateKey) => void;
};

function DayCell({ day, isToday, isSelected, onPress }: DayCellProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${day.day}일`}
      accessibilityState={{ selected: isSelected }}
      disabled={!day.inMonth}
      onPress={() => onPress(day.key)}
      style={styles.day}
    >
      <View style={[styles.date, isToday && styles.dateToday, isSelected && styles.dateSelected]}>
        <Text
          style={[
            styles.dateText,
            day.weekday === 0 && styles.sunday,
            !day.inMonth && styles.dateOutside,
            isToday && styles.dateTextToday,
            isSelected && styles.dateTextSelected,
          ]}
        >
          {day.day}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.scrim,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    backgroundColor: colors.white,
  },
  handleArea: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.divider,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.sheetTitle,
    color: colors.textTitle,
  },
  todayButton: {
    ...typography.captionSmBold,
    color: colors.primary,
  },
  calendar: {
    gap: 10,
    paddingHorizontal: spacing.xl,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthTitle: {
    ...typography.monthTitle,
    color: colors.textTitle,
  },
  row: {
    flexDirection: 'row',
  },
  weekday: {
    ...typography.meta,
    flex: 1,
    textAlign: 'center',
    color: colors.textSubtle,
  },
  sunday: {
    color: colors.sunday,
  },
  weeks: {
    gap: 2,
  },
  day: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateToday: {
    backgroundColor: colors.primarySoft,
  },
  dateText: {
    ...typography.day,
    color: colors.textTitle,
  },
  dateOutside: {
    color: colors.textDisabled,
  },
  dateTextToday: {
    fontWeight: '700',
    color: colors.primary,
  },
  dateSelected: {
    backgroundColor: colors.primary,
  },
  dateTextSelected: {
    fontWeight: '700',
    color: colors.white,
  },
});
