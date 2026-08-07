import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import { useData } from '../context/DataContext';

type Props = {
  onCreateTask: () => void;
};

type Step = 'closed' | 'menu' | 'urgent';

// Home screen's "+" FAB: a two-option menu (Create Task / Create Urgent
// Task). Urgent skips the full form -- just a title, and an optional
// "Start Now" that stops whatever's running and starts this task instead.
export default function AddTaskFab({ onCreateTask }: Props) {
  const { createUrgentTask } = useData();
  const [step, setStep] = useState<Step>('closed');
  const [title, setTitle] = useState('');
  const [startNow, setStartNow] = useState(true);

  const close = () => {
    setStep('closed');
    setTitle('');
    setStartNow(true);
  };

  const submitUrgent = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    createUrgentTask(trimmed, startNow);
    close();
  };

  return (
    <>
      <Pressable style={styles.fab} onPress={() => setStep('menu')}>
        <Ionicons name="add" size={28} color={colors.secondary} />
      </Pressable>

      <Modal visible={step !== 'closed'} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          {/* Stop taps inside the sheet from closing it via the backdrop. */}
          <Pressable style={styles.sheet} onPress={() => {}}>
            {step === 'menu' && (
              <>
                <Text style={styles.title}>Add</Text>
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    setStep('closed');
                    onCreateTask();
                  }}
                >
                  <View style={styles.optionIcon}>
                    <Ionicons name="checkmark-done-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionTitle}>Create Task</Text>
                    <Text style={styles.optionSubtitle}>Full task with schedule, tags & priority</Text>
                  </View>
                </Pressable>
                <Pressable style={styles.option} onPress={() => setStep('urgent')}>
                  <View style={[styles.optionIcon, styles.optionIconUrgent]}>
                    <Ionicons name="flash" size={20} color={colors.danger} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionTitle}>Create Urgent Task</Text>
                    <Text style={styles.optionSubtitle}>Just a title -- start tracking right away</Text>
                  </View>
                </Pressable>
                <Pressable style={styles.cancelButton} onPress={close}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </>
            )}

            {step === 'urgent' && (
              <>
                <Text style={styles.title}>Urgent Task</Text>
                <TextInput
                  autoFocus
                  placeholder="Task title"
                  placeholderTextColor={colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                />
                <Pressable style={styles.switchRow} onPress={() => setStartNow((v) => !v)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.switchLabel}>Start now</Text>
                    <Text style={styles.optionSubtitle}>Stops whatever's currently running and starts this instead</Text>
                  </View>
                  <Switch value={startNow} onValueChange={setStartNow} trackColor={{ true: colors.primary }} />
                </Pressable>
                <Pressable
                  style={[styles.createButton, !title.trim() && styles.createButtonDisabled]}
                  onPress={submitUrgent}
                  disabled={!title.trim()}
                >
                  <Text style={styles.createButtonText}>Create</Text>
                </Pressable>
                <Pressable style={styles.cancelButton} onPress={close}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
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
    marginBottom: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconUrgent: {
    backgroundColor: `${colors.danger}1A`,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  optionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  createButton: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.secondary,
  },
  cancelButton: {
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
