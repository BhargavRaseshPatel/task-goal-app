import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { useData } from '../context/DataContext';
import ScreenHeader from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';
import type { Priority } from '../types/models';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ManagePriorities'>;

export default function ManagePrioritiesScreen({ navigation }: Props) {
  const { priorities, tasks } = useData();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Manage Priorities"
        onBack={navigation.goBack}
        // right={
        //   <Pressable onPress={() => navigation.navigate('AddPriority')} hitSlop={10}>
        //     <Ionicons name="add-circle" size={26} color={colors.primary} />
        //   </Pressable>
        // }
      />
      <FlatList
        data={priorities}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="flag-outline" title="No priorities yet" message="Add a priority to label how urgent your tasks are." />}
        renderItem={({ item }) => (
          <PriorityRow
            priority={item}
            count={tasks.filter((t) => t.priority_id === item.id).length}
            // onEdit={() => navigation.navigate('EditPriority', { priorityId: item.id })}
          />
        )}
      />
    </SafeAreaView>
  );
}

function PriorityRow({ priority, count, onEdit }: { priority: Priority; count: number; onEdit?: () => void }) {
  return (
    <View style={[styles.row, { borderLeftColor: priority.color }]}>
      <View style={[styles.iconBadge, { backgroundColor: `${priority.color}22` }]}>
        <Ionicons name="flag" size={18} color={priority.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{priority.name}</Text>
        <Text style={styles.rowSubtitle}>{count} task{count === 1 ? '' : 's'}</Text>
      </View>
      {/* <Pressable onPress={onEdit} hitSlop={8} style={styles.iconButton}>
        <Ionicons name="pencil" size={16} color={colors.textMuted} />
      </Pressable> */}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  iconButton: {
    padding: 6,
  },
});
