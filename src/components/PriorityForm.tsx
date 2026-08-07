import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, colorPalette, radius, spacing } from '../theme';
import type { Priority } from '../types/models';
import Input from './Input';
import Button from './Button';

export type PriorityFormValues = Omit<Priority, 'id' | 'created_at'>;

type Props = {
  initial?: Priority;
  onSubmit: (values: PriorityFormValues) => void;
  onCancel: () => void;
  submitLabel: string;
};

export default function PriorityForm({ initial, onSubmit, onCancel, submitLabel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? colorPalette[2]);
  const [error, setError] = useState<string | undefined>();

  const submit = () => {
    if (!name.trim()) {
      setError('Priority name is required');
      return;
    }
    onSubmit({ name: name.trim(), color });
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={[styles.iconBadge, { backgroundColor: `${color}22` }]}>
        <Ionicons name="flag" size={32} color={color} />
      </View>

      <Input label="Priority Name" placeholder="e.g., Urgent" value={name} onChangeText={setName} error={error} />

      <Text style={styles.sectionLabel}>Color Label</Text>
      <View style={styles.swatchRow}>
        {colorPalette.map((c) => (
          <Pressable key={c} onPress={() => setColor(c)} style={[styles.swatch, { backgroundColor: c }]}>
            {color === c && <Ionicons name="checkmark" size={16} color={colors.secondary} />}
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Preview</Text>
      <View style={[styles.previewCard, { borderLeftColor: color }]}>
        <Text style={styles.previewTitle}>{name.trim() || 'Priority Name'}</Text>
        <Text style={styles.previewSubtitle}>This is how your priority will look on task cards.</Text>
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
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  iconBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    padding: spacing.md,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  previewSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
});
