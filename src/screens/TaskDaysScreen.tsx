import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TasksStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { useData } from '../context/DataContext';
import { formatDate, formatTime, statusColor, statusLabel } from '../utils/format';
import { formatElapsed, useElapsedSeconds } from '../hooks/useElapsedSeconds';
import ScreenHeader from '../components/ScreenHeader';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import QuickBreakModal from '../components/QuickBreakModal';
import ConfirmDialog from '../components/ConfirmDialog';
import type { TaskDay } from '../types/models';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskDays'>;

export default function TaskDaysScreen({ navigation, route }: Props) {
  const { tasks, taskDays, runningSession, startActivityLog, pausedSeconds, pauseTracking, resumeTracking, completeTask } = useData();
  const [breakModalVisible, setBreakModalVisible] = useState(false);
  const [completeConfirmVisible, setCompleteConfirmVisible] = useState(false);
  const task = tasks.find((t) => t.id === route.params.taskId);
  const running = runningSession();
  const runningHere = running?.kind === 'task' ? running : null;
  const days = taskDays
    .filter((d) => d.task_id === route.params.taskId)
    .sort((a, b) => a.day_date.localeCompare(b.day_date));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title={task ? task.title : 'Task Days'} onBack={navigation.goBack} />
      <FlatList
        data={days}
        keyExtractor={(d) => String(d.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState icon="calendar-outline" title="No task days yet" message="Task days will appear here as this task's schedule plays out." />
        }
        renderItem={({ item }) => {
          const isHere = runningHere?.taskDay.id === item.id;
          const isPaused = isHere && pausedSeconds != null;
          return (
            <DayCard
              day={item}
              isRunningHere={isHere}
              isOtherRunning={!!running && !isHere}
              isPaused={isPaused}
              frozenSeconds={isPaused ? pausedSeconds ?? undefined : undefined}
              runningStartTime={isHere ? runningHere!.log.start_time : undefined}
              onPress={() => navigation.navigate('ActivityLogs', { taskDayId: item.id })}
              onStart={() => startActivityLog(item.id)}
              onPause={pauseTracking}
              onResume={resumeTracking}
              onQuickBreak={() => setBreakModalVisible(true)}
              onComplete={() => setCompleteConfirmVisible(true)}
            />
          );
        }}
      />
      <QuickBreakModal visible={breakModalVisible} onClose={() => setBreakModalVisible(false)} />
      <ConfirmDialog
        visible={completeConfirmVisible}
        title="Complete Task"
        message="Are you sure you want to complete this task?"
        confirmLabel="Complete"
        onCancel={() => setCompleteConfirmVisible(false)}
        onConfirm={() => {
          completeTask(route.params.taskId);
          setCompleteConfirmVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

function DayCard({
  day,
  isRunningHere,
  isOtherRunning,
  isPaused,
  frozenSeconds,
  runningStartTime,
  onPress,
  onStart,
  onPause,
  onResume,
  onQuickBreak,
  onComplete,
}: {
  day: TaskDay;
  isRunningHere: boolean;
  isOtherRunning: boolean;
  isPaused: boolean;
  frozenSeconds?: number;
  runningStartTime?: string;
  onPress: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onQuickBreak: () => void;
  onComplete: () => void;
}) {
  const elapsedSeconds = useElapsedSeconds(isPaused ? undefined : runningStartTime);
  const shownSeconds = frozenSeconds ?? elapsedSeconds;

  return (
    <View style={[styles.card, isRunningHere && styles.cardRunning]}>
      {/* Separate Pressable from the Start/Stop controls below — nesting a
          Pressable inside a Pressable lets the inner press bubble to the
          outer one on web (react-native-web forwards DOM click events). */}
      <Pressable onPress={onPress}>
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>{formatDate(day.day_date)}</Text>
          <Badge label={statusLabel(day.status)} color={statusColor(day.status)} />
        </View>

        {(day.planned_start || day.planned_end) && (
          <View style={styles.row}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={styles.rowText}>
              {day.planned_start ? formatTime(day.planned_start) : '—'} – {day.planned_end ? formatTime(day.planned_end) : '—'}
            </Text>
          </View>
        )}

        {!!day.rating && (
          <View style={styles.row}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.rowText}>{day.rating}/5</Text>
          </View>
        )}

        {!!day.review && <Text style={styles.review}>{day.review}</Text>}
      </Pressable>

      {isRunningHere ? (
        <View style={styles.trackingBlock}>
          <Text style={styles.trackingLabel}>{isPaused ? 'Paused' : 'Current Duration'}</Text>
          <Text style={styles.trackingTimer}>{formatElapsed(shownSeconds)}</Text>
          <View style={styles.trackingButtonsRow}>
            {isPaused ? (
              <Pressable onPress={onResume} style={styles.pauseButton} hitSlop={8}>
                <Ionicons name="play" size={14} color={colors.text} />
                <Text style={styles.pauseButtonText}>Resume</Text>
              </Pressable>
            ) : (
              <Pressable onPress={onPause} style={styles.pauseButton} hitSlop={8}>
                <Ionicons name="pause" size={14} color={colors.text} />
                <Text style={styles.pauseButtonText}>Pause</Text>
              </Pressable>
            )}
            <Pressable onPress={onQuickBreak} style={styles.quickBreakButton} hitSlop={8}>
              <Ionicons name="cafe" size={14} color={colors.secondary} />
              <Text style={styles.quickBreakButtonText}>Quick Break</Text>
            </Pressable>
          </View>
          <Pressable onPress={onComplete} style={styles.completeButton} hitSlop={8}>
            <Ionicons name="checkmark-circle-outline" size={14} color={colors.primary} />
            <Text style={styles.completeButtonText}>Complete Task</Text>
          </Pressable>
        </View>
      ) : (
        !isOtherRunning && (
          <Pressable onPress={onStart} style={styles.startButton} hitSlop={8}>
            <Ionicons name="play" size={14} color={colors.primary} />
            <Text style={styles.startButtonText}>Start Tracking</Text>
          </Pressable>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardRunning: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  rowText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  review: {
    fontSize: 13,
    color: colors.text,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 8,
  },
  startButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  trackingBlock: {
    marginTop: spacing.sm,
  },
  trackingLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  trackingTimer: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  trackingButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 8,
  },
  pauseButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  quickBreakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingVertical: 8,
  },
  quickBreakButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.secondary,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 8,
  },
  completeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
