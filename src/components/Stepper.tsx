import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
};

export default function Stepper({ value, onChange, min = 1 }: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={() => onChange(Math.max(min, value - 1))} style={styles.button} hitSlop={6}>
        <Ionicons name="remove" size={16} color={colors.text} />
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable onPress={() => onChange(value + 1)} style={styles.button} hitSlop={6}>
        <Ionicons name="add" size={16} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
});
