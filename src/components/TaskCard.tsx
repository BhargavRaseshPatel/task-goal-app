import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import type { Priority, Tag, Task } from '../types/models';
import { formatDate, statusColor, statusLabel, taskProgress } from '../utils/format';
import Badge from './Badge';
import ProgressBar from './ProgressBar';

type Props = {
  task: Task;
  priority?: Priority;
  tags: Tag[];
  onPress?: () => void;
  // Shown as a "Start" pill when this task has a Task_Day scheduled for
  // today that hasn't been started yet.
  onStart?: () => void;
};

export default function TaskCard({ task, priority, tags, onPress, onStart }: Props) {
  const progress = taskProgress(task);

  return (
    <View style={[styles.card, { borderLeftColor: priority?.color ?? colors.border }]}>
      {/* Separate Pressable from the Start button below -- nesting a
          Pressable inside a Pressable lets the inner press bubble to the
          outer one on web (react-native-web forwards DOM click events). */}
      <Pressable onPress={onPress}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{task.title}</Text>
          <Badge label={statusLabel(task.status)} color={statusColor(task.status)} />
        </View>

        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <Text style={styles.dateText}>
            {formatDate(task.start_date)}{task.end_date ? ` – ${formatDate(task.end_date)}` : ''}
          </Text>
        </View>

        {progress !== null && (
          <View style={styles.progressRow}>
            <ProgressBar progress={progress} />
            <Text style={styles.progressText}>{task.recurrence_completed_days}/{task.recurrence_target_days} days</Text>
          </View>
        )}

        <View style={styles.footerRow}>
          {priority && <Badge label={priority.name} color={priority.color} icon="flag" />}
          {tags.map((tag) => (
            <Badge key={tag.id} label={tag.name} color={tag.color} />
          ))}
        </View>
      </Pressable>

      {onStart && (
        <Pressable style={styles.startButton} onPress={onStart} hitSlop={8}>
          <Ionicons name="play" size={12} color={colors.primary} />
          <Text style={styles.startButtonText}>Start Today's Tracking</Text>
        </Pressable>
      )}
    </View>
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
    alignItems: 'flex-start',
    gap: spacing.sm,
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
    marginTop: spacing.sm,
  },
  progressText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
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
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
