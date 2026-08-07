import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, colorPalette, radius, spacing } from '../theme';
import type { Tag } from '../types/models';
import Input from './Input';
import Button from './Button';
import Badge from './Badge';

export type TagFormValues = Omit<Tag, 'id' | 'created_at' | 'user_id'>;

type Props = {
  initial?: Tag;
  onSubmit: (values: TagFormValues) => void;
  onCancel: () => void;
  submitLabel: string;
};

export default function TagForm({ initial, onSubmit, onCancel, submitLabel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? colorPalette[0]);
  const [error, setError] = useState<string | undefined>();

  const submit = () => {
    if (!name.trim()) {
      setError('Tag name is required');
      return;
    }
    onSubmit({ name: name.trim(), color });
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Input label="Tag Name" placeholder="e.g., Work, Health, Urgent" value={name} onChangeText={setName} error={error} />

      <Text style={styles.sectionLabel}>Select Color</Text>
      <View style={styles.swatchRow}>
        {colorPalette.map((c) => (
          <Pressable key={c} onPress={() => setColor(c)} style={[styles.swatch, { backgroundColor: c }]}>
            {color === c && <Ionicons name="checkmark" size={16} color={colors.secondary} />}
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Preview</Text>
      <View style={styles.previewBox}>
        <Badge label={name.trim() || 'New Tag'} color={color} />
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
  previewBox: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
});
