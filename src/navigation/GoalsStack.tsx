import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { GoalsStackParamList } from './types';
import GoalsScreen from '../screens/GoalsScreen';
import GoalDetailScreen from '../screens/GoalDetailScreen';
import AddGoalScreen from '../screens/AddGoalScreen';
import EditGoalScreen from '../screens/EditGoalScreen';

const Stack = createNativeStackNavigator<GoalsStackParamList>();

export default function GoalsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GoalsList" component={GoalsScreen} />
      <Stack.Screen name="GoalDetail" component={GoalDetailScreen} />
      <Stack.Screen name="AddGoal" component={AddGoalScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="EditGoal" component={EditGoalScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
