import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import { BREAK_PRESETS } from '../data/breakPresets';

type Props = {
  disabled: boolean;
  onSelect: (title: string) => void;
};

export default function BreakPresetGrid({ disabled, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {BREAK_PRESETS.map((preset) => (
        <Pressable
          key={preset.title}
          disabled={disabled}
          onPress={() => onSelect(preset.title)}
          style={[styles.card, disabled && styles.cardDisabled]}
        >
          <Ionicons name={preset.icon} size={22} color={disabled ? colors.textMuted : colors.primary} />
          <Text style={[styles.title, disabled && styles.titleDisabled]}>{preset.title}</Text>
          <Text style={styles.duration}>{preset.minutesLabel}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '31%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: 4,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  titleDisabled: {
    color: colors.textMuted,
  },
  duration: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
