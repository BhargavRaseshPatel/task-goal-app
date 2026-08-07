import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TasksStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { useData } from '../context/DataContext';
import { formatDate, statusColor, statusLabel, taskProgress } from '../utils/format';
import ScreenHeader from '../components/ScreenHeader';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskDetail'>;

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export default function TaskDetailScreen({ navigation, route }: Props) {
  const { tasks, priorities, tagsForTask, recurrenceDaysForTask, taskDays, goals, goalTasks } = useData();
  const task = tasks.find((t) => t.id === route.params.taskId);

  if (!task) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScreenHeader title="Task" onBack={navigation.goBack} />
        <Text style={styles.notFound}>Task not found.</Text>
      </SafeAreaView>
    );
  }

  const priority = priorities.find((p) => p.id === task.priority_id);
  const tags = tagsForTask(task.id);
  const recurrenceDays = recurrenceDaysForTask(task.id);
  const progress = taskProgress(task);
  const days = taskDays.filter((d) => d.task_id === task.id).sort((a, b) => a.day_date.localeCompare(b.day_date));
  const linkedGoals = goalTasks.filter((gt) => gt.task_id === task.id).map((gt) => goals.find((g) => g.id === gt.goal_id)).filter(Boolean);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Task Detail" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{task.title}</Text>
          <Badge label={statusLabel(task.status)} color={statusColor(task.status)} />
        </View>

        {!!task.description && <Text style={styles.description}>{task.description}</Text>}

        <View style={styles.badgeRow}>
          {priority && <Badge label={priority.name} color={priority.color} icon="flag" />}
          {tags.map((t) => <Badge key={t.id} label={t.name} color={t.color} />)}
        </View>

        <View style={styles.dateCard}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Start Date</Text>
            <Text style={styles.dateValue}>{formatDate(task.start_date)}</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={colors.textMuted} />
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>End Date</Text>
            <Text style={styles.dateValue}>{task.end_date ? formatDate(task.end_date) : '—'}</Text>
          </View>
        </View>

        {task.recurrence_target_days > 0 && (
          <>
            <Text style={styles.sectionTitle}>Repeats On</Text>
            <View style={styles.dayRow}>
              {ALL_DAYS.map((d) => (
                <View key={d} style={[styles.dayDot, recurrenceDays.includes(d) && styles.dayDotActive]}>
                  <Text style={[styles.dayDotText, recurrenceDays.includes(d) && styles.dayDotTextActive]}>{d[0]}</Text>
                </View>
              ))}
            </View>

            <View style={styles.progressHeader}>
              <Text style={styles.sectionTitle}>Overall Progress</Text>
              <Text style={styles.progressText}>{task.recurrence_completed_days} of {task.recurrence_target_days} completed</Text>
            </View>
            <ProgressBar progress={progress ?? 0} />
          </>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Task Days ({days.length})</Text>
          {days.length > 0 && (
            <Pressable onPress={() => navigation.navigate('TaskDays', { taskId: task.id })}>
              <Text style={styles.link}>View All</Text>
            </Pressable>
          )}
        </View>
        {days.length === 0 ? (
          <Text style={styles.emptyText}>No task days scheduled yet.</Text>
        ) : (
          days.slice(0, 2).map((d) => (
            <View key={d.id} style={styles.rowCard}>
              <Text style={styles.rowTitle}>{formatDate(d.day_date)}</Text>
              <Badge label={statusLabel(d.status)} color={statusColor(d.status)} />
            </View>
          ))
        )}

        {linkedGoals.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Goals Connected</Text>
            {linkedGoals.map((g) => (
              <View key={g!.id} style={styles.rowCard}>
                <Text style={styles.rowTitle}>{g!.name}</Text>
                <Badge label={statusLabel(g!.status)} color={statusColor(g!.status)} />
              </View>
            ))}
          </>
        )}

        <View style={styles.editButton}>
          <Button title="Edit Task" onPress={() => navigation.navigate('EditTask', { taskId: task.id })} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  notFound: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textMuted,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  dateBlock: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  dayRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  dayDotActive: {
    backgroundColor: colors.primary,
  },
  dayDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  dayDotTextActive: {
    color: colors.secondary,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  link: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  rowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  editButton: {
    marginTop: spacing.xl,
  },
});
