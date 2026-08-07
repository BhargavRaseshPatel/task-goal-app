import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import Input from './Input';

type Props = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
};

// No date-picker library is installed, and RN ships no built-in one. On web
// the browser's native <input type="date"> already gives a full pickable
// calendar for free, so use that instead of typed YYYY-MM-DD text there.
// Native (iOS/Android) keeps manual entry -- add
// @react-native-community/datetimepicker if native picking is needed too.
export default function DateInput({ label, value, onChangeText, error }: Props) {
  if (Platform.OS !== 'web') {
    return <Input label={label} placeholder="YYYY-MM-DD" value={value} onChangeText={onChangeText} error={error} leftIcon="calendar-outline" />;
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      {React.createElement('input', {
        type: 'date',
        value,
        onChange: (e: any) => onChangeText(e.target.value),
        style: styles.webInput,
      })}
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  webInput: {
    height: 52,
    width: '100%',
    boxSizing: 'border-box',
    border: `1.5px solid ${colors.border}`,
    borderRadius: radius.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.card,
    fontFamily: 'inherit',
  } as any,
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
