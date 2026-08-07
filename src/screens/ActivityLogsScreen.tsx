import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TasksStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { useData } from '../context/DataContext';
import { formatDate, formatTime } from '../utils/format';
import ScreenHeader from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';

type Props = NativeStackScreenProps<TasksStackParamList, 'ActivityLogs'>;

export default function ActivityLogsScreen({ navigation, route }: Props) {
  const { taskDays, activityLogs } = useData();
  const day = taskDays.find((d) => d.id === route.params.taskDayId);
  const logs = activityLogs
    .filter((l) => l.task_day_id === route.params.taskDayId)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title={day ? formatDate(day.day_date) : 'Activity Logs'} onBack={navigation.goBack} />
      <FlatList
        data={logs}
        keyExtractor={(l) => String(l.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState icon="time-outline" title="No activity logged" message="Time-tracking sessions for this task day will show up here." />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconBadge}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.timeText}>
                {formatTime(item.start_time)}{item.end_time ? ` – ${formatTime(item.end_time)}` : ' (in progress)'}
              </Text>
              {!!item.duration_minutes && <Text style={styles.durationText}>{item.duration_minutes} min</Text>}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  durationText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
