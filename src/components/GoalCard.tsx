import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import type { Goal, GoalTask, Task } from '../types/models';
import { formatDate, goalProgress, statusColor, statusLabel } from '../utils/format';
import Badge from './Badge';
import ProgressBar from './ProgressBar';

type Props = {
  goal: Goal;
  goalTasks: GoalTask[];
  tasks: Task[];
  onPress?: () => void;
};

export default function GoalCard({ goal, goalTasks, tasks, onPress }: Props) {
  const progress = goalProgress(goal, goalTasks, tasks);
  const linkedCount = goalTasks.filter((l) => l.goal_id === goal.id).length;

  return (
    <Pressable onPress={onPress} style={[styles.card, { borderLeftColor: statusColor(goal.status) }]}>
      <View style={styles.headerRow}>
        <View style={[styles.identityDot, { backgroundColor: goal.color }]} />
        <Text style={styles.title} numberOfLines={1}>{goal.name}</Text>
        <Badge label={statusLabel(goal.status)} color={statusColor(goal.status)} />
      </View>

      <View style={styles.dateRow}>
        <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
        <Text style={styles.dateText}>{formatDate(goal.start_date)} – {formatDate(goal.target_date)}</Text>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>{linkedCount} linked task{linkedCount === 1 ? '' : 's'}</Text>
        <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
      </View>
      <ProgressBar progress={progress} color={statusColor(goal.status)} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  identityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  dateText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  progressPct: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
});
