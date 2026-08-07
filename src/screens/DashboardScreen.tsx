import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { useData } from '../context/DataContext';
import { formatDateLong, formatTime, goalProgress, statusColor, statusLabel } from '../utils/format';
import Badge from '../components/Badge';
import ActiveSessionSection from '../components/ActiveSessionSection';
import MicroBreaksSection from '../components/MicroBreaksSection';
import AddTaskFab from '../components/AddTaskFab';
import ProgressBar from '../components/ProgressBar';
import { BREAK_PRESETS } from '../data/breakPresets';
import { useAuth } from '../context/AuthContext';

const BREAK_TITLES = new Set(BREAK_PRESETS.map((p) => p.title));

type Props = NativeStackScreenProps<DashboardStackParamList, 'DashboardHome'>;

const TODAY = '2026-08-02';

export default function DashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { dailyActivities, goalTasks, goals, taskDays, tasks } = useData();
  const todaysTaskDays = taskDays.filter((d) => d.day_date === TODAY);
  const activeGoals = goals.filter((g) => g.status === 'in_progress' || g.status === 'not_started');
  const todaysActivities = dailyActivities
    .filter((a) => a.start_time.startsWith(TODAY))
    .sort((a, b) => b.start_time.localeCompare(a.start_time));
  const topGoals = goals.filter((g) => g.status === 'in_progress').slice(0, 2);

  const microBreakCount = dailyActivities.filter((a) => BREAK_TITLES.has(a.title)).length;
  const stats = [
    { icon: 'checkmark-done-outline' as const, value: tasks.filter((t) => t.status !== 'completed').length, label: 'Tasks' },
    { icon: 'cafe-outline' as const, value: microBreakCount, label: 'Micro-Breaks' },
    { icon: 'flag-outline' as const, value: activeGoals.length, label: 'Goals' },
  ];

  const firstName = user?.name.split(' ')[0] ?? 'there';
  const dateLabel = formatDateLong(TODAY);
  const goToTab = (name: 'Tasks' | 'Goals') => (navigation.getParent() as any)?.navigate(name);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good Morning, {firstName}</Text>
            <Text style={styles.dateText}>{dateLabel}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName[0]}</Text>
          </View>
        </View>

        <ActiveSessionSection showBreaks={false} />

        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon} size={20} color={colors.primary} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Today's Tasks" onSeeAll={() => goToTab('Tasks')} />
        {todaysTaskDays.length === 0 ? (
          <Text style={styles.emptyText}>Nothing scheduled for today.</Text>
        ) : (
          todaysTaskDays.map((day) => {
            const task = tasks.find((t) => t.id === day.task_id);
            if (!task) return null;
            return (
              <View key={day.id} style={styles.rowCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{task.title}</Text>
                  {day.planned_start && (
                    <Text style={styles.rowSubtitle}>{formatTime(day.planned_start)} – {day.planned_end ? formatTime(day.planned_end) : ''}</Text>
                  )}
                </View>
                <Badge label={statusLabel(day.status)} color={statusColor(day.status)} />
              </View>
            );
          })
        )}

        <SectionHeader title="Goal Progress" onSeeAll={() => goToTab('Goals')} />
        {topGoals.map((goal) => (
          <View key={goal.id} style={styles.rowCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={1}>{goal.name}</Text>
              <View style={{ marginTop: spacing.xs }}>
                <ProgressBar progress={goalProgress(goal, goalTasks, tasks)} />
              </View>
            </View>
            <Text style={styles.goalPct}>{Math.round(goalProgress(goal, goalTasks, tasks) * 100)}%</Text>
          </View>
        ))}

        <SectionHeader title="Today's Daily Activities" onSeeAll={() => navigation.navigate('DailyActivities')} />
        {todaysActivities.length === 0 ? (
          <Text style={styles.emptyText}>No activities logged today.</Text>
        ) : (
          todaysActivities.map((activity) => (
            <View key={activity.id} style={styles.rowCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>{activity.title}</Text>
                <Text style={styles.rowSubtitle}>
                  {formatTime(activity.start_time)} · {activity.duration_minutes ? `${activity.duration_minutes} min` : 'in progress'}
                </Text>
              </View>
            </View>
          ))
        )}

        <MicroBreaksSection onSeeAll={() => navigation.navigate('DailyActivities')} />
      </ScrollView>

      <AddTaskFab onCreateTask={() => (navigation.getParent() as any)?.navigate('Tasks', { screen: 'AddTask' })} />
    </SafeAreaView>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onSeeAll}>
        <Text style={styles.seeAll}>See All</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  dateText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.secondary,
    fontWeight: '700',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  goalPct: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
