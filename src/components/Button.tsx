import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, GestureResponderEvent } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Variant = 'primary' | 'outline';

type Props = {
  title: string;
  onPress: (e: GestureResponderEvent) => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
};

export default function Button({ title, onPress, variant = 'primary', disabled, loading }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) =>
    Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        onPressIn={() => animateTo(0.97)}
        onPressOut={() => animateTo(1)}
        style={[
          styles.base,
          variant === 'outline' ? styles.outline : styles.primary,
          (disabled || loading) && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'outline' ? colors.text : colors.secondary} />
        ) : (
          <Text style={variant === 'outline' ? styles.outlineText : styles.primaryText}>{title}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.5,
  },
  primaryText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '700',
  },
  outlineText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
