import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import type { DayName, Task, TaskStatus } from '../types/models';
import { useData } from '../context/DataContext';
import { statusLabel } from '../utils/format';
import Input from './Input';
import DateInput from './DateInput';
import Button from './Button';
import ChoiceChips from './ChoiceChips';

export type TaskFormValues = Omit<Task, 'id' | 'created_at' | 'user_id'>;

type Props = {
  initial?: Task;
  initialTagIds?: number[];
  initialRecurrenceDays?: DayName[];
  onSubmit: (values: TaskFormValues, tagIds: number[], recurrenceDays: DayName[]) => void;
  onCancel: () => void;
  submitLabel: string;
};

const STATUSES: TaskStatus[] = ['not_started', 'in_progress', 'completed', 'paused'];
const DAY_NAMES: DayName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_TAGS = 2;
// Same fixed mock "today" Dashboard/Calendar use, so a task started today
// actually shows up under their "today" filters.
const TODAY = '2026-08-02';

export default function TaskForm({ initial, initialTagIds = [], initialRecurrenceDays = [], onSubmit, onCancel, submitLabel }: Props) {
  const { priorities, tags } = useData();
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [priorityId, setPriorityId] = useState<number | null>(initial?.priority_id ?? null);
  const [startDate, setStartDate] = useState(initial?.start_date ?? '');
  const [endDate, setEndDate] = useState(initial?.end_date ?? '');
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'not_started');
  const [tagIds, setTagIds] = useState<number[]>(initialTagIds);
  const [repeatEnabled, setRepeatEnabled] = useState((initial?.recurrence_target_days ?? 0) > 0);
  const [recurrenceDays, setRecurrenceDays] = useState<DayName[]>(initialRecurrenceDays);
  const [recurrenceTargetDays, setRecurrenceTargetDays] = useState(String(initial?.recurrence_target_days ?? 0));
  const [recurrenceCompletedDays, setRecurrenceCompletedDays] = useState(String(initial?.recurrence_completed_days ?? 0));
  const [isRecurrenceCompleted, setIsRecurrenceCompleted] = useState(initial?.is_recurrence_completed ?? false);
  const [errors, setErrors] = useState<{ title?: string; priority?: string; startDate?: string; endDate?: string }>({});

  const toggleTag = (value: string) => {
    const id = Number(value);
    setTagIds((prev) => {
      if (prev.includes(id)) return prev.filter((t) => t !== id);
      if (prev.length >= MAX_TAGS) return prev;
      return [...prev, id];
    });
  };

  const toggleDay = (value: string) => {
    const day = value as DayName;
    setRecurrenceDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const submit = () => {
    const next: typeof errors = {};
    if (!title.trim()) next.title = 'Title is required';
    if (priorityId == null) next.priority = 'Select a priority';
    if (!DATE_RE.test(startDate)) next.startDate = 'Select a start date';
    if (endDate && !DATE_RE.test(endDate)) next.endDate = 'Use YYYY-MM-DD';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSubmit(
      {
        priority_id: priorityId!,
        title: title.trim(),
        description: description.trim() || undefined,
        start_date: startDate,
        end_date: endDate || undefined,
        status,
        recurrence_target_days: repeatEnabled ? Number(recurrenceTargetDays) || 0 : 0,
        recurrence_completed_days: repeatEnabled ? Number(recurrenceCompletedDays) || 0 : 0,
        is_recurrence_completed: repeatEnabled ? isRecurrenceCompleted : false,
      },
      tagIds,
      repeatEnabled ? recurrenceDays : [],
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input label="Title" placeholder="e.g., Prepare Q3 Marketing Report" value={title} onChangeText={setTitle} error={errors.title} />
        <Input
          label="Description"
          placeholder="Add any necessary details..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.sectionLabel}>Priority</Text>
        <ChoiceChips
          options={priorities.map((p) => ({ value: String(p.id), label: p.name, color: p.color }))}
          selected={priorityId ? [String(priorityId)] : []}
          onToggle={(v) => setPriorityId(Number(v))}
        />
        {!!errors.priority && <Text style={styles.fieldError}>{errors.priority}</Text>}

        {!isEdit && (
          <View style={styles.repeatHeader}>
            <Text style={styles.sectionLabel}>Start Date</Text>
            <Pressable onPress={() => setStartDate(TODAY)} hitSlop={8}>
              <Text style={styles.startNow}>Start Now</Text>
            </Pressable>
          </View>
        )}
        <View style={styles.dateRow}>
          <View style={{ flex: 1 }}>
            <DateInput label={isEdit ? 'Start Date' : ''} value={startDate} onChangeText={setStartDate} error={errors.startDate} />
          </View>
          <View style={{ flex: 1 }}>
            <DateInput label="End Date (optional)" value={endDate} onChangeText={setEndDate} error={errors.endDate} />
          </View>
        </View>

        {isEdit && (
          <>
            <Text style={styles.sectionLabel}>Status</Text>
            <ChoiceChips
              options={STATUSES.map((s) => ({ value: s, label: statusLabel(s) }))}
              selected={[status]}
              onToggle={(v) => setStatus(v as TaskStatus)}
            />
          </>
        )}

        <Text style={styles.sectionLabel}>Tags</Text>
        <Text style={styles.helperText}>Select up to {MAX_TAGS}</Text>
        <ChoiceChips
          options={tags.map((t) => ({ value: String(t.id), label: t.name, color: t.color }))}
          selected={tagIds.map(String)}
          onToggle={toggleTag}
        />

        <View style={styles.repeatBlock}>
          <View style={styles.repeatHeader}>
            <Text style={styles.repeatTitle}>Repeat this task</Text>
            <Switch value={repeatEnabled} onValueChange={setRepeatEnabled} trackColor={{ true: colors.primary }} />
          </View>

          {repeatEnabled && (
            <>
              <ChoiceChips
                options={DAY_NAMES.map((d) => ({ value: d, label: d.slice(0, 1) }))}
                selected={recurrenceDays}
                onToggle={toggleDay}
              />
              <Input
                label="Recurrence Target Days"
                keyboardType="number-pad"
                value={recurrenceTargetDays}
                onChangeText={setRecurrenceTargetDays}
              />
              {isEdit && (
                <>
                  <Input
                    label="Recurrence Completed Days"
                    keyboardType="number-pad"
                    value={recurrenceCompletedDays}
                    onChangeText={setRecurrenceCompletedDays}
                  />
                  <View style={styles.repeatHeader}>
                    <Text style={styles.repeatTitle}>Is Recurrence Completed</Text>
                    <Switch value={isRecurrenceCompleted} onValueChange={setIsRecurrenceCompleted} trackColor={{ true: colors.primary }} />
                  </View>
                </>
              )}
            </>
          )}
        </View>

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
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
  fieldError: {
    color: colors.danger,
    fontSize: 12,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
  startNow: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  repeatBlock: {
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.md,
  },
  repeatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  repeatTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
});
