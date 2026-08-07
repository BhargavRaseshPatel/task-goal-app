import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { GoalsStackParamList } from '../navigation/types';
import { colors } from '../theme';
import { useData } from '../context/DataContext';
import ScreenHeader from '../components/ScreenHeader';
import GoalForm from '../components/GoalForm';

type Props = NativeStackScreenProps<GoalsStackParamList, 'EditGoal'>;

export default function EditGoalScreen({ navigation, route }: Props) {
  const { goals, goalTasksFor, updateGoal } = useData();
  const goal = goals.find((g) => g.id === route.params.goalId);

  if (!goal) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScreenHeader title="Edit Goal" onBack={navigation.goBack} />
        <Text style={styles.notFound}>Goal not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Edit Goal" onBack={navigation.goBack} />
      <GoalForm
        initial={goal}
        initialLinks={goalTasksFor(goal.id).map((l) => ({ taskId: l.task_id, noOfTimes: l.no_of_times_task }))}
        submitLabel="Save Changes"
        onCancel={navigation.goBack}
        onSubmit={(values, links) => {
          updateGoal(goal.id, values, links);
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
