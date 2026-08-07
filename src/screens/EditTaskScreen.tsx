import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TasksStackParamList } from '../navigation/types';
import { colors } from '../theme';
import { useData } from '../context/DataContext';
import ScreenHeader from '../components/ScreenHeader';
import TaskForm from '../components/TaskForm';

type Props = NativeStackScreenProps<TasksStackParamList, 'EditTask'>;

export default function EditTaskScreen({ navigation, route }: Props) {
  const { tasks, updateTask, tagsForTask, recurrenceDaysForTask } = useData();
  const task = tasks.find((t) => t.id === route.params.taskId);

  if (!task) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScreenHeader title="Edit Task" onBack={navigation.goBack} />
        <Text style={styles.notFound}>Task not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Edit Task" onBack={navigation.goBack} />
      <TaskForm
        initial={task}
        initialTagIds={tagsForTask(task.id).map((t) => t.id)}
        initialRecurrenceDays={recurrenceDaysForTask(task.id)}
        submitLabel="Save Changes"
        onCancel={navigation.goBack}
        onSubmit={(values, tagIds, recurrenceDays) => {
          updateTask(task.id, values, tagIds, recurrenceDays);
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
