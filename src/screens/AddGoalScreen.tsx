import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { GoalsStackParamList } from '../navigation/types';
import { colors } from '../theme';
import { useData, MOCK_OWNER_ID } from '../context/DataContext';
import ScreenHeader from '../components/ScreenHeader';
import GoalForm from '../components/GoalForm';

type Props = NativeStackScreenProps<GoalsStackParamList, 'AddGoal'>;

export default function AddGoalScreen({ navigation }: Props) {
  const { addGoal } = useData();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Define Your Ambition" onBack={navigation.goBack} />
      <GoalForm
        submitLabel="Create Goal"
        onCancel={navigation.goBack}
        onSubmit={(values, links) => {
          addGoal({ ...values, user_id: MOCK_OWNER_ID }, links);
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
});
