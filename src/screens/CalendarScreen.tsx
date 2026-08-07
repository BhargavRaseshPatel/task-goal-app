import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import { useData } from '../context/DataContext';
import { formatTime, statusColor, statusLabel } from '../utils/format';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const TODAY = '2026-08-02';
const [TODAY_YEAR, TODAY_MONTH] = TODAY.split('-').map(Number);

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function buildMonthGrid(year: number, month: number) {
  const firstOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startWeekday = firstOfMonth.getDay();
  const cells: { date: string; inMonth: boolean; day: number }[] = [];

  for (let i = 0; i < startWeekday; i++) {
    const prevMonthDays = new Date(year, month - 1, 0).getDate();
    cells.push({ date: '', inMonth: false, day: prevMonthDays - startWeekday + i + 1 });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: `${year}-${pad(month)}-${pad(d)}`, inMonth: true, day: d });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: '', inMonth: false, day: cells.length - startWeekday - daysInMonth + 1 });
  }
  return cells;
}

export default function CalendarScreen() {
  const { taskDays, tasks } = useData();
  const [year] = useState(TODAY_YEAR);
  const [month] = useState(TODAY_MONTH);
  const [selectedDate, setSelectedDate] = useState(TODAY);

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const datesWithTasks = useMemo(() => new Set(taskDays.map((d) => d.day_date)), [taskDays]);
  const selectedDayItems = taskDays
    .filter((d) => d.day_date === selectedDate)
    .map((d) => ({ day: d, task: tasks.find((t) => t.id === d.task_id) }))
    .filter((item) => !!item.task);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.monthLabel}>{monthLabel}</Text>

        <View style={styles.grid}>
          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((w, i) => (
              <Text key={`${w}-${i}`} style={styles.weekdayText}>{w}</Text>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {cells.map((cell, idx) => {
              const isSelected = cell.date === selectedDate;
              const isToday = cell.date === TODAY;
              const hasTasks = cell.inMonth && datesWithTasks.has(cell.date);
              return (
                <Pressable
                  key={idx}
                  disabled={!cell.inMonth}
                  onPress={() => cell.inMonth && setSelectedDate(cell.date)}
                  style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !cell.inMonth && styles.dayTextMuted,
                      isSelected && styles.dayTextSelected,
                      isToday && !isSelected && styles.dayTextToday,
                    ]}
                  >
                    {cell.day}
                  </Text>
                  {hasTasks && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text style={styles.selectedLabel}>
          {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>

        {selectedDayItems.length === 0 ? (
          <EmptyState icon="calendar-outline" title="Nothing scheduled" message="No task days fall on this date." />
        ) : (
          selectedDayItems.map(({ day, task }) => (
            <View key={day.id} style={styles.itemCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{task!.title}</Text>
                {day.planned_start && (
                  <View style={styles.itemTimeRow}>
                    <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                    <Text style={styles.itemTime}>{formatTime(day.planned_start)}</Text>
                  </View>
                )}
              </View>
              <Badge label={statusLabel(day.status)} color={statusColor(day.status)} />
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  grid: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.sm,
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    paddingVertical: spacing.xs,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 14,
    color: colors.text,
  },
  dayTextMuted: {
    color: colors.border,
  },
  dayTextSelected: {
    color: colors.secondary,
    fontWeight: '700',
  },
  dayTextToday: {
    color: colors.primary,
    fontWeight: '700',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 2,
  },
  dotSelected: {
    backgroundColor: colors.secondary,
  },
  selectedLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  itemTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  itemTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
