import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { GoalsStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { useData } from '../context/DataContext';
import type { GoalStatus } from '../types/models';
import { statusLabel } from '../utils/format';
import GoalCard from '../components/GoalCard';
import EmptyState from '../components/EmptyState';

type Filter = 'all' | GoalStatus;
type Props = NativeStackScreenProps<GoalsStackParamList, 'GoalsList'>;
const FILTERS: Filter[] = ['all', 'not_started', 'in_progress', 'achieved', 'missed'];

export default function GoalsScreen({ navigation }: Props) {
  const { goals, goalTasks, tasks } = useData();
  const [filter, setFilter] = useState<Filter>('all');

  const visibleGoals = useMemo(
    () => (filter === 'all' ? goals : goals.filter((g) => g.status === filter)),
    [goals, filter],
  );

  const inProgressCount = goals.filter((g) => g.status === 'in_progress').length;
  const missedCount = goals.filter((g) => g.status === 'missed').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Goals</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
          <Text style={[styles.statLabel, { color: colors.primary }]}>IN PROGRESS</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>{inProgressCount} Active</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.statLabel, { color: colors.danger }]}>MISSED</Text>
          <Text style={[styles.statValue, { color: colors.danger }]}>{missedCount} Review</Text>
        </View>
      </View>

      <FlatList
        data={FILTERS}
        keyExtractor={(f) => f}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setFilter(item)}
            style={[styles.filterChip, filter === item && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filter === item && styles.filterChipTextActive]}>
              {item === 'all' ? 'All' : statusLabel(item)}
            </Text>
          </Pressable>
        )}
      />

      <FlatList
        data={visibleGoals}
        keyExtractor={(g) => String(g.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="flag-outline"
            title="No goals here"
            message="Set a new goal and link tasks to start tracking progress."
          />
        }
        renderItem={({ item }) => (
          <GoalCard
            goal={item}
            goalTasks={goalTasks}
            tasks={tasks}
            onPress={() => navigation.navigate('GoalDetail', { goalId: item.id })}
          />
        )}
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('AddGoal')}>
        <Ionicons name="add" size={28} color={colors.secondary} />
      </Pressable>
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
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  filterRow: {
    marginTop: spacing.md,
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.card,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: colors.secondary,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
