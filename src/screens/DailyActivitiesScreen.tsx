import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { useData } from '../context/DataContext';
import { formatTime } from '../utils/format';
import { formatElapsed, useElapsedSeconds } from '../hooks/useElapsedSeconds';
import { iconForActivityTitle } from '../data/breakPresets';
import Badge from '../components/Badge';
import BreakPresetGrid from '../components/BreakPresetGrid';
import EmptyState from '../components/EmptyState';
import ScreenHeader from '../components/ScreenHeader';
import type { DailyActivity, Tag } from '../types/models';

type Props = NativeStackScreenProps<DashboardStackParamList, 'DailyActivities'>;

export default function DailyActivitiesScreen({ navigation }: Props) {
  const { dailyActivities, tags, runningSession, startDailyActivity, stopDailyActivity } = useData();
  const sorted = [...dailyActivities].sort((a, b) => b.start_time.localeCompare(a.start_time));
  const running = runningSession();
  const runningBreak = running?.kind === 'daily' ? running.activity : null;
  const isBlocked = !!running;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Daily Activities" onBack={navigation.goBack} />

      <FlatList
        data={sorted}
        keyExtractor={(a) => String(a.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {runningBreak && <RunningBreakCard activity={runningBreak} onStop={() => stopDailyActivity(runningBreak.id)} />}

            <Text style={styles.sectionTitle}>Take a Break</Text>
            <View style={{ marginBottom: spacing.lg }}>
              <BreakPresetGrid disabled={isBlocked} onSelect={startDailyActivity} />
            </View>

            <Text style={styles.sectionTitle}>History</Text>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="walk-outline"
            title="No activities logged"
            message="Activities you log throughout the day will show up here in order."
          />
        }
        renderItem={({ item }) => <ActivityCard activity={item} tags={tags} />}
      />
    </SafeAreaView>
  );
}

function RunningBreakCard({ activity, onStop }: { activity: DailyActivity; onStop: () => void }) {
  const elapsedSeconds = useElapsedSeconds(activity.start_time);

  return (
    <View style={styles.runningCard}>
      <View style={styles.runningLeft}>
        <Ionicons name={iconForActivityTitle(activity.title)} size={20} color={colors.secondary} />
        <View>
          <Text style={styles.runningLabel}>NOW RUNNING</Text>
          <Text style={styles.runningTitle}>{activity.title}</Text>
        </View>
      </View>
      <View style={styles.runningRight}>
        <Text style={styles.runningTimer}>{formatElapsed(elapsedSeconds)}</Text>
        <Pressable onPress={onStop} style={styles.stopButton} hitSlop={8}>
          <Ionicons name="stop" size={16} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

function ActivityCard({ activity, tags }: { activity: DailyActivity; tags: Tag[] }) {
  const tag = tags.find((t) => t.id === activity.tag_id);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={iconForActivityTitle(activity.title)} size={16} color={colors.primary} />
        <Text style={styles.cardTitle} numberOfLines={1}>{activity.title}</Text>
        {tag && <Badge label={tag.name} color={tag.color} />}
      </View>
      <Text style={styles.timeText}>
        {formatTime(activity.start_time)}
        {activity.end_time ? ` – ${formatTime(activity.end_time)}` : ' (in progress)'}
        {activity.duration_minutes ? `  ·  ${activity.duration_minutes} min` : ''}
      </Text>
      {!!activity.notes && <Text style={styles.notes}>{activity.notes}</Text>}
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  runningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  runningLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  runningLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: 'rgba(255,255,255,0.8)',
  },
  runningTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.secondary,
  },
  runningRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  runningTimer: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.secondary,
    fontVariant: ['tabular-nums'],
  },
  stopButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  timeText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  notes: {
    fontSize: 13,
    color: colors.text,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
});
