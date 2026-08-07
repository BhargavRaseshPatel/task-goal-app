import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TasksStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { useData } from '../context/DataContext';
import type { TaskStatus } from '../types/models';
import { statusLabel } from '../utils/format';
import TaskCard from '../components/TaskCard';
import ActiveSessionSection from '../components/ActiveSessionSection';
import EmptyState from '../components/EmptyState';

type Filter = 'all' | TaskStatus;
type Sort = 'date' | 'priority';
type Props = NativeStackScreenProps<TasksStackParamList, 'TasksList'>;

const FILTERS: Filter[] = ['all', 'not_started', 'in_progress', 'completed', 'paused'];

export default function TasksScreen({ navigation }: Props) {
  const { tasks, priorities, taskTags, tags, runningSession, startTaskToday } = useData();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('date');
  const running = runningSession();

  const visibleTasks = useMemo(() => {
    let list = tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()));
    if (filter !== 'all') list = list.filter((t) => t.status === filter);
    return [...list].sort((a, b) => {
      if (sort === 'date') return a.start_date.localeCompare(b.start_date);
      return a.priority_id - b.priority_id;
    });
  }, [tasks, query, filter, sort]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            placeholder="Search tasks..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
        </View>
        <Pressable
          style={styles.iconButton}
          onPress={() => setSort((s) => (s === 'date' ? 'priority' : 'date'))}
        >
          <Ionicons name="swap-vertical-outline" size={20} color={colors.text} />
        </Pressable>
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
        data={visibleTasks}
        keyExtractor={(t) => String(t.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<ActiveSessionSection showBreaks={false} />}
        ListEmptyComponent={
          <EmptyState
            icon="checkmark-done-circle-outline"
            title="No tasks found"
            message="Try a different search or filter, or add a new task to get started."
          />
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            priority={priorities.find((p) => p.id === item.priority_id)}
            tags={taskTags.filter((tt) => tt.task_id === item.id).map((tt) => tags.find((t) => t.id === tt.tag_id)!).filter(Boolean)}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            onStart={!running && item.status !== 'completed' ? () => startTaskToday(item.id) : undefined}
          />
        )}
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('AddTask')}>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 46,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
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
