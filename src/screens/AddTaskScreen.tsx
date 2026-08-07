import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TasksStackParamList } from '../navigation/types';
import { colors } from '../theme';
import { useData, MOCK_OWNER_ID } from '../context/DataContext';
import ScreenHeader from '../components/ScreenHeader';
import TaskForm from '../components/TaskForm';

type Props = NativeStackScreenProps<TasksStackParamList, 'AddTask'>;

export default function AddTaskScreen({ navigation }: Props) {
  const { addTask } = useData();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="New Task" onBack={navigation.goBack} />
      <TaskForm
        submitLabel="Save Task"
        onCancel={navigation.goBack}
        onSubmit={(values, tagIds, recurrenceDays) => {
          addTask({ ...values, user_id: MOCK_OWNER_ID }, tagIds, recurrenceDays);
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
