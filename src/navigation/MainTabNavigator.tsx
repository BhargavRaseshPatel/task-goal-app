import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { MainTabParamList } from './types';
import { colors } from '../theme';
import DashboardStack from './DashboardStack';
import TasksStack from './TasksStack';
import CalendarStack from './CalendarStack';
import GoalsStack from './GoalsStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'home',
  Tasks: 'checkmark-circle',
  Calendar: 'calendar',
  Goals: 'trophy',
  Profile: 'person',
};

const LABELS: Record<keyof MainTabParamList, string> = {
  Dashboard: 'Home',
  Tasks: 'Tasks',
  Calendar: 'Calendar',
  Goals: 'Goals',
  Profile: 'Profile',
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabel: LABELS[route.name as keyof MainTabParamList],
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name as keyof MainTabParamList]} size={size - 4} color={color} />
        ),
        tabBarStyle: { height: 64, paddingBottom: 10, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Tasks" component={TasksStack} />
      <Tab.Screen name="Calendar" component={CalendarStack} />
      <Tab.Screen name="Goals" component={GoalsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
