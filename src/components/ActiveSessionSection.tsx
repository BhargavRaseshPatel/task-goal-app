import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import { useData } from '../context/DataContext';
import { formatTime } from '../utils/format';
import { formatElapsed, useElapsedSeconds } from '../hooks/useElapsedSeconds';
import { iconForActivityTitle } from '../data/breakPresets';
import MicroBreaksSection from './MicroBreaksSection';
import QuickBreakModal from './QuickBreakModal';
import ConfirmDialog from './ConfirmDialog';

const FOCUS_TIP_THRESHOLD_SECONDS = 45 * 60;

function formatMinutes(total: number): string {
  const safe = Math.max(0, total);
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

type Props = {
  // When true (default), the Micro-Breaks grid renders right below the card.
  // Dashboard passes false so it can place that section at the bottom instead.
  showBreaks?: boolean;
  onSeeAllBreaks?: () => void;
};

// The "Active Task"/"Active Break" hero card + focus tip. Optionally the
// Micro-Breaks grid too. Shared between Dashboard and the Tasks screen so
// both show identical, live-synced tracking state rather than two copies.
export default function ActiveSessionSection({ showBreaks = true, onSeeAllBreaks }: Props) {
  const {
    tasks,
    taskDays,
    activityLogs,
    runningSession,
    startableDayIdForTask,
    startActivityLog,
    stopDailyActivity,
    pausedSeconds,
    pauseTracking,
    resumeTracking,
    completeTask,
  } = useData();
  const [breakModalVisible, setBreakModalVisible] = useState(false);
  const [completeTargetId, setCompleteTargetId] = useState<number | null>(null);
  const running = runningSession();
  const isPaused = pausedSeconds != null && running?.kind === 'task';
  const runningStartTime = running?.kind === 'task' ? running.log.start_time : running?.activity.start_time;
  // Freeze the ticking hook while paused so the timer holds its value.
  const elapsedSeconds = useElapsedSeconds(isPaused ? undefined : runningStartTime);
  const shownSeconds = isPaused ? pausedSeconds! : elapsedSeconds;

  // Tasks marked in_progress that aren't currently being timed. Shown with
  // the same card treatment so "in progress" is visible at a glance, not
  // only while a stopwatch happens to be running.
  const idleInProgressTasks = running ? [] : tasks.filter((t) => t.status === 'in_progress');

  const daysForTask = (taskId: number) => taskDays.filter((d) => d.task_id === taskId);

  const trackedMinutes = (taskId: number) => {
    const dayIds = daysForTask(taskId).map((d) => d.id);
    return activityLogs
      .filter((l) => dayIds.includes(l.task_day_id))
      .reduce((sum, l) => sum + (l.duration_minutes ?? 0), 0);
  };

  return (
    <>
      {running && (
        <View style={styles.runningCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.runningIconBadge}>
              <Ionicons
                name={running.kind === 'task' ? 'construct' : iconForActivityTitle(running.activity.title)}
                size={16}
                color={colors.secondary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.runningHeaderRow}>
                <View style={[styles.liveDot, isPaused && styles.pausedDot]} />
                <Text style={styles.runningLabel}>
                  {isPaused ? 'PAUSED' : running.kind === 'task' ? 'ACTIVE TASK' : 'ACTIVE BREAK'}
                </Text>
              </View>
              <Text style={styles.runningTitle} numberOfLines={1}>
                {running.kind === 'task' ? running.task.title : running.activity.title}
              </Text>
            </View>
            <View style={styles.timerBlock}>
              <Text style={styles.runningTimer}>{formatElapsed(shownSeconds)}</Text>
              <Text style={styles.durationSubLabel}>Started {formatTime(runningStartTime!)}</Text>
            </View>
          </View>

          <View style={styles.runningButtonsRow}>
            {running.kind === 'task' ? (
              <>
                {isPaused ? (
                  <Pressable style={styles.pauseButton} onPress={resumeTracking}>
                    <Ionicons name="play" size={14} color={colors.text} />
                    <Text style={styles.pauseButtonText}>Resume</Text>
                  </Pressable>
                ) : (
                  <Pressable style={styles.pauseButton} onPress={pauseTracking}>
                    <Ionicons name="pause" size={14} color={colors.text} />
                    <Text style={styles.pauseButtonText}>Pause</Text>
                  </Pressable>
                )}
                <Pressable style={styles.quickBreakButton} onPress={() => setBreakModalVisible(true)}>
                  <Ionicons name="cafe" size={14} color={colors.secondary} />
                  <Text style={styles.quickBreakButtonText}>Break</Text>
                </Pressable>
                <Pressable
                  style={styles.completeButton}
                  onPress={() => setCompleteTargetId(running.task.id)}
                >
                  <Ionicons name="checkmark-circle-outline" size={14} color={colors.secondary} />
                  <Text style={styles.completeButtonText}>Complete</Text>
                </Pressable>
              </>
            ) : (
              <Pressable style={styles.pauseButton} onPress={() => stopDailyActivity(running.activity.id)}>
                <Ionicons name="stop" size={14} color={colors.text} />
                <Text style={styles.pauseButtonText}>End Break</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {idleInProgressTasks.map((task) => {
        const dayId = startableDayIdForTask(task.id);
        const minutes = trackedMinutes(task.id);
        return (
          <View key={task.id} style={styles.runningCard}>
            <View style={styles.cardTopRow}>
              <View style={styles.runningIconBadge}>
                <Ionicons name="construct" size={16} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.runningHeaderRow}>
                  <View style={styles.liveDot} />
                  <Text style={styles.runningLabel}>ACTIVE TASK</Text>
                </View>
                <Text style={styles.runningTitle} numberOfLines={1}>{task.title}</Text>
              </View>
              <View style={styles.timerBlock}>
                <Text style={styles.runningTimer}>{formatMinutes(minutes)}</Text>
                <Text style={styles.durationSubLabel}>Total tracked</Text>
              </View>
            </View>

            <View style={styles.runningButtonsRow}>
              {dayId !== undefined && (
                <Pressable style={styles.pauseButton} onPress={() => startActivityLog(dayId)}>
                  <Ionicons name="play" size={14} color={colors.text} />
                  <Text style={styles.pauseButtonText}>Start Tracking</Text>
                </Pressable>
              )}
              <Pressable
                style={styles.completeButton}
                onPress={() => setCompleteTargetId(task.id)}
              >
                <Ionicons name="checkmark-circle-outline" size={14} color={colors.secondary} />
                <Text style={styles.completeButtonText}>Complete</Text>
              </Pressable>
            </View>
          </View>
        );
      })}

      {running?.kind === 'task' && elapsedSeconds >= FOCUS_TIP_THRESHOLD_SECONDS && (
        <View style={styles.tipBanner}>
          <Ionicons name="bulb-outline" size={18} color={colors.success} />
          <Text style={styles.tipText}>
            You've been focused for {Math.floor(elapsedSeconds / 60)}m. Take a quick micro-break before continuing.
          </Text>
        </View>
      )}

      {showBreaks && onSeeAllBreaks && <MicroBreaksSection onSeeAll={onSeeAllBreaks} />}

      <QuickBreakModal visible={breakModalVisible} onClose={() => setBreakModalVisible(false)} />

      <ConfirmDialog
        visible={completeTargetId != null}
        title="Complete Task"
        message="Are you sure you want to complete this task?"
        confirmLabel="Complete"
        onCancel={() => setCompleteTargetId(null)}
        onConfirm={() => {
          if (completeTargetId != null) completeTask(completeTargetId);
          setCompleteTargetId(null);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  runningCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  runningHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.danger,
  },
  pausedDot: {
    backgroundColor: colors.warning,
  },
  runningLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: 'rgba(255,255,255,0.8)',
  },
  runningIconBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  runningTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.secondary,
    marginTop: 2,
  },
  timerBlock: {
    alignItems: 'flex-end',
  },
  runningTimer: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.secondary,
    fontVariant: ['tabular-nums'],
  },
  durationSubLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
  runningButtonsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flex: 1,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  pauseButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  quickBreakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flex: 1,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
  },
  quickBreakButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flex: 1,
    height: 38,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  completeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: `${colors.success}1A`,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
});
