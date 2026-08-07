import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import Input from '../components/Input';
import Button from '../components/Button';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditProfileScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const onSave = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    Alert.alert('Not connected yet', 'Profile editing needs a backend endpoint for updating account details — coming in a later pass.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Edit Profile" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarBlock}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.secondary} />
          </View>
        </View>

        <Input label="Full Name" value={name} onChangeText={setName} error={errors.name} leftIcon="person-outline" />
        <Input label="Email Address" value={email} onChangeText={setEmail} error={errors.email} leftIcon="mail-outline" autoCapitalize="none" />

        <Button title="Save" onPress={onSave} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  avatarBlock: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
