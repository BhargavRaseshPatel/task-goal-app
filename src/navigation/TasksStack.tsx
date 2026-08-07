import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { TasksStackParamList } from './types';
import TasksScreen from '../screens/TasksScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import EditTaskScreen from '../screens/EditTaskScreen';
import TaskDaysScreen from '../screens/TaskDaysScreen';
import ActivityLogsScreen from '../screens/ActivityLogsScreen';

const Stack = createNativeStackNavigator<TasksStackParamList>();

export default function TasksStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TasksList" component={TasksScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="EditTask" component={EditTaskScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="TaskDays" component={TaskDaysScreen} />
      <Stack.Screen name="ActivityLogs" component={ActivityLogsScreen} />
    </Stack.Navigator>
  );
}
