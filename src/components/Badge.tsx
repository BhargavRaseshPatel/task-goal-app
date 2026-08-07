import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius } from '../theme';

type Props = { label: string; color: string; icon?: keyof typeof Ionicons.glyphMap };

export default function Badge({ label, color, icon }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}1F` }]}>
      {icon && <Ionicons name={icon} size={10} color={color} />}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
