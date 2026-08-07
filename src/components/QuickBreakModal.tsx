import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { useData } from '../context/DataContext';
import BreakPresetGrid from './BreakPresetGrid';

type Props = {
  visible: boolean;
  onClose: () => void;
};

// Popup shown when the user taps "Quick Break" on a running task. Picking a
// preset ends the task session and starts that break (via quickBreak); the
// grid is intentionally enabled here since switching is the whole point.
export default function QuickBreakModal({ visible, onClose }: Props) {
  const { quickBreak } = useData();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Stop taps inside the sheet from closing it via the backdrop. */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>Take a Quick Break</Text>
          <Text style={styles.subtitle}>This pauses the task and starts your break.</Text>

          <BreakPresetGrid
            disabled={false}
            onSelect={(title) => {
              quickBreak(title);
              onClose();
            }}
          />

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  cancelButton: {
    marginTop: spacing.lg,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
});
