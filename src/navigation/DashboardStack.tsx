import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from './types';
import DashboardScreen from '../screens/DashboardScreen';
import DailyActivitiesScreen from '../screens/DailyActivitiesScreen';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export default function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="DailyActivities" component={DailyActivitiesScreen} />
    </Stack.Navigator>
  );
}
