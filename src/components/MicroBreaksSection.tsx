import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import { useData } from '../context/DataContext';
import BreakPresetGrid from './BreakPresetGrid';

type Props = {
  onSeeAll: () => void;
};

// "Micro-Breaks & Transitions" header + the preset grid. Split out of
// ActiveSessionSection so the Dashboard can place it at the bottom while
// keeping the active-task card at the top.
export default function MicroBreaksSection({ onSeeAll }: Props) {
  const { runningSession, startDailyActivity } = useData();
  const running = runningSession();

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Micro-Breaks & Transitions</Text>
        <Pressable onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      </View>
      <View style={{ marginBottom: spacing.lg }}>
        <BreakPresetGrid disabled={!!running} onSelect={startDailyActivity} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
