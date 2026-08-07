import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/types';
import { colors } from '../theme';
import { useData } from '../context/DataContext';
import ScreenHeader from '../components/ScreenHeader';
import PriorityForm from '../components/PriorityForm';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditPriority'>;

export default function EditPriorityScreen({ navigation, route }: Props) {
  const { priorities, updatePriority } = useData();
  const priority = priorities.find((p) => p.id === route.params.priorityId);

  if (!priority) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScreenHeader title="Edit Priority" onBack={navigation.goBack} />
        <Text style={styles.notFound}>Priority not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Edit Priority" onBack={navigation.goBack} />
      <PriorityForm
        initial={priority}
        submitLabel="Save Priority"
        onCancel={navigation.goBack}
        onSubmit={(values) => {
          updatePriority(priority.id, values);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textMuted,
  },
});
