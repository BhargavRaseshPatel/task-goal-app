import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { GoalsStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { useData } from '../context/DataContext';
import { formatDate, goalProgress, statusColor, statusLabel } from '../utils/format';
import ScreenHeader from '../components/ScreenHeader';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';

type Props = NativeStackScreenProps<GoalsStackParamList, 'GoalDetail'>;

export default function GoalDetailScreen({ navigation, route }: Props) {
  const { goals, goalTasksFor, tasks, runningSession, startTaskToday, stopActivityLog } = useData();
  const running = runningSession();
  const goal = goals.find((g) => g.id === route.params.goalId);

  if (!goal) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScreenHeader title="Goal" onBack={navigation.goBack} />
        <Text style={styles.notFound}>Goal not found.</Text>
      </SafeAreaView>
    );
  }

  const links = goalTasksFor(goal.id);
  const progress = goalProgress(goal, links, tasks);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Goal Details" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.identityBadge, { backgroundColor: `${goal.color}22` }]}>
          <Ionicons name="flag" size={28} color={goal.color} />
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.title}>{goal.name}</Text>
          <Badge label={statusLabel(goal.status)} color={statusColor(goal.status)} />
        </View>

        <View style={styles.dateRow}>
          <View style={styles.dateCard}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <View>
              <Text style={styles.dateLabel}>Start</Text>
              <Text style={styles.dateValue}>{formatDate(goal.start_date)}</Text>
            </View>
          </View>
          <View style={styles.dateCard}>
            <Ionicons name="flag-outline" size={16} color={colors.primary} />
            <View>
              <Text style={styles.dateLabel}>Target</Text>
              <Text style={styles.dateValue}>{formatDate(goal.target_date)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.ringWrap}>
          <Text style={styles.ringPct}>{Math.round(progress * 100)}%</Text>
          <Text style={styles.ringLabel}>COMPLETED</Text>
          <View style={{ marginTop: spacing.md, width: '100%' }}>
            <ProgressBar progress={progress} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Linked Tasks</Text>
        {links.length === 0 ? (
          <Text style={styles.emptyText}>No tasks linked to this goal yet.</Text>
        ) : (
          links.map((link) => {
            const task = tasks.find((t) => t.id === link.task_id);
            if (!task) return null;
            const completed = task.recurrence_target_days > 0
              ? Math.min(task.recurrence_completed_days, link.no_of_times_task)
              : task.status === 'completed' ? link.no_of_times_task : 0;
            const isRunningHere = running?.kind === 'task' && running.task.id === task.id;
            return (
              <View key={link.id} style={styles.taskRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                  <View style={{ marginTop: spacing.xs }}>
                    <ProgressBar progress={link.no_of_times_task > 0 ? completed / link.no_of_times_task : 0} />
                  </View>
                </View>
                <Text style={styles.taskCount}>{completed} / {link.no_of_times_task}</Text>
                {isRunningHere ? (
                  <Pressable
                    onPress={() => stopActivityLog(running.log.id)}
                    style={[styles.trackButton, styles.trackButtonActive]}
                    hitSlop={8}
                  >
                    <Ionicons name="pause" size={16} color={colors.secondary} />
                  </Pressable>
                ) : (
                  task.status !== 'completed' && (
                    <Pressable
                      disabled={!!running}
                      onPress={() => startTaskToday(task.id)}
                      style={[styles.trackButton, !!running && styles.trackButtonDisabled]}
                      hitSlop={8}
                    >
                      <Ionicons name="play" size={16} color={running ? colors.textMuted : colors.primary} />
                    </Pressable>
                  )
                )}
              </View>
            );
          })
        )}

        <View style={styles.editButton}>
          <Button title="Edit Goal" onPress={() => navigation.navigate('EditGoal', { goalId: goal.id })} />
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
  identityBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
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
  dateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  dateCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  dateLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  ringWrap: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  ringPct: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.primary,
  },
  ringLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  taskCount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  trackButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackButtonActive: {
    backgroundColor: colors.primary,
  },
  trackButtonDisabled: {
    borderColor: colors.border,
  },
  editButton: {
    marginTop: spacing.xl,
  },
});
