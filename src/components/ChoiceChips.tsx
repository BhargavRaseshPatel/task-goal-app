import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Option = { value: string; label: string; color?: string };

type Props = {
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
  multiSelect?: boolean;
};

export default function ChoiceChips({ options, selected, onToggle, multiSelect }: Props) {
  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        const tint = opt.color ?? colors.primary;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onToggle(opt.value)}
            style={[
              styles.chip,
              { borderColor: active ? tint : colors.border, backgroundColor: active ? `${tint}1F` : colors.card },
            ]}
          >
            {!!opt.color && <View style={[styles.dot, { backgroundColor: tint }]} />}
            <Text style={[styles.label, active && { color: tint, fontWeight: '700' }]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
});
