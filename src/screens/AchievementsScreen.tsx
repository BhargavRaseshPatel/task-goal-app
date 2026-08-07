import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { useData } from '../context/DataContext';
import { formatDate } from '../utils/format';
import ScreenHeader from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';
import type { Achievement, AchievementType } from '../types/models';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Achievements'>;

const ICONS: Record<AchievementType, keyof typeof Ionicons.glyphMap> = {
  task_completed: 'checkmark-circle',
  recurrence_completed: 'repeat',
  goal_achieved: 'flag',
};

const LABELS: Record<AchievementType, string> = {
  task_completed: 'Task Completed',
  recurrence_completed: 'Recurrence Completed',
  goal_achieved: 'Goal Achieved',
};

export default function AchievementsScreen({ navigation }: Props) {
  const { achievements, tasks, goals } = useData();
  const sorted = [...achievements].sort((a, b) => b.achieved_at.localeCompare(a.achieved_at));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Achievements" onBack={navigation.goBack} />

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{tasks.filter((t) => t.status === 'completed').length}</Text>
          <Text style={styles.statLabel}>Tasks Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{goals.filter((g) => g.status === 'achieved').length}</Text>
          <Text style={styles.statLabel}>Goals Achieved</Text>
        </View>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(a) => String(a.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="trophy-outline" title="No achievements yet" message="Complete tasks and hit your goals to start earning achievements." />}
        renderItem={({ item }) => <AchievementCard achievement={item} />}
      />
    </SafeAreaView>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Ionicons name={ICONS[achievement.achievement_type]} size={22} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{achievement.title}</Text>
        <Text style={styles.cardType}>{LABELS[achievement.achievement_type]}</Text>
        <Text style={styles.cardDate}>{formatDate(achievement.achieved_at)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
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
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.accent}1F`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  cardType: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  cardDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
