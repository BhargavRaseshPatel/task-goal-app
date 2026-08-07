import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CalendarStackParamList } from './types';
import CalendarScreen from '../screens/CalendarScreen';

const Stack = createNativeStackNavigator<CalendarStackParamList>();

export default function CalendarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarHome" component={CalendarScreen} />
    </Stack.Navigator>
  );
}
