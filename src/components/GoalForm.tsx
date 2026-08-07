import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colorPalette, colors, radius, spacing } from '../theme';
import type { Goal, GoalStatus, Task } from '../types/models';
import { useData } from '../context/DataContext';
import { statusLabel } from '../utils/format';
import Input from './Input';
import DateInput from './DateInput';
import Button from './Button';
import ChoiceChips from './ChoiceChips';
import Stepper from './Stepper';

export type GoalFormValues = Omit<Goal, 'id' | 'created_at' | 'user_id'>;
export type GoalLink = { taskId: number; noOfTimes: number };

type Props = {
  initial?: Goal;
  initialLinks?: GoalLink[];
  onSubmit: (values: GoalFormValues, links: GoalLink[]) => void;
  onCancel: () => void;
  submitLabel: string;
};

const STATUSES: GoalStatus[] = ['not_started', 'in_progress', 'achieved', 'missed'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// A task can only be linked while it's still open work. Already-linked
// tasks stay visible even if their status has since moved on, so editing
// an existing goal never hides a link it already has.
const LINKABLE_STATUSES = new Set(['not_started', 'in_progress']);

export default function GoalForm({ initial, initialLinks = [], onSubmit, onCancel, submitLabel }: Props) {
  const { tasks, goals, goalTasks } = useData();

  const [name, setName] = useState(initial?.name ?? '');
  const [startDate, setStartDate] = useState(initial?.start_date ?? '');
  const [targetDate, setTargetDate] = useState(initial?.target_date ?? '');
  const [status, setStatus] = useState<GoalStatus>(initial?.status ?? 'not_started');
  const [color, setColor] = useState(initial?.color ?? colorPalette[goals.length % colorPalette.length]);
  const [links, setLinks] = useState<GoalLink[]>(initialLinks);
  const [query, setQuery] = useState('');
  const [errors, setErrors] = useState<{ name?: string; startDate?: string; targetDate?: string }>({});

  const visibleTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) &&
      (LINKABLE_STATUSES.has(t.status) || links.some((l) => l.taskId === t.id)),
  );

  // A task's total capacity is its own recurrence target (or 1 for a
  // one-off task -- it can only be "done" once). Other goals may already
  // claim part of that capacity; only what's left can go to this goal.
  const capacityFor = (task: Task) => Math.max(task.recurrence_target_days, 1);
  const claimedElsewhere = (taskId: number) =>
    goalTasks
      .filter((gt) => gt.task_id === taskId && gt.goal_id !== initial?.id)
      .reduce((sum, gt) => sum + gt.no_of_times_task, 0);
  const remainingFor = (task: Task) => Math.max(0, capacityFor(task) - claimedElsewhere(task.id));

  const toggleTask = (task: Task) => {
    if (!links.some((l) => l.taskId === task.id) && remainingFor(task) <= 0) return;
    setLinks((prev) =>
      prev.some((l) => l.taskId === task.id) ? prev.filter((l) => l.taskId !== task.id) : [...prev, { taskId: task.id, noOfTimes: 1 }],
    );
  };

  const setNoOfTimes = (task: Task, value: number) => {
    const capped = Math.min(value, remainingFor(task));
    setLinks((prev) => prev.map((l) => (l.taskId === task.id ? { ...l, noOfTimes: capped } : l)));
  };

  const submit = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Goal name is required';
    if (!DATE_RE.test(startDate)) next.startDate = 'Use YYYY-MM-DD';
    if (!DATE_RE.test(targetDate)) next.targetDate = 'Use YYYY-MM-DD';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSubmit({ name: name.trim(), start_date: startDate, target_date: targetDate, status, color }, links);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input label="Goal Name" placeholder="e.g., Run a Marathon" value={name} onChangeText={setName} error={errors.name} />

        <Text style={styles.sectionLabel}>Color</Text>
        <View style={styles.swatchRow}>
          {colorPalette.map((c) => (
            <Pressable key={c} onPress={() => setColor(c)} style={[styles.swatch, { backgroundColor: c }]}>
              {color === c && <Ionicons name="checkmark" size={16} color={colors.secondary} />}
            </Pressable>
          ))}
        </View>

        <View style={styles.dateRow}>
          <View style={{ flex: 1 }}>
            <DateInput label="Start Date" value={startDate} onChangeText={setStartDate} error={errors.startDate} />
          </View>
          <View style={{ flex: 1 }}>
            <DateInput label="Target Date" value={targetDate} onChangeText={setTargetDate} error={errors.targetDate} />
          </View>
        </View>

        {initial && (
          <>
            <Text style={styles.sectionLabel}>Status</Text>
            <ChoiceChips
              options={STATUSES.map((s) => ({ value: s, label: statusLabel(s) }))}
              selected={[status]}
              onToggle={(v) => setStatus(v as GoalStatus)}
            />
          </>
        )}

        <Text style={styles.sectionLabel}>Linked Tasks</Text>
        <Input placeholder="Search existing tasks..." leftIcon="search-outline" value={query} onChangeText={setQuery} />

        {visibleTasks.map((task) => {
          const link = links.find((l) => l.taskId === task.id);
          const active = !!link;
          const remaining = remainingFor(task);
          const disabled = !active && remaining <= 0;
          return (
            <View key={task.id} style={[styles.taskRow, active && styles.taskRowActive, disabled && styles.taskRowDisabled]}>
              <Pressable style={styles.taskRowLeft} onPress={() => toggleTask(task)} disabled={disabled}>
                <View style={[styles.checkbox, active && styles.checkboxActive]}>
                  {active && <Ionicons name="checkmark" size={14} color={colors.secondary} />}
                </View>
                <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
              </Pressable>
              {active ? (
                <View style={styles.stepperBlock}>
                  <Text style={styles.requiredLabel}>Required (max {remaining})</Text>
                  <Stepper value={link!.noOfTimes} onChange={(v) => setNoOfTimes(task, v)} />
                </View>
              ) : (
                disabled && <Text style={styles.disabledNote}>Fully claimed by another goal</Text>
              )}
            </View>
          );
        })}

        <View style={styles.actions}>
          <View style={{ flex: 1 }}>
            <Button title="Cancel" variant="outline" onPress={onCancel} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title={submitLabel} onPress={submit} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskRow: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  taskRowActive: {
    backgroundColor: `${colors.primary}14`,
  },
  taskRowDisabled: {
    opacity: 0.5,
  },
  disabledNote: {
    fontSize: 12,
    color: colors.danger,
  },
  taskRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  stepperBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requiredLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
});
