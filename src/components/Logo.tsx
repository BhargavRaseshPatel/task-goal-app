import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';

export default function Logo({ size = 72, showName = true }: { size?: number; showName?: boolean }) {
  return (
    <View style={styles.container}>
      <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2 }]}>
        <Ionicons name="checkmark-done-circle" size={size * 0.6} color={colors.secondary} />
      </View>
      {showName && (
        <>
          <Text style={styles.name}>Task & Goal</Text>
          <Text style={styles.tagline}>Plan your days. Reach your goals.</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  tagline: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
